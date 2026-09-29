# Qmoosa Pi: AI Agentic Launchpad & Conway Automaton Platform
### Built for 60M+ Pi Network Pioneers × Synchronized with the x402 v2 Bazaar Protocol

[![Pi Network](https://img.shields.io/badge/Pi%20Network-SDK%202.0%20Ready-6B46C1.svg)](https://developers.minepi.com)
[![x402 Bazaar](https://img.shields.io/badge/x402%20Bazaar-Protocol%20v2-10B981.svg)](https://x402.org)
[![PQC Standard](https://img.shields.io/badge/Post--Quantum-NIST%20FIPS%20204%20(ML--DSA--65)-blue.svg)](https://csrc.nist.gov)
[![Supply Policy](https://img.shields.io/badge/Supply%20Policy-Uncapped%20Elastic%20(UNCAPPED__ELASTIC)-purple.svg)](./whitepaper/QMOOSA_PI_WHITEPAPER.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Overview

**Qmoosa Pi** is an institutional Web 4.0 launchpad and computational platform uniting:
1. **Pi Network Ecosystem**: Reaching 60M+ KYC-verified Pioneers inside the native Pi Browser with official Pi SDK 2.0 authentication (`/v2/me`) and user-to-app (U2A) Pi payments.
2. **x402 v2 Bazaar Protocol**: Exposing machine-readable discovery catalogs (`/.well-known/x402-bazaar.json`) and HTTP 402 payment handshakes for autonomous cross-chain AI agents.
3. **Deterministic Conway Automaton Engine**: Real-time cellular automaton matrix (B3/S23) generating periodic lifeforms, spaceships, and cryptographic SHA-256 state commitments.
4. **Post-Quantum Cryptography (PQC)**: NIST FIPS 204 (ML-DSA-65) digital signatures and NIST FIPS 203 (ML-KEM-768) encapsulation securing all computational receipts and agent manifests.
5. **Unlimited Elastic Computational Tokenomics (`UNCAPPED_ELASTIC`)**: An algorithmic utility model where supply dynamically balances proof-of-work minting with settlement burns, eliminating artificial fixed caps.

---

## 2. Key Architectural Components

```
QMOOSA PI PLATFORM
│
├── 01 Launchpad Engine
│   ├── AI Agent & Conway Automata Project Discovery
│   ├── Automated Listing Curator & Compliance Verification
│   └── 0.5 PI Project Deployment Handshake
│
├── 02 Conway Automaton Lab
│   ├── 25x25 Toroidal Cellular Lattice (Conway B3/S23)
│   ├── Glider, Pulsar & Spaceship (LWSS) Presets
│   ├── Deterministic SHA-256 State Commitment Hashing
│   └── ML-DSA-65 Post-Quantum Cryptographic Attestation
│
├── 03 Multi-Model AI Agent Orchestrator
│   ├── 🧬 Automata Architect (Cellular pattern synthesis)
│   ├── 🛡️ PQC Security Officer (NIST FIPS 203/204 validation)
│   ├── 🌐 Pi Platform Navigator (Pi SDK 2.0 & U2A payment guides)
│   └── 🚀 Launchpad Curator (Project vetting & compliance)
│
├── 04 x402 v2 Bazaar Protocol Gateway
│   ├── RFC-Compliant Catalog: /.well-known/x402-bazaar.json
│   ├── HTTP 402 Payment-Required Handshake
│   ├── Facilitator Indexing: https://x402.org/facilitator
│   └── Dual Settlement: Pi (Pioneers) + USDC (Autonomous Agents)
│
└── 05 Pi Network Protocol Core
    ├── Pi SDK 2.0 Script Integration (https://sdk.minepi.com/pi-sdk.js)
    ├── Backend Token Identity Verification (POST /v2/me)
    ├── Idempotent U2A Payment Lifecycle (/payments/approve & /complete)
    ├── Domain Verification Key: /validation-key.txt
    └── Ecosystem Token Manifest: /.well-known/pi.toml
```

---

## 3. Unlimited Elastic Supply Model (`UNCAPPED_ELASTIC`)

Unlike legacy launchpads constrained by arbitrary fixed supplies, Qmoosa Pi implements an **Uncapped Elastic Computational Utility Supply**:

$$S_{t+1} = S_t + \mathcal{M}_{work}(t) - \mathcal{B}_{settle}(t)$$

- **Dynamic Minting ($\mathcal{M}_{work}$)**: Algorithmically triggered by verified Conway simulation steps and AI agent inference tasks.
- **Continuous Burning ($\mathcal{B}_{settle}$)**: 40% of all Pi U2A payment fees, project listing deposits (0.5 PI), and x402 settlements are permanently burned from the circulating supply.
- **Mainnet Compatibility**: Mainnet listed transactions remain strictly in native Pi coins in full compliance with Pi Network Ecosystem Guidelines.

Read the detailed mathematical specification in the [White Paper](./whitepaper/QMOOSA_PI_WHITEPAPER.md).

---

## 4. Live Protocol Catalogs & Verification Files

| Resource | URI / Path | Description |
| :--- | :--- | :--- |
| **x402 Bazaar Catalog** | [`/.well-known/x402-bazaar.json`](./public/.well-known/x402-bazaar.json) | Global discovery catalog conforming to x402 v2 Bazaar RFC |
| **x402 Root Alias** | [`/x402-bazaar.json`](./public/x402-bazaar.json) | Static alias bypassing legacy dot-directory filters |
| **Pi Ecosystem TOML** | [`/.well-known/pi.toml`](./public/.well-known/pi.toml) | Official Pi Network ecosystem and testnet token manifest |
| **Domain Validation Key** | [`/validation-key.txt`](./public/validation-key.txt) | Pi Developer Portal domain ownership validation token |
| **Technical White Paper** | [`whitepaper/QMOOSA_PI_WHITEPAPER.md`](./whitepaper/QMOOSA_PI_WHITEPAPER.md) | Canonical technical & economic protocol specification |
| **Global Marketing Strategy** | [`docs/GLOBAL_MARKETING_STRATEGY.md`](./docs/GLOBAL_MARKETING_STRATEGY.md) | Institutional GTM, Pioneer funnels & viral flywheels |

---

## 5. Getting Started & Development

### Prerequisites
- Node.js 18+ (tested on Node v24)
- `pnpm` 11+ or `npm` 10+

### 1. Install & Build Frontend
```bash
# Install dependencies
pnpm install

# Build production application
pnpm run build

# Start local Next.js server (Default: http://localhost:3000)
pnpm run dev
```

### 2. Run Qmoosa Backend & x402 Gateway
```bash
cd backend

# Verify backend syntax
node --check server.js

# Start backend on port 5000
npm start
```

### 3. Test x402 Bazaar Protocol
```bash
# Test 1: Fetch x402 Bazaar Catalog
curl http://localhost:5000/.well-known/x402-bazaar.json

# Test 2: Trigger Unpaid Agent Action (Returns HTTP 402 Payment Required)
curl -i -X POST http://localhost:5000/api/v1/x402/agent/action \
  -H "Content-Type: application/json" \
  -d '{"goal":"Autonomous Agent Coordination"}'

# Test 3: Trigger Settled Agent Action (Returns HTTP 200 OK + PQC Attestation)
curl -i -X POST http://localhost:5000/api/v1/x402/agent/action \
  -H "Content-Type: application/json" \
  -H "X-Payment-Proof: x402_settled_receipt_demo_2026" \
  -d '{"goal":"Autonomous Agent Coordination"}'
```

---

## 6. Pi Network Mainnet Listing Guidelines Compliance

- **No Misleading Promises**: 100% free of exaggerated ROI claims, fake investor profiles, or guaranteed yields.
- **Pi-Native Authentication**: Exclusively utilizes `window.Pi.authenticate(['username', 'payments'])`.
- **Enclosed Firewall Safety**: No external fiat gateways or unauthorized third-party redirects.
- **Data Minimization**: Collects zero sensitive PII; authenticates strictly via verified Pi UID (`/v2/me`).

---

## 7. License & Credits

Released under the **MIT License**.  
Built for the global **Pi Network Pioneer Community** and autonomous **Web 4.0 Machine Agents**.
