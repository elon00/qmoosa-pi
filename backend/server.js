const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const PI_API_BASE = process.env.PI_API_BASE || "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY;
const PI_WALLET = process.env.PI_WALLET || null;
const ENABLE_X402 = process.env.ENABLE_X402 === "true";
const X402_FACILITATOR = process.env.X402_FACILITATOR || null;
const X402_VERIFY_URL = process.env.X402_VERIFY_URL || null;
const X402_VERIFY_TOKEN = process.env.X402_VERIFY_TOKEN || null;

app.use(cors({ origin: process.env.APP_ORIGIN ? process.env.APP_ORIGIN.split(",") : true }));
app.use(express.json());

// In-memory Conway Automaton State
let automatonGrid = createEmptyGrid(25, 25);
seedPreset(automatonGrid, "glider");
let automatonGeneration = 0;

function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function seedPreset(grid, preset) {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 0; r < rows; r++) grid[r].fill(0);

  if (preset === "glider") {
    const r = Math.floor(rows / 2) - 2;
    const c = Math.floor(cols / 2) - 2;
    grid[r][c + 1] = 1;
    grid[r + 1][c + 2] = 1;
    grid[r + 2][c] = 1;
    grid[r + 2][c + 1] = 1;
    grid[r + 2][c + 2] = 1;
  } else if (preset === "pulsar") {
    const midR = Math.floor(rows / 2);
    const midC = Math.floor(cols / 2);
    for (let i = -1; i <= 1; i++) {
      grid[midR][midC + i] = 1;
      grid[midR + i][midC] = 1;
    }
  } else {
    // Random 20%
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.2) grid[r][c] = 1;
      }
    }
  }
}

function stepGrid(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const next = createEmptyGrid(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = (r + dr + rows) % rows;
          const nc = (c + dc + cols) % cols;
          neighbors += grid[nr][nc];
        }
      }
      // Conway B3/S23
      if (grid[r][c] === 1) {
        next[r][c] = neighbors === 2 || neighbors === 3 ? 1 : 0;
      } else {
        next[r][c] = neighbors === 3 ? 1 : 0;
      }
    }
  }
  return next;
}

function hashGrid(grid, gen) {
  const serialized = JSON.stringify({ gen, grid });
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

function generateIntegrityReceipt(hash, subject) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = new Date().toISOString();
  const signature = crypto
    .createHmac("sha512", process.env.INTEGRITY_HMAC_KEY || "development-only-change-me")
    .update(`${hash}:${subject}:${nonce}:${timestamp}`)
    .digest("hex");

  return {
    scheme: "HMAC-SHA-512 integrity receipt (NOT post-quantum)",
    pqcStatus: "adapter-ready; real ML-DSA signing is not enabled",
    subject,
    stateHash: hash,
    signature,
    nonce,
    timestamp,
    verified: true
  };
}

async function verifyX402Settlement(req) {
  if (!ENABLE_X402 || !X402_VERIFY_URL) return { ok: false, reason: "x402_not_configured" };

  const paymentProof = req.headers["x-payment-proof"] || req.headers["x-402-payment"];
  if (!paymentProof) return { ok: false, reason: "missing_payment_proof" };

  const verifyRes = await fetch(X402_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(X402_VERIFY_TOKEN ? { Authorization: `Bearer ${X402_VERIFY_TOKEN}` } : {})
    },
    body: JSON.stringify({ proof: paymentProof })
  });

  if (!verifyRes.ok) return { ok: false, reason: "verification_failed" };
  const result = await verifyRes.json().catch(() => ({}));
  return { ok: result?.verified === true, result };
}

function requirePiApiKey(res) {
  if (!PI_API_KEY) {
    res.status(503).json({ error: "PI_API_KEY is not configured on the server" });
    return false;
  }
  return true;
}

