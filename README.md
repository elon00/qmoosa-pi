# Qmoosa Pi

Qmoosa Pi is a Pi-native web application with server-verified Pioneer authentication, a User-to-App (U2A) payment handshake, a deterministic Conway B3/S23 computation service, and clearly separated experimental agentic, x402, and post-quantum research modules.

## Current verified status

| Area | Status |
|---|---|
| Repository name | **Qmoosa Pi** / `elon00/qmoosa-pi` |
| GitHub Pages static deployment | **Active** |
| Build + TypeScript CI | **Automated** |
| Backend regression tests | **Automated** |
| Secret / misleading-claim gates | **Automated** |
| High-severity dependency audit | **Blocking CI gate** |
| Pi SDK frontend integration | **Implemented** |
| Pi identity verification via backend `/v2/me` | **Implemented; requires deployed backend** |
| Pi U2A approve/complete handshake | **Implemented; requires Server API Key + Pi app configuration** |
| Conway B3/S23 | **Implemented + regression tested; state currently in-memory** |
| AI agent endpoint | **Rules-based advisor only; no production multi-model provider yet** |
| PQC | **Architecture/adapter target only; real ML-DSA/ML-KEM signing not enabled** |
| x402 | **Disabled by default until a real settlement verifier is configured** |
| Custom token | **Not declared as active; no placeholder issuer is published** |
| Pi Mainnet approval/listing | **External / not yet verified** |

## Live frontend

GitHub Pages:

`https://elon00.github.io/qmoosa-pi/`

GitHub Pages hosts only the static frontend. It **does not run the Express backend**. Set `NEXT_PUBLIC_PI_BACKEND_URL` at build time to the deployed backend URL before claiming Pi authentication or payments are operational.

## Architecture

```
Pi Browser
   |
   v
Next.js static frontend
   |
   |-- window.Pi.authenticate(["username", "payments"])
   |-- window.Pi.createPayment(...)
   |
   v
Qmoosa Pi backend (separate runtime)
   |
   |-- GET Pi Platform /v2/me
   |-- POST Pi Platform /payments/{id}/approve
   |-- POST Pi Platform /payments/{id}/complete
   |-- Conway B3/S23 API
   |-- rules-based advisor API
   |-- x402 verifier adapter (disabled by default)
   |
   +-- future: PostgreSQL / Redis / observability
```

Official Pi guidance requires the frontend SDK and backend Platform API to work together: the backend verifies the access token and performs payment approval/completion. Server API keys must never be exposed in frontend code.

## Local development

```bash
pnpm install
pnpm run doctor
pnpm run dev
```

Backend:

```bash
cd backend
npm ci
npm test
npm start
```

Create `backend/.env` from `backend/.env.example`. Never commit the real `PI_API_KEY`, HMAC key, verifier tokens, or wallet secrets.

## One-click verification

Safe local verification:

```bash
pnpm run finish
```

This command runs repository checks, TypeScript, backend tests and the production export. It intentionally **does not** commit, push, force-push, change account settings, spend Pi, or pretend external approvals are complete.

The GitHub Actions workflow **Qmoosa Pi One-Click Finisher** provides the reviewable CI/deployment path.

## Security posture

Key protections now include:

- server-side Pioneer verification
- payment ownership/direction/transaction consistency checks
- restrictive production CORS configuration via `APP_ORIGIN`
- request-body limit and basic rate limiting
- no fallback production integrity secret
- secret-file and misleading-claim CI gates
- blocking high-severity dependency audits
- x402 disabled until a real verifier is configured
- explicit separation of HMAC integrity receipts from real PQC

See [SECURITY.md](./SECURITY.md), [docs/AUDIT_REPORT.md](./docs/AUDIT_REPORT.md), and [docs/PRODUCTION_READINESS.md](./docs/PRODUCTION_READINESS.md).

## Remaining external production gates

The repository cannot truthfully mark these complete without the relevant external account state:

1. Deploy the Express backend and configure its public URL.
2. Configure `NEXT_PUBLIC_PI_BACKEND_URL` in the frontend build.
3. Register/configure the correct Pi app in Developer Portal.
4. Store the real `PI_API_KEY` only in backend secrets.
5. Replace `validation-key.txt` with the exact Developer Portal validation key and verify the production domain.
6. Run a real Pi Browser Sandbox/Testnet authentication and U2A payment.
7. Add persistent payment/order storage and idempotent fulfillment.
8. Complete monitoring, backup/restore, mobile QA and Mainnet/listing approvals.
9. Add a real multi-model provider before describing the advisor as production AI.
10. Add a reviewed ML-DSA/ML-KEM implementation before describing the application security layer as PQC-active.

## License

MIT. See [LICENSE](./LICENSE).
