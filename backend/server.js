const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const PI_API_BASE = process.env.PI_API_BASE || "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY;

app.use(cors({ origin: process.env.APP_ORIGIN ? process.env.APP_ORIGIN.split(",") : true }));
app.use(express.json());

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

app.get("/", (_req, res) => {
  res.send("Pi-Network-Launchpad Backend");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, piApiConfigured: Boolean(PI_API_KEY) });
});

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

    // This path runs during Pi.authenticate(), before the frontend has an access token.
    // Authorize against the payment itself using the server API key.
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
  console.log(`Server running on port ${PORT}`);
});