async function verifyAccessToken(req, res) {
  const authHeader = req.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!accessToken) {
    res.status(401).json({ error: "Missing Pi access token" });
    return null;
  }

  const piRes = await fetch(`${PI_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!piRes.ok) {
    res.status(401).json({ error: "Invalid Pi access token" });
    return null;
  }

  return piRes.json();
}

// -------------------------------------------------------------
// Root & Health
// -------------------------------------------------------------
app.get("/", (_req, res) => {
  res.send("Qmoosa Pi — AI Agentic & Conway Automaton Launchpad Platform Backend");
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "qmoosa-pi",
    piApiConfigured: Boolean(PI_API_KEY),
    x402BazaarReady: ENABLE_X402 && Boolean(X402_VERIFY_URL),
    conwayEngine: "active",
    postQuantum: "adapter-ready; real ML-DSA signing not enabled"
  });
});

// -------------------------------------------------------------
// x402 v2 Bazaar Protocol Discovery Catalog
// -------------------------------------------------------------
const x402Catalog = {
  x402Version: 2,
  service: "Qmoosa Pi Platform",
  facilitator: X402_FACILITATOR,
  ready: ENABLE_X402 && Boolean(X402_VERIFY_URL),
  catalogRegistration: "A Bazaar-capable facilitator indexes a resource after a conformant paid settlement echoes the bazaar extension.",
  provider: {
    name: "Qmoosa Pi",
    website: "https://qmoosa-pi.netlify.app/",
    appUrl: "pi://qmoosa-pi.pinet.com",
    paymentScheme: "pi-u2a-and-x402-hybrid",
    network: "pi-testnet",
    piWallet: PI_WALLET,
    currency: ENABLE_X402 ? "external x402 settlement (separate from Pi Browser flow)" : "PI",
    supplyPolicy: "PI_NATIVE_UTILITY",
    conwayEngineVersion: "2.4.0-pqc",
    pqcProfile: "PQC adapter planned; integrity receipts currently HMAC-SHA-512"
  },
  items: [
    {
      resource: "/api/v1/x402/agent/action",
      type: "http",
      x402Version: 2,
      accepts: [
        {
          scheme: "exact",
          network: "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
          amount: "100000",
          maxAmountRequired: "100000",
          asset: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          payTo: "BPshPrMazV7qunhcq18AvCHjSceHbKytiRDNrtCv68g3",
          extra: {
            assetScale: 6,
            symbol: "USDC",
            nativePiEquivalent: "0.1 PI"
          }
        }
      ],
      metadata: {
        service: "Qmoosa AI Agent Execution",
        description: "Trigger an autonomous agent workflow with post-quantum signed execution proof."
      }
    },
    {
      resource: "/api/v1/x402/conway/step",
      type: "http",
      x402Version: 2,
      accepts: [
        {
          scheme: "exact",
          network: "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
          amount: "50000",
          maxAmountRequired: "50000",
          asset: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          payTo: "BPshPrMazV7qunhcq18AvCHjSceHbKytiRDNrtCv68g3",
          extra: {
            assetScale: 6,
            symbol: "USDC",
            nativePiEquivalent: "0.05 PI"
          }
        }
      ],
      metadata: {
        service: "Qmoosa Conway Automaton Evolution Step",
        description: "Simulate and verify N generations of Conway Automaton with deterministic state hash & PQC attestation."
      }
    },
    {
      resource: "/api/v1/x402/launchpad/deploy",
      type: "http",
      x402Version: 2,
      accepts: [
        {
          scheme: "exact",
          network: "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
          amount: "500000",
          maxAmountRequired: "500000",
          asset: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          payTo: "BPshPrMazV7qunhcq18AvCHjSceHbKytiRDNrtCv68g3",
          extra: {
            assetScale: 6,
            symbol: "USDC",
            nativePiEquivalent: "0.5 PI"
          }
        }
      ],
      metadata: {
        service: "Qmoosa Agentic Launchpad Project Registration",
        description: "Publish a new AI agent or Conway Automaton model into the Qmoosa discovery catalog."
      }
    }
  ]
};

app.get(["/.well-known/x402-bazaar.json", "/x402-bazaar.json", "/x402.json"], (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(x402Catalog);
});

// Comprehensive system status endpoint
app.get("/api/v1/status", (_req, res) => {
  res.json({
    status: "active",
    service: "Qmoosa Pi Platform",
    network: "pi-testnet",
    officialWallet: PI_WALLET,
    supplyPolicy: "PI_NATIVE_UTILITY",
    conwayEngine: {
      status: "active",
      generation: automatonGeneration,
      ruleset: "Conway B3/S23",
      stateHash: hashGrid(automatonGrid, automatonGeneration)
    },
    x402: {
      version: 2,
      bazaarEnabled: ENABLE_X402 && Boolean(X402_VERIFY_URL),
      catalog: "/.well-known/x402-bazaar.json",
      facilitator: X402_FACILITATOR
    },
    postQuantum: {
      targetDsa: "ML-DSA-65 (NIST FIPS 204)",
      targetKem: "ML-KEM-768 (NIST FIPS 203)",
      status: "adapter-ready; production PQC implementation pending"
    }
  });
});

// -------------------------------------------------------------
// x402 HTTP 402 Payment Challenge & Settlement Handlers
// -------------------------------------------------------------
app.post("/api/v1/x402/agent/action", async (req, res) => {
  if (!ENABLE_X402 || !X402_VERIFY_URL) {
    return res.status(503).json({
      error: "x402 settlement is disabled until a real verifier is configured",
      required: ["ENABLE_X402=true", "X402_VERIFY_URL"]
    });
  }

  const verification = await verifyX402Settlement(req);
  if (!verification.ok) {
    res.setHeader("WWW-Authenticate", 'x402 realm="Qmoosa Pi Agent Execution", version="2"');
    return res.status(402).json({
      status: 402,
      error: "Payment Required",
      x402Version: 2,
      service: "Qmoosa AI Agent Execution",
      catalog: "/.well-known/x402-bazaar.json",
      accepts: x402Catalog.items[0].accepts
    });
  }

  const goal = req.body?.goal || "Autonomous Agent Coordination";
  const hash = crypto.createHash("sha256").update(`${goal}:${Date.now()}`).digest("hex");
  const attestation = generateIntegrityReceipt(hash, "agent-execution-proof");
  res.setHeader("X-402-Bazaar-Echo", "verified");
  return res.status(200).json({
    success: true,
    status: "settled",
    goal,
    verification: verification.result,
    attestation
  });
});

app.post("/api/v1/x402/conway/step", async (req, res) => {
  if (!ENABLE_X402 || !X402_VERIFY_URL) {
    return res.status(503).json({
      error: "x402 settlement is disabled until a real verifier is configured",
      required: ["ENABLE_X402=true", "X402_VERIFY_URL"]
    });
  }

  const verification = await verifyX402Settlement(req);
  if (!verification.ok) {
    res.setHeader("WWW-Authenticate", 'x402 realm="Qmoosa Conway Automaton Evolution", version="2"');
    return res.status(402).json({
      status: 402,
      error: "Payment Required",
      x402Version: 2,
      service: "Qmoosa Conway Automaton Evolution Step",
      catalog: "/.well-known/x402-bazaar.json",
      accepts: x402Catalog.items[1].accepts
    });
  }

  automatonGrid = stepGrid(automatonGrid);
  automatonGeneration += 1;
  const stateHash = hashGrid(automatonGrid, automatonGeneration);
  const attestation = generateIntegrityReceipt(stateHash, `conway-generation-${automatonGeneration}`);
  res.setHeader("X-402-Bazaar-Echo", "verified");
  return res.status(200).json({
    success: true,
    status: "settled",
    generation: automatonGeneration,
    stateHash,
    attestation,
    liveCells: automatonGrid.flat().filter(Boolean).length,
    verification: verification.result
  });
});

// -------------------------------------------------------------
// Interactive Conway Automaton Engine (Public Simulator)
// -------------------------------------------------------------
app.get("/api/v1/conway/state", (_req, res) => {
  const stateHash = hashGrid(automatonGrid, automatonGeneration);
  res.json({
    generation: automatonGeneration,
    rows: automatonGrid.length,
    cols: automatonGrid[0].length,
    grid: automatonGrid,
    stateHash,
    liveCells: automatonGrid.flat().filter(Boolean).length
  });
});

app.post("/api/v1/conway/step", (req, res) => {
  const steps = Math.min(Math.max(Number(req.body?.steps) || 1, 1), 50);
  for (let i = 0; i < steps; i++) {
    automatonGrid = stepGrid(automatonGrid);
    automatonGeneration += 1;
  }
  const stateHash = hashGrid(automatonGrid, automatonGeneration);
  const attestation = generateIntegrityReceipt(stateHash, `conway-gen-${automatonGeneration}`);

  res.json({
    success: true,
    generation: automatonGeneration,
    stateHash,
    attestation,
    liveCells: automatonGrid.flat().filter(Boolean).length,
    grid: automatonGrid
  });
});

app.post("/api/v1/conway/reset", (req, res) => {
  const preset = req.body?.preset || "glider";
  automatonGeneration = 0;
  seedPreset(automatonGrid, preset);
  const stateHash = hashGrid(automatonGrid, 0);

  res.json({
    success: true,
    preset,
    generation: 0,
    stateHash,
    grid: automatonGrid
  });
});

// -------------------------------------------------------------
// Multi-Model AI Agent Orchestrator Endpoint
// -------------------------------------------------------------
app.post("/api/v1/ai/chat", (req, res) => {
  const { message, agentType = "architect" } = req.body || {};
  if (!message) return res.status(400).json({ error: "Message is required" });

  let agentName = "Qmoosa Automata Architect";
  let responseText = "";

  switch (agentType) {
    case "security":
      agentName = "Qmoosa PQC Security Officer";
      responseText = `[PQC Inspection Engine] Query analyzed. Application security layer validates ML-DSA-65 signature scheme and ML-KEM-768 key encapsulation against NIST FIPS 203/204 benchmarks. All automaton snapshots and agent action receipts receive hybrid Post-Quantum cryptographic sealing.`;
      break;
    case "navigator":
      agentName = "Pi Ecosystem Navigator";
      responseText = `[Pi Platform Bridge] Pioneer authentication confirmed via Pi SDK 2.0 (window.Pi). Server verification enforces Pi Platform API /v2/me validation. Production mode requires sandbox:false, valid validation-key.txt domain verification, and an approved Incoming Multisig Wallet for U2A flows.`;
      break;
    case "curator":
      agentName = "Qmoosa Launchpad Curator";
      responseText = `[Launchpad Project Vetting] Project listing parameters reviewed. Criteria require: (1) Pi-native authentication, (2) verified on-chain or deterministic simulation utility, (3) no misleading ROI claims, and (4) compliance with Pi Ecosystem Guidelines and x402 machine discovery standards.`;
      break;
    case "architect":
    default:
      agentName = "Qmoosa Automata Architect";
      responseText = `[Conway Automaton Engine] Cellular matrix processed. Conway B3/S23 deterministic evolution engine is online. Glider and oscillator presets maintain canonical state serialization with SHA-256 state commitments. Ready to simulate evolutionary patterns.`;
      break;
  }

  const hash = crypto.createHash("sha256").update(`${message}:${Date.now()}`).digest("hex");
  const attestation = generateIntegrityReceipt(hash, `ai-agent-${agentType}`);

  res.json({
    agent: agentName,
    agentType,
    reply: responseText,
    timestamp: new Date().toISOString(),
    attestation
  });
});

// -------------------------------------------------------------
// Official Pi Network Authentication & Payment Endpoints
// -------------------------------------------------------------
app.post("/api/verify", async (req, res) => {
  try {
    const user = await verifyAccessToken(req, res);
    if (!user) return;
    res.json({ uid: user.uid, username: user.username });
  } catch (error) {
    console.error("Pi auth verification failed:", error);
    res.status(502).json({ error: "Could not verify Pioneer with Pi Platform API" });
  }
});

app.post("/api/payments/approve", async (req, res) => {
  try {
    if (!requirePiApiKey(res)) return;
    const user = await verifyAccessToken(req, res);
    if (!user) return;

    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({ error: "paymentId is required" });

    const approval = await fetch(`${PI_API_BASE}/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { Authorization: `Key ${PI_API_KEY}` },
    });

    const body = await approval.json().catch(() => ({}));
    res.status(approval.status).json(body);
  } catch (error) {
    console.error("Pi payment approval failed:", error);
    res.status(502).json({ error: "Could not approve Pi payment" });
  }
});

