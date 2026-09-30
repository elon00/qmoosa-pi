# Qmoosa Pi Production & Mainnet Readiness

Status legend: **DONE**, **CODE-READY**, **EXTERNAL**, **PENDING**.

| Area | Status | Release requirement |
|---|---|---|
| Qmoosa Pi branding | DONE | UI/metadata/package naming aligned |
| Pi SDK loading | CODE-READY | Validate inside registered Pi app |
| Pi authentication | CODE-READY | Verify real Pioneer token via /v2/me |
| Pi U2A payments | CODE-READY | Execute a real Pi Mainnet transaction with the matching Mainnet app/API key |
| Backend public runtime | DONE | Render backend deployed; Pages build configured for hosted Pi Mainnet mode |
| Backend API key | EXTERNAL | Add through hosting secrets |
| Domain validation file | CODE-READY | Complete Developer Portal ownership verification |
| App wallet / multisig | EXTERNAL | Complete Pi Developer Portal workflow |
| Conway B3/S23 engine | CODE-READY | Deterministic tests added; persistent run records still required |
| Agent advisor | CODE-READY | Rules-based advisor is explicit; connect real model providers before claiming production AI |
| Multi-model routing | PENDING | Add provider abstraction, policy/rate limits and fallback |
| PQC architecture | CODE-READY | Real ML-DSA/ML-KEM provider still required |
| x402 | DISABLED | Enable only after real settlement verifier is integrated |
| Custom/unlimited token | EXPERIMENTAL | Keep outside Pi Mainnet critical path |
| Persistent database | PENDING | PostgreSQL recommended for users/payments/projects/audit |
| Cache/queue | PENDING | Redis/managed queue for rate limits and jobs |
| Observability | PENDING | logs, metrics, alerts, uptime checks |
| Backups/restore | PENDING | automated backup and restore drill |
| CI build/typecheck/tests/audit | DONE | GitHub Actions includes backend regression tests and blocking high-severity dependency audits |
| Secret hygiene gate | DONE | CI blocks tracked runtime secrets |
| Mainnet Developer Portal app | USER-CONFIRMED | App Network reported by owner as Pi Mainnet; network cannot be changed after registration |
| Mobile/Pi Browser QA | EXTERNAL | Open the registered Mainnet app in Pi Browser and confirm Mainnet auth/payment flow and production URL routing |
| Mainnet listing approval | EXTERNAL | Pi review/approval required |

## Recommended production architecture

```
Pi Browser / PiNet
       |
       v
Next.js Qmoosa Pi UI
       |
       +---- Pi SDK authentication/payment
       |
       v
API Gateway / Node backend
       |
       +---- Pi Platform API
       +---- Agent Orchestrator
       +---- Conway Worker
       +---- PQC Adapter
       |
       +---- PostgreSQL
       +---- Redis / Queue
       +---- Object Storage
       +---- Audit / Metrics
```

## Mainnet release rule

Do not label the application "Pi Mainnet operational", "fully verified", or "100% compliant" until Developer Portal verification, required wallet approvals, production secrets, and a real production payment have all been completed and recorded.
