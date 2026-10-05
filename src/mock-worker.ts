interface DemoEnv {
  DEMO_LEDGER: DurableObjectNamespace;
  ASSETS: { fetch(request: Request): Promise<Response> };
  PAYMERCH_DEMO_HMAC_SECRET?: string;
  CORS_ALLOWED_ORIGINS?: string;
  DEMO_DECLINE_SUFFIX?: string;
}

interface DurableObjectNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
}

interface DurableObjectState {
  storage: {
    get<T>(key: string): Promise<T | undefined>;
    put<T>(key: string, value: T): Promise<void>;
  };
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
}

type QrPayload = {
  ver: "1.0";
  txn_token: string;
  buyer_wallet: string;
  amt: number;
  cur: "ZAR";
  exp: number;
  sig: string;
};

type LedgerTransaction = {
  status: "APPROVED" | "DECLINED";
  actionCode: "00" | "51";
  authorizationCode: string;
  transactionId: string;
  amount: number;
  currency: "ZAR";
  message: string;
  buyerBalance?: number;
  merchantBalance?: number;
  createdAt: number;
};

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

function normalizeOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function getCorsOrigin(request: Request, env: DemoEnv): string | null {
  const origin = normalizeOrigin(request.headers.get("origin"));
  if (!origin) return null;
  const allowed = (env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowed.includes(origin)) return origin;
  return null;
}

function cents(amount: unknown): number {
  const value = Number(amount);
  const result = Math.round(value * 100);
  if (!Number.isSafeInteger(result) || result <= 0 || Math.abs(value * 100 - result) > 1e-7) {
    throw new Error("Amount must be positive and have at most two decimal places");
  }
  return result;
}

function randomHex(size: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmac(payload: Omit<QrPayload, "sig">, secret: string): Promise<string> {
  const canonical = JSON.stringify({
    ver: payload.ver,
    txn_token: payload.txn_token,
    buyer_wallet: payload.buyer_wallet,
    amt: payload.amt,
    cur: payload.cur,
    exp: payload.exp,
  });
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonical)));
  return Array.from(signature, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function equalHex(left: string, right: string): boolean {
  if (left.length !== right.length || !/^[a-f0-9]+$/.test(left) || !/^[a-f0-9]+$/.test(right)) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 8192) throw new Error("Request body too large");
  const value = JSON.parse(text) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Request body must be a JSON object");
  return value as Record<string, unknown>;
}

export class DemoLedger {
  private readonly state: DurableObjectState;
  private readonly env: DemoEnv;

  constructor(state: DurableObjectState, env: DemoEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    return this.state.blockConcurrencyWhile(() => this.handleRequest(request));
  }

