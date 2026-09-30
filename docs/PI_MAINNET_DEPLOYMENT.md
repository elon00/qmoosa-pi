# Pi Mainnet Deployment

Qmoosa Pi's hosted frontend is configured for **Pi Mainnet**, not Pi Sandbox and not Pi Testnet.

## Runtime configuration

Frontend production build:

- `NEXT_PUBLIC_PI_SANDBOX=false`
- `NEXT_PUBLIC_PI_NETWORK=mainnet`
- `NEXT_PUBLIC_PI_BACKEND_URL=https://qmoosa-pi-backend.onrender.com`

The SDK initializes with:

```ts
Pi.init({ version: "2.0", sandbox: false })
```

The blockchain network is determined by the Pi Developer Portal app registration. The owner has reported that the Qmoosa Pi app is registered with **App Network = Pi Mainnet**.

## Hosted URLs

Frontend:

`https://elon00.github.io/qmoosa-pi/`

Backend:

`https://qmoosa-pi-backend.onrender.com`

## Mainnet external gates

Code/hosting alignment alone does not prove a completed Mainnet launch. Before calling the app Mainnet-operational, verify all of the following in Pi Developer Portal and Pi Browser:

1. App Network is **Pi Mainnet**.
2. Production/Hosted URL is registered and reachable over HTTPS.
3. Domain ownership is verified with the exact Developer Portal validation key.
4. The matching Mainnet Server API Key is stored only on the backend as `PI_API_KEY`.
5. The Mainnet app wallet is connected.
6. Incoming Multisig Wallet approval for the U2A payment flow is complete where required.
7. A real Pioneer can authenticate in Pi Browser.
8. One real User-to-App Mainnet payment completes end to end: create → approve → blockchain transaction → complete.
9. Record the resulting Mainnet transaction ID for release evidence.

## Safety rule

Never expose `PI_API_KEY`, wallet passphrase, private key, or seed phrase in client code, GitHub, logs, or chat.