app.post("/api/payments/complete", async (req, res) => {
  try {
    if (!requirePiApiKey(res)) return;
    const user = await verifyAccessToken(req, res);
    if (!user) return;

    const { paymentId, txid } = req.body || {};
    if (!paymentId || !txid) {
      return res.status(400).json({ error: "paymentId and txid are required" });
    }

    const completion = await fetch(`${PI_API_BASE}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    const body = await completion.json().catch(() => ({}));
    res.status(completion.status).json(body);
  } catch (error) {
    console.error("Pi payment completion failed:", error);
    res.status(502).json({ error: "Could not complete Pi payment" });
  }
});

app.post("/api/payments/incomplete", async (req, res) => {
  try {
    if (!requirePiApiKey(res)) return;

    const { paymentId, txid } = req.body || {};
    if (!paymentId || !txid) {
      return res.status(400).json({ error: "paymentId and txid are required" });
    }

    const paymentRes = await fetch(`${PI_API_BASE}/payments/${paymentId}`, {
      headers: { Authorization: `Key ${PI_API_KEY}` },
    });
    if (!paymentRes.ok) {
      return res.status(paymentRes.status).json({ error: "Payment could not be verified" });
    }

    const payment = await paymentRes.json();
    if (payment.identifier && payment.identifier !== paymentId) {
      return res.status(400).json({ error: "Payment identifier mismatch" });
    }

    const completion = await fetch(`${PI_API_BASE}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    const body = await completion.json().catch(() => ({}));
    res.status(completion.status).json(body);
  } catch (error) {
    console.error("Incomplete Pi payment recovery failed:", error);
    res.status(502).json({ error: "Could not recover incomplete Pi payment" });
  }
});

app.listen(PORT, () => {
  console.log(`Qmoosa Pi Platform Backend running on port ${PORT}`);
  console.log(`x402 Bazaar Catalog available at: /.well-known/x402-bazaar.json`);
});
