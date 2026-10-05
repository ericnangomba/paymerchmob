import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer as createHttpServer } from "node:http";
import { createServer as createTcpServer, createConnection } from "node:net";

const HTTP_HOST = process.env.PAYMERCH_MOCK_HOST || "127.0.0.1";
const HTTP_PORT = Number(process.env.PAYMERCH_MOCK_PORT || 8780);
const BANK_HOST = process.env.BANK_MOCK_HOST || "127.0.0.1";
const BANK_PORT = Number(process.env.BANK_MOCK_PORT || 8583);
const QR_SECRET = process.env.BANK_MOCK_QR_SECRET || "local-only-paymerch-mock-secret-change-before-use";
const MAX_FRAME_BYTES = 8192;
const TOKEN_TTL_SECONDS = 120;
const DECLINE_SUFFIX = process.env.BANK_MOCK_DECLINE_SUFFIX ?? "99";

const issuedTokens = new Map();
const idempotentResults = new Map();
const buyerBalances = new Map([["wlt_buyer_demo", 125000]]);
const merchantBalances = new Map([["wlt_merchant_demo", 482050]]);

function centsFromAmount(amount) {
  const cents = Math.round(Number(amount) * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0 || Math.abs(Number(amount) * 100 - cents) > 1e-7) {
    throw new Error("Amount must be a positive value with at most two decimal places");
  }
  return cents;
}

function signPayload(payload) {
  const canonical = JSON.stringify({
    ver: payload.ver,
    txn_token: payload.txn_token,
    buyer_wallet: payload.buyer_wallet,
    amt: payload.amt,
    cur: payload.cur,
    exp: payload.exp,
  });
  return createHmac("sha256", QR_SECRET).update(canonical).digest("hex");
}

function isValidSignature(payload) {
  if (typeof payload?.sig !== "string" || !/^[a-f0-9]{64}$/.test(payload.sig)) return false;
  const supplied = Buffer.from(payload.sig, "hex");
  const expected = Buffer.from(signPayload(payload), "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function frame(body) {
  const bodyBuffer = Buffer.from(body, "ascii");
  if (bodyBuffer.length > MAX_FRAME_BYTES) throw new Error("ISO mock frame exceeds size limit");
  return Buffer.concat([Buffer.from(String(bodyBuffer.length).padStart(4, "0"), "ascii"), bodyBuffer]);
}

function parseRequestFrame(body) {
  const fields = body.split("|");
  if (fields.length !== 11) throw new Error("Expected 11 pipe-delimited request fields");
  const [mti, de3, de4, de11, de12, de24, de32, de43, de49, de102, de103] = fields;
  if (mti !== "0200") throw new Error("Unsupported MTI");
  if (!/^\d{6}$/.test(de3) || !/^\d{12}$/.test(de4) || !/^\d{6}$/.test(de11)) throw new Error("Invalid numeric ISO fields");
  if (!/^\d{6}$/.test(de12) || !/^\d{3}$/.test(de24) || !/^\d{6}$/.test(de32)) throw new Error("Invalid routing ISO fields");
  if (!/^\d{3}$/.test(de49) || de49 !== "710") throw new Error("Unsupported currency; expected ZAR (710)");
  if (!/^[a-zA-Z0-9_-]{1,28}$/.test(de102) || !/^[a-zA-Z0-9_-]{1,28}$/.test(de103)) throw new Error("Invalid account identifiers");
  if (/[|\x00-\x1f]/.test(de43) || Buffer.byteLength(de43, "ascii") > 40) throw new Error("Invalid merchant name/location");
  return { mti, de3, de4, de11, de12, de24, de32, de43, de49, de102, de103 };
}

function parseResponseFrame(body, request) {
  const fields = body.split("|");
  if (fields.length !== 13 || fields[0] !== "0210") throw new Error("Malformed mock-bank response");
  const [, de3, de4, de11, de12, de24, de32, de43, de49, de38, de39, de102, de103] = fields;
  if (
    de3 !== request.de3 || de4 !== request.de4 || de11 !== request.de11 ||
    de12 !== request.de12 || de24 !== request.de24 || de32 !== request.de32 ||
    de43 !== request.de43 || de49 !== request.de49 || de102 !== request.de102 ||
    de103 !== request.de103 || !/^(00|51)$/.test(de39)
  ) throw new Error("Mock-bank response did not match the request");
  return { actionCode: de39, authCode: de38.trim() };
}

function sendBankMessage(requestBody) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    let settled = false;
    const socket = createConnection({ host: BANK_HOST, port: BANK_PORT });
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      error ? reject(error) : resolve(result);
    };

    socket.setTimeout(3000, () => finish(new Error("Mock bank timed out")));
    socket.once("connect", () => socket.write(frame(requestBody)));
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length < 4) return;
      const header = buffer.subarray(0, 4).toString("ascii");
      if (!/^\d{4}$/.test(header)) return finish(new Error("Invalid mock-bank response frame header"));
      const expectedLength = Number(header);
      if (expectedLength <= 0 || expectedLength > MAX_FRAME_BYTES) return finish(new Error("Invalid mock-bank response frame length"));
      if (buffer.length < expectedLength + 4) return;
      if (buffer.length !== expectedLength + 4) return finish(new Error("Unexpected extra data in mock-bank response"));
      const responseBody = buffer.subarray(4).toString("ascii");
      try {
        finish(null, parseResponseFrame(responseBody, parseRequestFrame(requestBody)));
      } catch (error) {
        finish(error);
      }
    });
    socket.once("error", (error) => finish(error));
  });
}

