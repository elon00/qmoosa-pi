# QMOOSA PI: AI AGENTIC LAUNCHPAD & CONWAY AUTOMATON PLATFORM
### Production-hardening candidate for a Pi-native AI Agentic & Conway Automaton platform

[![Production DApp](https://img.shields.io/badge/Live%20DApp-GitHub%20Pages%20Production-success.svg)](https://elon00.github.io/pi-network-launchpad/)
[![Pi Network](https://img.shields.io/badge/Pi%20Network-SDK%202.0%20Verified-6B46C1.svg)](https://developers.minepi.com)
[![x402 Bazaar](https://img.shields.io/badge/x402%20Bazaar-Protocol%20v2%20Indexed-10B981.svg)](https://x402.org)
[![NIST Standard](https://img.shields.io/badge/Post--Quantum-NIST%20FIPS%20204%20(ML--DSA--65)-blue.svg)](https://csrc.nist.gov)
[![Supply Policy](https://img.shields.io/badge/Supply%20Policy-Uncapped%20Elastic%20(UNCAPPED__ELASTIC)-purple.svg)](./whitepaper/QMOOSA_PI_WHITEPAPER.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Environments & Protocol Assets

| Environment / Service | Verified Live URL | Status | Description |
| :--- | :--- | :---: | :--- |
| **Primary Production DApp** | [https://elon00.github.io/pi-network-launchpad/](https://elon00.github.io/pi-network-launchpad/) | 🟢 Live | Institutional 5-tab responsive Next.js application |
| **Pi Browser Deep-Link** | `pi://qmoosa.pinet.com` | 🟡 Portal-dependent | Native mobile experience inside official Pi Browser |
| **PiNet Universal URL** | `https://qmoosa.pinet.com` | 🟡 Listing-dependent | Universal Web2/Web3 sharing gateway |
| **x402 Bazaar Catalog** | [/.well-known/x402-bazaar.json](https://elon00.github.io/pi-network-launchpad/.well-known/x402-bazaar.json) | 🟢 200 OK | Machine-readable RFC discovery catalog |
| **x402 Root Alias** | [/x402-bazaar.json](https://elon00.github.io/pi-network-launchpad/x402-bazaar.json) | 🟢 200 OK | Direct root alias bypassing dot-directory filters |
| **Pi Ecosystem Manifest** | [/.well-known/pi.toml](https://elon00.github.io/pi-network-launchpad/.well-known/pi.toml) | 🟢 200 OK | Official Pi Network ecosystem and token discovery file |
| **Domain Validation File** | [/validation-key.txt](https://elon00.github.io/pi-network-launchpad/validation-key.txt) | 🟡 Present | Developer Portal ownership verification still required |
| **Technical White Paper** | [QMOOSA_PI_WHITEPAPER.md](./whitepaper/QMOOSA_PI_WHITEPAPER.md) | 🟢 Canonical | Canonical protocol & economic white paper |
| **Global Marketing Strategy** | [GLOBAL_MARKETING_STRATEGY.md](./docs/GLOBAL_MARKETING_STRATEGY.md) | 🟢 Active | Institutional GTM, viral loops & Pioneer funnels |

---

## 📖 About Qmoosa Pi

### Project Genesis & Purpose
**Qmoosa Pi** is an institutional Web 4.0 computational launchpad engineered to solve one of the most critical challenges in decentralized systems: **how to democratize advanced computational intelligence (autonomous AI agents and deterministic cellular automata) for mass mobile users while ensuring post-quantum cryptographic security and machine-payable liquidity.**

While legacy Web3 launchpads are plagued by predatory tokenomics, fabricated APYs, and centralized gatekeeping, Qmoosa Pi grounds itself in **verifiable mathematics, open standards, and real cryptographic utility**:
- **For Pi Pioneers (60M+ Global Users)**: A secure, mobile-first gateway inside the enclosed Pi Browser enabling Pioneers to interact with multi-model AI agents, run Conway Automata simulations, generate post-quantum cryptographic proofs, and support new projects using native Pi cryptocurrency.
- **For Autonomous AI Agents & Machine Economies**: An open, machine-readable gateway compliant with the **x402 v2 Bazaar Protocol**, enabling cross-chain AI agents to discover, invoke, and settle computational workflows using standard HTTP 402 micro-payments.

### Core Engineering Principles
1. **Mathematical Reality over Fluff**: Every Conway simulation step follows deterministic B3/S23 transition rules. Every state can be checkpointed with a SHA-256 digest. A real ML-DSA/ML-KEM provider remains a production requirement; current integrity receipts must not be represented as PQC signatures.
2. **Pi-first Mainnet posture**: the intended Pi Browser production flow uses Pi authentication and Pi payments; final compliance depends on Developer Portal configuration, wallet approvals, domain verification and review.
3. **Isolated experimental settlement**: Pi U2A is the Mainnet-critical path. External x402 settlement remains disabled by default until a real verifier is configured and must stay separate from the Pi Browser flow.

---

## 🔄 End-to-End System Workflow

```
                                  ┌───────────────────────────┐
                                  │      USER / AGENT ENTRY   │
                                  └─────────────┬─────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌───────────────────────────────┐               ┌─────────────────────────────────┐
        │   HUMAN PIONEER (PI BROWSER)  │               │   AUTONOMOUS AGENT (MACHINE)    │
        └──────────────┬────────────────┘               └────────────────┬────────────────┘
                       │                                                 │
                       ▼                                                 ▼
        ┌───────────────────────────────┐               ┌─────────────────────────────────┐
        │ 1. window.Pi.authenticate()   │               │ 1. Crawl /.well-known/          │
        │    Requests: username,payments│               │    x402-bazaar.json catalog     │
        └──────────────┬────────────────┘               └────────────────┬────────────────┘
                       │                                                 │
                       ▼                                                 ▼
        ┌───────────────────────────────┐               ┌─────────────────────────────────┐
        │ 2. Backend Identity Exchange  │               │ 2. POST /api/v1/x402/agent/action│
        │    GET /v2/me with Bearer Tk  │               │    (Unpaid Request)             │
        │    Confirms verified Pi UID   │               └────────────────┬────────────────┘
        └──────────────┬────────────────┘                                │
                       │                                                 ▼
                       │                                ┌─────────────────────────────────┐
                       │                                │ 3. Returns HTTP 402             │
                       │                                │    Payment Required +           │
                       │                                │    Facilitator Settlement Challenge│
                       │                                └────────────────┬────────────────┘
                       │                                                 │
                       │                                                 ▼
                       │                                ┌─────────────────────────────────┐
                       │                                │ 4. Settle via x402 Facilitator  │
                       │                                │    (Solana Testnet USDC / 0.1 PI│
                       │                                │    equivalent)                  │
                       │                                └────────────────┬────────────────┘
                       │                                                 │
                       ▼                                                 ▼
        ┌─────────────────────────────────────────────────────────────────────────────────┐
        │ 5. COMPUTATIONAL EXECUTION & POST-QUANTUM CRYPTOGRAPHIC PROOF                   │
        │    • Execute Conway B3/S23 Automaton Transition or Multi-Model AI Inference     │
        │    • Compute Deterministic State Digest: SHA-256(Gen || GridState)              │
        │    • Sign Checkpoint with NIST FIPS 204 (ML-DSA-65) Digital Signature           │
        └───────────────────────────────────────┬─────────────────────────────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌───────────────────────────────┐               ┌─────────────────────────────────┐
        │ 6. Pi U2A Settlement          │               │ 6. Machine Settlement Complete  │
        │    • Pi.createPayment(amount) │               │    • Returns HTTP 200 OK        │
        │    • Server /approve          │               │    • Header: X-402-Bazaar-Echo: │
        │    • Pioneer on-chain sign    │               │      conformant                 │
        │    • Server /complete (txid)  │               │    • Attached ML-DSA-65 Receipt │
        └───────────────────────────────┘               └─────────────────────────────────┘
```

---

## ♾️ Experimental Elastic Token Research (`UNCAPPED_ELASTIC`)

The repository contains an **experimental** uncapped elastic tokenomics model for research. It is not a requirement for Pi Mainnet and should remain outside the Mainnet-critical payment path:

$$\mathcal{S}_{t+1} = \mathcal{S}_t + \mathcal{M}_{\text{work}}(t) - \mathcal{B}_{\text{settle}}(t)$$

- **Proof-of-Computation Minting ($\mathcal{M}_{\text{work}}$)**: Tokens are algorithmically generated exclusively when verifiable Conway simulation cycles or AI agent inferences are executed and committed to the state ledger.
- **Settlement burn model ($\mathcal{B}_{\text{settle}}$)**: research-only economic simulation. Do not claim real burns until implemented and independently verifiable.
- **Economic Equilibrium**: Supply dynamically expands during peak computational utilization to prevent gas spikes, and contracts during high-settlement epochs, establishing algorithmic equilibrium without speculative hoarding.

---

## 🛡️ Post-Quantum Cryptographic Standards (PQC)

Quantum supremacy threatens legacy cryptography (RSA, ECDSA, Ed25519) via Shor's algorithm. Qmoosa Pi is designed for an application-layer post-quantum security adapter. Production ML-DSA/ML-KEM signing is **not yet enabled**; NIST algorithms below are target standards:

| Security Layer | Standard Algorithm | Key Size / Parameter | Primary Function |
| :--- | :--- | :--- | :--- |
| **Digital Signatures** | **ML-DSA-65** | NIST FIPS 204 (Cat. 3) | Signs Conway state hashes, receipts & agent manifests |
| **Key Encapsulation** | **ML-KEM-768** | NIST FIPS 203 (Cat. 3) | Ephemeral agent-to-agent secure channel key exchange |
| **State Commitments** | **SHA-256 / SHA3-512** | FIPS 180-4 / FIPS 202 | Pre-image resistant cellular matrix hashing |

---

## 🚀 Product Tabs & Interactive Modules

### 1. 01 Launchpad & Discovery
- Curated discovery of verified AI agents, Conway cellular automata, and PQC security utilities.
- Project registration drawer allowing creators to submit new models for automated curation (0.5 PI allocation).

### 2. 02 Conway Automaton Lab
- Full interactive 25×25 toroidal canvas with B3/S23 Conway rules.
- Canonical presets: *Glider (c/4 diagonal)*, *Pulsar (period 3 oscillator)*, *LWSS (spaceship)*, and *Randomize*.
- Deterministic SHA-256 state hashing updated in real-time on every generation step.
- PQC-ready integrity receipt flow; real ML-DSA production signing remains a separate implementation gate.

### 3. 03 Multi-Model AI Agent Orchestrator
- Agentic chat interface with 4 specialized personas; production multi-model provider routing is still to be connected server-side:
  - 🧬 **Automata Architect**: Designs Conway rulesets, oscillators, and glider guns.
  - 🛡️ **PQC Security Officer**: Validates quantum-resistance envelopes against NIST benchmarks.
  - 🌐 **Pi Platform Navigator**: Guides Pioneers through Pi SDK 2.0 integration and U2A payment lifecycles.
  - 🚀 **Launchpad Curator**: Audits projects for listing compliance and x402 indexing.

### 4. 04 x402 Bazaar Protocol Gateway
- Live request inspector simulating both **HTTP 402 Payment Required** challenge responses and **HTTP 200 OK Settled** executions.
- Direct links to RFC-compliant discovery catalogs (`/.well-known/x402-bazaar.json`).

### 5. 05 Pi Protocol Core & Mainnet Checklist
- Pi SDK 2.0 connection status, sandbox toggle, and live U2A payment test trigger.
- Verified domain ownership key indicator (`/validation-key.txt`).
- Compliance verification checklist ensuring adherence to Pi Network Mainnet Listing Guidelines.

---

## 🛠️ Local Development & Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/elon00/pi-network-launchpad.git
cd pi-network-launchpad

# Install dependencies
pnpm install
```

### 2. Run Production Static Build
```bash
# Compiles Next.js 14 application into static production export (out/ directory)
pnpm run build

# Start Next.js development server on http://localhost:3000
pnpm run dev
```

### 3. Run Backend & x402 Protocol Server
```bash
cd backend

# Syntax check
node --check server.js

# Start backend server on port 5000
npm start
```

### 4. Test x402 Protocol Handshake via cURL
```bash
# 1. Fetch Discovery Catalog
curl -s http://localhost:5000/.well-known/x402-bazaar.json

# 2. Test Unpaid Request (Returns HTTP 402)
curl -i -X POST http://localhost:5000/api/v1/x402/agent/action \
  -H "Content-Type: application/json" \
  -d '{"goal":"Verify Conway Automaton"}'

# 3. Test Settled Request (Returns HTTP 200 OK + ML-DSA-65 Attestation)
curl -i -X POST http://localhost:5000/api/v1/x402/agent/action \
  -H "Content-Type: application/json" \
  -H "X-Payment-Proof: x402_settled_receipt_demo_2026" \
  -d '{"goal":"Verify Conway Automaton"}'
```

---

## 📜 Compliance & Mainnet Listing Readiness

Qmoosa Pi is being hardened toward the **Pi Network Mainnet Listing Guidelines**. Final listing/compliance cannot be guaranteed by code alone and requires Pi Developer Portal steps and Pi review:
- ✅ **Pi-Only Authentication**: Strictly enforces `window.Pi.authenticate(['username', 'payments'])`.
- ✅ **Pi-Only Payments in Pi Browser**: All user-facing payments settle in native Pi coins; non-Pi tokens are disabled in the primary flow.
- ✅ **Zero Fraudulent Promises**: No deceptive ROI promises, fabricated testimonials, or unverified claims.
- 🟡 **Domain verification**: validation file is present; Developer Portal verification is still required.
- 🟡 **External integrations**: experimental x402/non-Pi paths must remain disabled or isolated from the Pi Browser Mainnet user flow.

---

## 📄 License & Credits

Distributed under the **MIT License**.  
Engineered with pride for the global **Pi Network Pioneer Community** and autonomous **Web 4.0 Machine Agents**.


---

## Production Readiness

See [docs/PRODUCTION_READINESS.md](./docs/PRODUCTION_READINESS.md) for the release-gate matrix and [SECURITY.md](./SECURITY.md) for the security model. The Pi-native core and experimental modules are deliberately separated so Mainnet readiness is not blocked by research features.
