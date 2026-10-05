import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const serverFile = fileURLToPath(new URL("../mock-bank-server.mjs", import.meta.url));
let child;
let gatewayUrl;

async function unusedPort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function issue(amount) {
  const response = await fetch(`${gatewayUrl}/api/payments/qr`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ amount, buyerWallet: "wlt_buyer_demo" }),
  });
  const body = await response.json();
  assert.equal(response.status, 201, JSON.stringify(body));
  return body.payload;
}

async function authorize(payload, idempotencyKey = crypto.randomUUID()) {
  const response = await fetch(`${gatewayUrl}/api/payments/authorize`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": idempotencyKey,
    },
    body: JSON.stringify({ payload, merchantWallet: "wlt_merchant_demo" }),
  });
  return { status: response.status, body: await response.json() };
}

before(async () => {
  const bankPort = await unusedPort();
  const httpPort = await unusedPort();
  child = spawn(process.execPath, [serverFile], {
    cwd: projectRoot,
    env: {
      ...process.env,
      BANK_MOCK_HOST: "127.0.0.1",
      BANK_MOCK_PORT: String(bankPort),
      PAYMERCH_MOCK_HOST: "127.0.0.1",
      PAYMERCH_MOCK_PORT: String(httpPort),
      BANK_MOCK_QR_SECRET: "integration-test-secret",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  gatewayUrl = `http://127.0.0.1:${httpPort}`;

  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Mock gateway exited early: ${output}`);
    try {
      const response = await fetch(`${gatewayUrl}/api/payments/authorize`, { method: "GET" });
      if (response.status === 405) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  child.kill();
  throw new Error(`Mock gateway did not start: ${output}`);
});

after(async () => {
  if (!child || child.exitCode !== null) return;
  child.kill();
  await once(child, "exit");
});

test("approves valid amount through framed TCP bank exchange", async () => {
  const result = await authorize(await issue(20));
  assert.equal(result.status, 200);
  assert.equal(result.body.status, "APPROVED");
  assert.equal(result.body.actionCode, "00");
  assert.equal(result.body.amount, 20);
  assert.ok(result.body.authorizationCode);
});

test("balance endpoint reflects buyer debit and merchant credit for another session", async () => {
  const beforeResponse = await fetch(`${gatewayUrl}/api/payments/balance`);
  const before = await beforeResponse.json();
  const authorization = await authorize(await issue(20));
  assert.equal(authorization.body.status, "APPROVED");
  const afterResponse = await fetch(`${gatewayUrl}/api/payments/balance`);
  const after = await afterResponse.json();
  assert.equal(after.buyerBalance, before.buyerBalance - 20);
  assert.equal(after.merchantBalance, before.merchantBalance + 20);
});

test("exposes the same server-side demo balances to other app sessions", async () => {
  const before = await fetch(`${gatewayUrl}/api/payments/balance`).then((response) => response.json());
  const result = await authorize(await issue(20));
  assert.equal(result.body.status, "APPROVED");
  const after = await fetch(`${gatewayUrl}/api/payments/balance`).then((response) => response.json());
  assert.equal(after.buyerBalance, before.buyerBalance - 20);
  assert.equal(after.merchantBalance, before.merchantBalance + 20);
});

test("mock bank returns insufficient-funds response for amounts ending in 99 cents", async () => {
  const result = await authorize(await issue(1.99));
  assert.equal(result.status, 200);
  assert.equal(result.body.status, "DECLINED");
  assert.equal(result.body.actionCode, "51");
});

test("rejects tampered payloads before forwarding them to the bank", async () => {
  const payload = await issue(12);
  payload.amt = 99;
  const result = await authorize(payload);
  assert.equal(result.status, 400);
  assert.match(result.body.error, /signature/i);
});

test("rejects token replay under a different idempotency key", async () => {
  const payload = await issue(5);
  assert.equal((await authorize(payload)).body.status, "APPROVED");
  const replay = await authorize(payload);
  assert.equal(replay.status, 409);
});

test("returns the original authorization for a retried idempotency key", async () => {
  const payload = await issue(7);
  const idempotencyKey = crypto.randomUUID();
  const first = await authorize(payload, idempotencyKey);
  const retry = await authorize(payload, idempotencyKey);
  assert.equal(first.status, 200);
  assert.deepEqual(retry, first);
});
