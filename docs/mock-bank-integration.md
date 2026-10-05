# PayMerch Local Mock Bank Integration

This is a development-only demo payment system. The browser UI calls an API and never treats its own localStorage balance as authoritative. On Cloudflare, the API stores demo balances, issued QR tokens, and idempotency records in one Durable Object, so separate buyer and seller phones on different networks see the same simulated ledger. Netlify can host the static UI while calling the same Cloudflare Worker API. The local Node harness separately exercises the supplied framed TCP mock-bank protocol.

It does not move money, connect to PASA, or implement an acquiring-bank-certified ISO 8583 profile. The deployed Durable Object simulates approval/decline logic itself; it cannot reach the local TCP mock process.

## Run locally

In terminal 1:

```sh
npm run mock:bank
```

The mock binds to loopback only by default:

- HTTP gateway: `http://127.0.0.1:8780`
- Pipe-framed TCP bank simulator: `127.0.0.1:8583`

In terminal 2:

```sh
npm run dev
```

In development, the app points to the localhost HTTP gateway. For a local production-like frontend, set `VITE_PAYMENT_GATEWAY_URL=http://127.0.0.1:8780` before building and run the built static site locally.

## Test the transaction path

```sh
npm run test:mock-bank
```

The tests exercise a successful payment, an intentional decline for amounts ending in `.99`, altered payload rejection, duplicate-token rejection, and idempotent replay.

## Cloudflare: shared mock balances on phones

The root `wrangler.json` deploys the static Vite output and routes `/api/payments/*` to a Durable Object named `DemoLedger`. Its storage is the shared source of truth across phone browsers and survives Worker restarts. The app refreshes both demo balances every five seconds and applies the authorization response after a scan.

Before deploying, configure a private Worker secret (do not add it to Git):

```sh
npx wrangler secret put PAYMERCH_DEMO_HMAC_SECRET
```

Enter at least 32 random characters when prompted. The demo declines amounts ending in `.99` by default. You can override that behavior with a Worker variable `DEMO_DECLINE_SUFFIX`; set it to an empty value to disable the test decline.

Deploy with:

```sh
npm run deploy:cloudflare
```

Set the Cloudflare Workers Builds deploy command to `npm run deploy:cloudflare`; it builds `static-dist` and deploys the Worker. The first deployment applies the `v1` Durable Object migration. Cloudflare-hosted UI uses the same-origin Worker API automatically.

## Netlify frontend with shared Cloudflare API

Keep Netlify publishing `static-dist`. In Netlify environment variables set:

```text
VITE_PAYMENT_GATEWAY_URL=https://<your-worker-name>.<your-account>.workers.dev
```

On the Cloudflare Worker, set `CORS_ALLOWED_ORIGINS` to a comma-separated list containing the exact Netlify production URL and any preview URLs, for example `https://paymerch.example.com,https://deploy-preview-123--paymerch.netlify.app`. Redeploy both services after changing the variable. Do not use `*` for cross-origin access.

## Endpoints

`POST /api/payments/qr`

```json
{"amount":20,"buyerWallet":"wlt_buyer_demo"}
```

Returns a signed, two-minute QR payload. The local HMAC key defaults to a documented development-only value; override it with `BANK_MOCK_QR_SECRET` for isolated test environments.

`POST /api/payments/authorize`

Requires an `Idempotency-Key` UUID header and body:

```json
{"payload":{"ver":"1.0","txn_token":"...","buyer_wallet":"wlt_buyer_demo","amt":20,"cur":"ZAR","exp":0,"sig":"..."},"merchantWallet":"wlt_merchant_demo"}
```

The gateway verifies the signature and server-issued token, checks expiry and replay state, sends the request to the mock TCP server, validates the correlated response, and updates its in-memory demo balances only on approval.

## Important production boundary

The local Node TCP server cannot be deployed to Cloudflare Workers or run inside Netlify Functions as written: it binds a raw TCP listener, and the Worker runtime has no inbound TCP listener. It remains a local simulator. The Cloudflare Durable Object supplies shared, persistent simulated balances for cross-phone demos.

The pipe-delimited message is a test transport contract, not a packed or certified ISO 8583 message. Production integration requires the sponsoring bank's approved network profile, field definitions, bitmap/codec, framing, MAC/key management, TLS or private network controls, reversal/advice flows, settlement reconciliation, certification, and operational controls. Do not use demo balances to represent customer funds, wallet custody, KYC, bank authorization, settlement, or regulatory approval. Any device can access the public demo wallets; this setup is not authenticated or suitable for valuable data. Before production, replace the public demo API with authenticated identities, abuse controls, audited ledger invariants, durable idempotency and reconciliation, secrets rotation, monitoring, and a contracted/certified provider adapter.
