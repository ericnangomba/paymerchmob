import { neon } from "@neondatabase/serverless";

type DbClient = ReturnType<typeof neon>;

let ready: Promise<DbClient> | undefined;

export async function getDb(): Promise<DbClient> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("Vercel DATABASE_URL environment variable is not configured");
  if (!ready) {
    ready = (async () => {
      const sql = neon(databaseUrl);
      await sql`CREATE TABLE IF NOT EXISTS paymerch_demo_wallets (
        wallet_id text PRIMARY KEY,
        balance_cents bigint NOT NULL CHECK (balance_cents >= 0),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`INSERT INTO paymerch_demo_wallets (wallet_id, balance_cents)
        VALUES ('wlt_buyer_demo', 125000), ('wlt_merchant_demo', 482050)
        ON CONFLICT (wallet_id) DO NOTHING`;
      await sql`CREATE TABLE IF NOT EXISTS paymerch_demo_qr_tokens (
        token text PRIMARY KEY,
        payload jsonb NOT NULL,
        status text NOT NULL CHECK (status IN ('ISSUED', 'PROCESSING', 'CONSUMED', 'EXPIRED')),
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS paymerch_demo_idempotency (
        idempotency_key text PRIMARY KEY,
        token text NOT NULL,
        result jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS paymerch_demo_transactions (
        transaction_id text PRIMARY KEY,
        token text UNIQUE NOT NULL,
        buyer_wallet text NOT NULL,
        merchant_wallet text NOT NULL,
        amount_cents bigint NOT NULL CHECK (amount_cents > 0),
        status text NOT NULL CHECK (status IN ('APPROVED', 'DECLINED')),
        action_code text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      return sql;
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
  }
  return ready;
}

export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

export const methodNotAllowed = () => json({ error: "Method not allowed" }, 405);

export async function readJson(request: Request) {
  const text = await request.text();
  if (text.length > 8192) throw new Error("Request body too large");
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Request body must be a JSON object");
  return value as Record<string, unknown>;
}

export function cents(amount: unknown): number {
  const value = Number(amount);
  const result = Math.round(value * 100);
  if (!Number.isSafeInteger(result) || result <= 0 || Math.abs(value * 100 - result) > 1e-7) {
    throw new Error("Amount must be positive and have at most two decimal places");
  }
  return result;
}