function bankRequest(payload, merchantWallet) {
  const amountCents = centsFromAmount(payload.amt);
  const stan = String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
  const now = new Date();
  const time = `${String(now.getUTCHours()).padStart(2, "0")}${String(now.getUTCMinutes()).padStart(2, "0")}${String(now.getUTCSeconds()).padStart(2, "0")}`;
  const safeMerchant = "PAYMERCH DEMO MERCHANT CAPE TOWN ZA".padEnd(40, " ").slice(0, 40);
  return ["0200", "990000", String(amountCents).padStart(12, "0"), stan, time, "204", "400001", safeMerchant, "710", payload.buyer_wallet, merchantWallet].join("|");
}

function sendJson(response, status, body, origin) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...(origin ? { "access-control-allow-origin": origin, vary: "Origin" } : {}),
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > 8192) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try { resolve(JSON.parse(raw)); } catch { reject(new Error("Request body must be valid JSON")); }
    });
    request.on("error", reject);
  });
}

function allowedOrigin(value) {
  if (!value) return "";
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(value) ? value : null;
}

function createPaymentServer() {
  return createHttpServer(async (request, response) => {
    const origin = allowedOrigin(request.headers.origin);
    if (origin === null) return sendJson(response, 403, { error: "Mock gateway only accepts localhost browser origins" });
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type, idempotency-key",
        ...(origin ? { "access-control-allow-origin": origin, vary: "Origin" } : {}),
      });
      return response.end();
    }

    try {
      if (request.method === "GET" && request.url === "/api/payments/balance") {
        return sendJson(response, 200, {
          buyerBalance: (buyerBalances.get("wlt_buyer_demo") ?? 125000) / 100,
          merchantBalance: (merchantBalances.get("wlt_merchant_demo") ?? 482050) / 100,
          currency: "ZAR",
          demo: true,
        }, origin);
      }
      if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" }, origin);
      const body = await readJson(request);

      if (request.url === "/api/payments/qr") {
        const amountCents = centsFromAmount(body.amount);
        const buyerWallet = body.buyerWallet ?? "wlt_buyer_demo";
        if (!/^wlt_[a-zA-Z0-9_-]{1,24}$/.test(buyerWallet)) return sendJson(response, 400, { error: "Invalid buyer wallet id" }, origin);
        const payload = {
          ver: "1.0",
          txn_token: `pm_${randomBytes(16).toString("hex")}`,
          buyer_wallet: buyerWallet,
          amt: amountCents / 100,
          cur: "ZAR",
          exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
        };
        payload.sig = signPayload(payload);
        issuedTokens.set(payload.txn_token, { payload, state: "ISSUED" });
        return sendJson(response, 201, { payload }, origin);
      }

      if (request.url === "/api/payments/authorize") {
        const payload = body.payload;
        const merchantWallet = body.merchantWallet ?? "wlt_merchant_demo";
        const idempotencyKey = request.headers["idempotency-key"];
        if (typeof idempotencyKey !== "string" || !/^[a-f0-9-]{16,64}$/i.test(idempotencyKey)) {
          return sendJson(response, 400, { error: "A UUID idempotency key is required" }, origin);
        }
        if (!/^wlt_[a-zA-Z0-9_-]{1,24}$/.test(merchantWallet)) return sendJson(response, 400, { error: "Invalid merchant wallet id" }, origin);
        if (!isValidSignature(payload)) return sendJson(response, 400, { error: "QR signature is invalid" }, origin);

        const idempotencyRecord = idempotentResults.get(idempotencyKey);
        if (idempotencyRecord) {
          if (idempotencyRecord.token !== payload.txn_token) return sendJson(response, 409, { error: "Idempotency key reused for another QR" }, origin);
          return sendJson(response, 200, idempotencyRecord.result, origin);
        }

        const record = issuedTokens.get(payload.txn_token);
        if (!record || JSON.stringify(record.payload) !== JSON.stringify(payload)) return sendJson(response, 409, { error: "QR was not issued by this mock gateway" }, origin);
        if (record.state !== "ISSUED") return sendJson(response, 409, { error: "QR has already been submitted" }, origin);
        if (Math.floor(Date.now() / 1000) >= payload.exp) {
          record.state = "EXPIRED";
          return sendJson(response, 410, { error: "QR has expired" }, origin);
        }

        record.state = "PROCESSING";
        const requestBody = bankRequest(payload, merchantWallet);
        const requestHash = createHmac("sha256", QR_SECRET).update(requestBody).digest("hex");
        try {
          const bankResult = await sendBankMessage(requestBody);
          const amountCents = centsFromAmount(payload.amt);
          const buyerCents = buyerBalances.get(payload.buyer_wallet) ?? 125000;
          const approved = bankResult.actionCode === "00" && buyerCents >= amountCents;
          const result = approved
            ? {
                status: "APPROVED",
                actionCode: "00",
                authorizationCode: bankResult.authCode,
                transactionId: `demo_${randomBytes(12).toString("hex")}`,
                amount: payload.amt,
                currency: "ZAR",
                message: "Mock sponsoring bank approved this demo transaction",
                requestReference: requestHash.slice(0, 16),
              }
            : {
                status: "DECLINED",
                actionCode: bankResult.actionCode === "00" ? "51" : bankResult.actionCode,
                authorizationCode: "",
                transactionId: `demo_${randomBytes(12).toString("hex")}`,
                amount: payload.amt,
                currency: "ZAR",
                message: bankResult.actionCode === "51" ? "Mock bank declined: insufficient funds test rule" : "Mock buyer balance insufficient",
                requestReference: requestHash.slice(0, 16),
              };

          if (approved) {
            buyerBalances.set(payload.buyer_wallet, buyerCents - amountCents);
            merchantBalances.set(merchantWallet, (merchantBalances.get(merchantWallet) ?? 0) + amountCents);
            result.buyerBalance = buyerBalances.get(payload.buyer_wallet) / 100;
            result.merchantBalance = merchantBalances.get(merchantWallet) / 100;
          }
          record.state = "CONSUMED";
          idempotentResults.set(idempotencyKey, { token: payload.txn_token, result });
          return sendJson(response, 200, result, origin);
        } catch (error) {
          record.state = "ISSUED";
          return sendJson(response, 502, { error: `Mock bank unavailable: ${error.message}` }, origin);
        }
      }

      return sendJson(response, 404, { error: "Endpoint not found" }, origin);
    } catch (error) {
      return sendJson(response, 400, { error: error.message || "Invalid request" }, origin);
    }
  });
}

