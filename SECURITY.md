# Qmoosa Pi Security Policy

## Security model

Qmoosa Pi separates the Pi-native production path from experimental modules.

- Pi authentication is verified server-side through the Pi Platform API.
- Pi Server API keys must remain server-side only.
- Payment completion is accepted only after the Pi backend completion call succeeds.
- External x402 settlement is disabled by default and requires a configured verifier.
- HMAC integrity receipts are not represented as ML-DSA or other post-quantum signatures.
- Real ML-DSA/ML-KEM support must be implemented through a reviewed PQC provider/adapter before the product may claim PQC-active status.
- No wallet secret seed, API token, private key, or provider credential may be committed.

## Mainnet security gates

Before a production/Mainnet release:

1. Register a dedicated Pi Mainnet app.
2. Configure production `PI_API_KEY` in the hosting secret manager.
3. Verify the production domain in Pi Developer Portal.
4. Complete an end-to-end real U2A payment.
5. Confirm payment endpoints are idempotent and backed by persistent storage.
6. Add rate limiting, structured audit logging, monitoring and alerting.
7. Replace in-memory automaton/payment state with durable storage where required.
8. Complete dependency, SAST, secret and penetration testing.
9. Review privacy/terms and data-retention policy.
10. Keep experimental non-Pi settlement paths outside the Pi Browser Mainnet flow.

## Reporting

Do not place security vulnerabilities in public issues. Use a private security advisory or contact the repository owner privately.
