# Qmoosa Pi: Official Pi Network Mainnet Launch Guide

This document provides step-by-step instructions for finalizing the **Pi Network Mainnet** launch of Qmoosa Pi via the official **Pi Developer Portal**.

---

## 🌐 Current Production Status

The application is deployed and configured in **Mainnet Mode**:
- **Production URL**: `https://elon00.github.io/qmoosa-pi/`
- **Domain Validation Key**: `https://elon00.github.io/qmoosa-pi/validation-key.txt`
- **Pi Ecosystem Manifest**: `https://elon00.github.io/qmoosa-pi/.well-known/pi.toml`
- **Pi SDK Handshake**: `window.Pi.init({ version: "2.0", sandbox: false })` (Mainnet mode enabled by default)

---

## 📱 Final Developer Portal Steps (Inside Pi Browser)

Because Pi Network operates a permissioned ecosystem with mobile cryptographic identity, app registration must be completed by the project owner inside the official **Pi Browser**:

### Step 1: Open Pi Developer Portal
1. Open the **Pi Browser** app on your iOS or Android device.
2. In the top URL bar, type:
   ```
   develop.pi
   ```
3. Authenticate with your Pioneer account.

---

### Step 2: Register / Configure Qmoosa Pi
1. Tap **"New App"** (or select your existing app registration).
2. Fill in the App Profile:
   - **App Name**: `Qmoosa Pi`
   - **App URL**: `https://elon00.github.io/qmoosa-pi/`
   - **Description**: `Institutional Web 4.0 Launchpad native to Pi Network with Conway Automaton engine and multi-agent AI orchestration.`
   - **Category**: `Utilities / Web3 / Launchpad`

---

### Step 3: Domain Ownership Verification
1. In the Pi Developer Portal under **App Hosting / Domain Verification**:
2. The portal will prompt you to place a verification code at `validation-key.txt`.
3. If your portal gives you a specific verification string, you can update `public/validation-key.txt` with your unique string.
4. Click **"Verify Domain"**. The portal will fetch `https://elon00.github.io/qmoosa-pi/validation-key.txt` and confirm ownership.

---

### Step 4: Switch Environment to Mainnet
1. Locate the **Environment Toggle** in your App Dashboard inside `develop.pi`.
2. Switch from **Sandbox** to **Mainnet**.
3. Generate your **Server API Key** (`PI_API_KEY`) and store it securely in your backend hosting environment (never commit this key to Git).

---

### Step 5: Configure Incoming App Wallet (U2A Payments)
1. For User-to-App (U2A) payments to settle directly on Mainnet:
   - Apply for an **Incoming Pi Wallet** in the Developer Portal.
   - Set up your 24-word passphrase securely according to Pi Core Team security protocols.
2. Once approved, all Pioneer allocations inside Qmoosa Pi will transfer real Mainnet Pi directly into your treasury!

---

## 🔒 Security & Compliance Notice

- The Qmoosa Pi client operates strictly with official `window.Pi.authenticate(['username', 'payments'])`.
- No fiat currencies, speculative promises, or deceptive yields are present.
- All Mainnet transactions are signed natively by Pioneers inside their encrypted Pi Browser wallet.