function createBankServer() {
  return createTcpServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.setTimeout(5000, () => socket.destroy());
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 4) {
        const header = buffer.subarray(0, 4).toString("ascii");
        if (!/^\d{4}$/.test(header)) return socket.destroy(new Error("Invalid frame length header"));
        const length = Number(header);
        if (length <= 0 || length > MAX_FRAME_BYTES) return socket.destroy(new Error("Frame length outside allowed range"));
        if (buffer.length < length + 4) return;
        const bodyBuffer = buffer.subarray(4, length + 4);
        buffer = buffer.subarray(length + 4);
        if ([...bodyBuffer].some((byte) => byte > 0x7f)) return socket.destroy(new Error("Mock protocol only accepts ASCII"));

        try {
          const tx = parseRequestFrame(bodyBuffer.toString("ascii"));
          const actionCode = DECLINE_SUFFIX && tx.de4.endsWith(DECLINE_SUFFIX) ? "51" : "00";
          const authCode = actionCode === "00" ? randomBytes(3).toString("hex").toUpperCase() : "000000";
          const responseBody = ["0210", tx.de3, tx.de4, tx.de11, tx.de12, tx.de24, tx.de32, tx.de43, tx.de49, authCode, actionCode, tx.de102, tx.de103].join("|");
          setTimeout(() => {
            if (!socket.destroyed) socket.write(frame(responseBody));
          }, 100);
        } catch (error) {
          console.warn(`[mock-bank] rejected message: ${error.message}`);
          socket.destroy();
          return;
        }
      }
    });
    socket.on("error", (error) => console.warn(`[mock-bank] socket error: ${error.message}`));
  });
}

const bank = createBankServer();
const gateway = createPaymentServer();
bank.listen(BANK_PORT, "127.0.0.1", () => console.log(`[mock-bank] Custom framed TCP simulator listening on 127.0.0.1:${BANK_PORT}`));
gateway.listen(HTTP_PORT, HTTP_HOST, () => console.log(`[mock-bank] Local HTTP test gateway listening on http://${HTTP_HOST}:${HTTP_PORT}`));

function shutdown() {
  gateway.close();
  bank.close();
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
