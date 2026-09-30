# Pi Testnet Deployment

Qmoosa Pi's hosted frontend is configured for **Pi Testnet**, not the local Pi Sandbox and not Pi Mainnet.

## Runtime configuration

Frontend production build:

- `NEXT_PUBLIC_PI_SANDBOX=false`
- `NEXT_PUBLIC_PI_NETWORK=testnet`
- `NEXT_PUBLIC_PI_BACKEND_URL=https://qmoosa-pi-backend.onrender.com`

SDK initialization therefore runs as:

```ts
Pi.init({ version: "2.0", sandbox: false })
```

The blockchain network is determined by the Pi Developer Portal app registration. The registered app must use **App Network = Pi Testnet**.

## Hosted URLs

Frontend:

`https://elon00.github.io/qmoosa-pi/`

Backend:

`https://qmoosa-pi-backend.onrender.com`

## Required Developer Portal binding

A hosted Testnet release is not the same thing as the local Sandbox.

To complete the external binding:

1. Open the Pi Developer Portal inside Pi Browser.
2. Create or select the Qmoosa Pi app whose **App Network is Pi Testnet**.
3. Register the hosted frontend URL required by the portal.
4. Use the validation key issued for that Testnet app/domain.
5. Store that Testnet app's Server API Key as `PI_API_KEY` on the backend.
6. Use the app wallet associated with the Testnet project.
7. Open the app through Pi Browser and confirm the Testnet indicator.
8. Authenticate and complete one Test Pi U2A payment end to end.

The App Network cannot be switched after registration. If the existing Developer Portal app was registered for Mainnet, create a separate Testnet app instead.

## Safety rule

Test Pi has no monetary value. Qmoosa Pi should remain in Testnet until identity verification, payment approval/completion, persistence, monitoring, and mobile QA are demonstrated with recorded evidence.