  private async handleRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/balance" && request.method === "GET") {
        const buyerBalance = await this.getBalance("wlt_buyer_demo");
        const merchantBalance = await this.getBalance("wlt_merchant_demo");
        return json({ buyerBalance: buyerBalance / 100, merchantBalance: merchantBalance / 100, currency: "ZAR", demo: true });
      }
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      const secret = this.env.PAYMERCH_DEMO_HMAC_SECRET;
      if (!secret || secret.length < 32) return json({ error: "Demo HMAC secret is not configured (minimum 32 characters)" }, 503);

      if (url.pathname === "/issue") {
        const body = await readJson(request);
        const amountCents = cents(body.amount);
        const buyerWallet = body.buyerWallet;
        if (buyerWallet !== "wlt_buyer_demo") return json({ error: "Unknown demo buyer wallet" }, 400);
        const balance = await this.getBalance(buyerWallet);
        if (amountCents > balance) return json({ error: "Buyer has insufficient demo funds" }, 409);
        const unsignedPayload: Omit<QrPayload, "sig"> = {
          ver: "1.0",
          txn_token: `pm_${randomHex(16)}`,
          buyer_wallet: buyerWallet,
          amt: amountCents / 100,
          cur: "ZAR",
          exp: Math.floor(Date.now() / 1000) + 120,
        };
        const payload: QrPayload = { ...unsignedPayload, sig: await hmac(unsignedPayload, secret) };
        await this.state.storage.put(`token:${payload.txn_token}`, { payload, status: "ISSUED" });
        return json({ payload }, 201);
      }

      if (url.pathname === "/authorize") {
        const body = await readJson(request);
        const payload = body.payload as QrPayload | undefined;
        const idempotencyKey = request.headers.get("idempotency-key") ?? "";
        if (!/^[a-f0-9-]{16,64}$/i.test(idempotencyKey)) return json({ error: "A UUID idempotency key is required" }, 400);
        if (!payload || typeof payload !== "object") return json({ error: "QR payload is required" }, 400);
        if (body.merchantWallet !== "wlt_merchant_demo") return json({ error: "Unknown demo merchant wallet" }, 400);
        const unsignedPayload = {
          ver: payload.ver,
          txn_token: payload.txn_token,
          buyer_wallet: payload.buyer_wallet,
          amt: payload.amt,
          cur: payload.cur,
          exp: payload.exp,
        };
        if (payload.ver !== "1.0" || payload.cur !== "ZAR" || payload.buyer_wallet !== "wlt_buyer_demo" || !/^pm_[a-f0-9]{32}$/.test(payload.txn_token)) {
          return json({ error: "Invalid QR payload" }, 400);
        }
        if (!equalHex(payload.sig, await hmac(unsignedPayload, secret))) return json({ error: "QR signature is invalid" }, 400);

        const idempotencyRecord = await this.state.storage.get<{ token: string; result: LedgerTransaction }>(`idempotency:${idempotencyKey}`);
        if (idempotencyRecord) {
          if (idempotencyRecord.token !== payload.txn_token) return json({ error: "Idempotency key reused for a different QR" }, 409);
          return json(idempotencyRecord.result);
        }

        const tokenRecord = await this.state.storage.get<{ payload: QrPayload; status: string }>(`token:${payload.txn_token}`);
        if (!tokenRecord || JSON.stringify(tokenRecord.payload) !== JSON.stringify(payload)) return json({ error: "QR was not issued by this demo ledger" }, 409);
        if (tokenRecord.status !== "ISSUED") return json({ error: "QR has already been submitted" }, 409);
        if (Math.floor(Date.now() / 1000) >= payload.exp) {
          await this.state.storage.put(`token:${payload.txn_token}`, { ...tokenRecord, status: "EXPIRED" });
          return json({ error: "QR has expired" }, 410);
        }

        await this.state.storage.put(`token:${payload.txn_token}`, { ...tokenRecord, status: "PROCESSING" });
        const amountCents = cents(payload.amt);
        const buyerCents = await this.getBalance(payload.buyer_wallet);
        const merchantCents = await this.getBalance("wlt_merchant_demo");
        const declineSuffix = this.env.DEMO_DECLINE_SUFFIX ?? "99";
        const forcedDecline = declineSuffix.length > 0 && String(amountCents).endsWith(declineSuffix);
        const approved = !forcedDecline && amountCents <= buyerCents;
        let result: LedgerTransaction;

        if (approved) {
          const nextBuyer = buyerCents - amountCents;
          const nextMerchant = merchantCents + amountCents;
          await this.state.storage.put("balance:wlt_buyer_demo", nextBuyer);
          await this.state.storage.put("balance:wlt_merchant_demo", nextMerchant);
          result = {
            status: "APPROVED",
            actionCode: "00",
            authorizationCode: randomHex(3).toUpperCase(),
            transactionId: `demo_${randomHex(12)}`,
            amount: amountCents / 100,
            currency: "ZAR",
            message: "Shared Cloudflare demo ledger approved this simulated payment",
            buyerBalance: nextBuyer / 100,
            merchantBalance: nextMerchant / 100,
            createdAt: Date.now(),
          };
        } else {
          result = {
            status: "DECLINED",
            actionCode: forcedDecline ? "51" : "51",
            authorizationCode: "",
            transactionId: `demo_${randomHex(12)}`,
            amount: amountCents / 100,
            currency: "ZAR",
            message: forcedDecline ? "Mock bank decline test: amount ends in .99" : "Buyer has insufficient demo funds",
            createdAt: Date.now(),
          };
        }

        await this.state.storage.put(`token:${payload.txn_token}`, { ...tokenRecord, status: "CONSUMED" });
        await this.state.storage.put(`idempotency:${idempotencyKey}`, { token: payload.txn_token, result });
        return json(result);
      }

      return json({ error: "Endpoint not found" }, 404);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Invalid request" }, 400);
    }
  }

  private async getBalance(wallet: string): Promise<number> {
    const stored = await this.state.storage.get<number>(`balance:${wallet}`);
    if (stored !== undefined) return stored;
    const initial = wallet === "wlt_buyer_demo" ? 125000 : 482050;
    await this.state.storage.put(`balance:${wallet}`, initial);
    return initial;
  }
}

const worker = {
  async fetch(request: Request, env: DemoEnv): Promise<Response> {
    const url = new URL(request.url);
    const origin = normalizeOrigin(request.headers.get("origin"));
    const allowedOrigin = getCorsOrigin(request, env);
    const isSameOrigin = origin === url.origin;
    const corsHeaders: HeadersInit = !origin || isSameOrigin ? {} : allowedOrigin ? { "access-control-allow-origin": allowedOrigin, vary: "Origin" } : {};

    if (origin && !isSameOrigin && !allowedOrigin) return json({ error: "Origin is not allowed; configure CORS_ALLOWED_ORIGINS" }, 403);
    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: { ...corsHeaders, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type, idempotency-key", "access-control-max-age": "86400" } });
    }

    if (url.pathname.startsWith("/api/")) {
      if (request.method !== "POST" && !(request.method === "GET" && url.pathname === "/api/payments/balance")) {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }
      const id = env.DEMO_LEDGER.idFromName("paymerch-demo-ledger-v1");
      const stub = env.DEMO_LEDGER.get(id);
      const internalPath = url.pathname === "/api/payments/qr"
        ? "/issue"
        : url.pathname === "/api/payments/authorize"
          ? "/authorize"
          : url.pathname === "/api/payments/balance"
            ? "/balance"
            : "/not-found";
      const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
      const internalRequest = new Request(`https://ledger.internal${internalPath}`, {
        method: request.method,
        headers: request.headers,
        ...(body ? { body } : {}),
      });
      return stub.fetch(internalRequest).then(async (response) => {
        const headers = new Headers(response.headers);
        new Headers(corsHeaders).forEach((value, key) => headers.set(key, value));
        return new Response(response.body, { status: response.status, headers });
      });
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
