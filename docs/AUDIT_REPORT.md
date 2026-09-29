# Qmoosa Pi Engineering Audit Report

**Audit date:** 2026-09-29  
**Scope:** repository code, CI/CD, static deployment, backend API surface, Pi authentication/payment integration, Conway engine, x402/PQC/agentic claims, documentation and release automation.

## Executive result

The repository has a working static deployment pipeline and a substantially improved security baseline, but it should **not** yet be described as fully production/Mainnet operational. The principal remaining blockers are a separately deployed backend, real Pi Developer Portal credentials/verification, persistent payment state, real multi-model AI (if desired), real PQC implementation (if desired), and production observability/storage.

## Findings remediated in this audit

### Critical / high

1. **Frontend session credential exposure** — the UI rendered an authentication session token. Replaced with server-verified Pi identity and no credential rendering.
2. **Frontend/backend contract regression** — frontend used a hardcoded third-party/App Studio login endpoint instead of the repository backend contract. Replaced with configurable `NEXT_PUBLIC_PI_BACKEND_URL` and `/api/verify`.
3. **Destructive one-click deployment** — local finisher committed to `main` and force-pushed `gh-pages`. Replaced with non-destructive local verification; deployment stays in GitHub Actions.
4. **Fallback HMAC secret** — backend could sign integrity receipts with a known development fallback. Removed. Receipts are unavailable unless a sufficiently long secret is configured.
5. **Payment validation weakness** — approval/completion accepted a payment ID after user auth without first binding PaymentDTO ownership/direction. Added PaymentDTO fetch and authenticated `user_uid`, `user_to_app`, cancellation and txid-consistency checks.
6. **Misleading AI/PQC runtime claims** — scripted responses described live PQC validation/AI behavior. Endpoint now reports `mode: scripted-advisor` and `productionAI: false`.
7. **Placeholder token issuer published publicly** — removed custom token issuer declaration from `pi.toml` until a real token exists.

### Medium

8. CORS default was effectively permissive when `APP_ORIGIN` was absent. Default is now localhost-only and production origins must be explicitly configured.
9. Added request size limits, basic API rate limiting and baseline security headers.
10. CI dependency audits previously used non-blocking behavior. High-severity audits are now release-blocking.
11. Backend “tests” were syntax-only. Added deterministic Conway and HTTP API regression tests.
12. Next.js build configuration previously suppressed TypeScript/lint failures. Suppression was removed.

## Verified capabilities

- Qmoosa Pi repository rename is complete.
- GitHub Pages deployment has recorded a successful workflow run.
- Pi SDK is loaded in the frontend.
- Frontend requests `username` + `payments` scopes.
- Backend verifies Pi access tokens using `/v2/me`.
- Backend contains U2A approval/completion routes using server-side API-key auth.
- Conway B3/S23 implementation is deterministic and has automated regression coverage.
- x402 execution is disabled unless a real verifier URL is configured.
- Current integrity receipts are explicitly HMAC, not ML-DSA.
- Secret-like tracked files and misleading production claims are checked by CI.

## Not yet independently operational

- Pi authentication/payment on the live Pages frontend until a backend URL is wired into the build.
- Real Pi Sandbox/Testnet transaction evidence.
- Pi production/Mainnet app registration, domain verification, wallet approval and listing.
- Durable database-backed payment/order state and idempotent feature delivery.
- Production multi-model AI inference.
- Real ML-DSA/ML-KEM cryptographic operations.
- Real x402 settlement verifier/facilitator.
- Production-grade distributed rate limiting, centralized logs, alerting and backup/restore.

## Release rule

Do not use “all features active”, “Mainnet operational”, “PQC active”, “x402 settled”, or “production multi-model AI” unless the corresponding external/runtime verification has actually passed.
