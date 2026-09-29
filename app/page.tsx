"use client";

import { useMemo, useState } from "react";

type PiUser = { uid: string; username?: string };

export default function Page() {
  const [user, setUser] = useState<PiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to connect in Pi Browser");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [amount, setAmount] = useState("0.1");
  const [conway, setConway] = useState<any>(null);
  const [advisorMessage, setAdvisorMessage] = useState("Explain the current production readiness.");
  const [advisorReply, setAdvisorReply] = useState<any>(null);
  const [serviceHealth, setServiceHealth] = useState<any>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDraft, setProjectDraft] = useState<string | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_PI_BACKEND_URL || "").replace(/\/$/, "");
  const sandbox = process.env.NEXT_PUBLIC_PI_SANDBOX !== "false";
  const backendConfigured = Boolean(backendUrl);

  const modeLabel = useMemo(
    () => (sandbox ? "Pi Sandbox / Testnet" : "Pi Production"),
    [sandbox],
  );

  async function backendFetch(path: string, init: RequestInit = {}) {
    if (!backendUrl) {
      throw new Error("Backend URL is not configured for this deployment.");
    }
    return fetch(`${backendUrl}${path}`, init);
  }

  async function authenticatePiUser() {
    try {
      setLoading(true);
      setError(null);

      const Pi = window.Pi;
      if (!Pi) throw new Error("Pi SDK is not available. Open this app in Pi Browser.");

      Pi.init({ version: "2.0", sandbox });
      setStatus("Authenticating with Pi…");

      const auth = await Pi.authenticate(
        ["username", "payments"],
        async (payment: any) => {
          const paymentId = payment?.identifier;
          const txid = payment?.transaction?.txid;
          if (!backendConfigured || !paymentId || !txid) return;

          await backendFetch("/api/payments/incomplete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          });
        },
      );

      const verify = await backendFetch("/api/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      const verified = await verify.json().catch(() => ({}));

      if (!verify.ok || !verified?.uid) {
        throw new Error(verified?.error || "Server-side Pi identity verification failed.");
      }

      setAccessToken(auth.accessToken);
      setUser({ uid: verified.uid, username: verified.username });
      setStatus(`Verified Pioneer${verified.username ? ` @${verified.username}` : ""}`);
    } catch (err: any) {
      setUser(null);
      setAccessToken(null);
      setStatus("Not connected");
      setError(err?.message || "Pi authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function createPiPayment() {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > 1000) {
      setError("Enter a Pi amount greater than 0 and no more than 1000.");
      return;
    }
    if (!accessToken || !window.Pi) {
      setError("Authenticate with Pi first.");
      return;
    }

    setPaymentLoading(true);
    setError(null);
    setStatus("Opening Pi payment…");

    try {
      await window.Pi.createPayment(
        {
          amount: numericAmount,
          memo: "Qmoosa Pi platform payment",
          metadata: { source: "qmoosa-pi", feature: "platform_support" },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            const res = await backendFetch("/api/payments/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ paymentId }),
            });
            if (!res.ok) {
              const body = await res.json().catch(() => ({}));
              throw new Error(body?.error || "Server approval failed");
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            const res = await backendFetch("/api/payments/complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ paymentId, txid }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.error || "Server completion failed");
            setStatus(`Payment completed: ${txid.slice(0, 16)}…`);
            setPaymentLoading(false);
          },
          onCancel: () => {
            setStatus("Payment cancelled");
            setPaymentLoading(false);
          },
          onError: (paymentError) => {
            setError(paymentError?.message || "Pi payment failed");
            setStatus("Payment failed");
            setPaymentLoading(false);
          },
        },
      );
    } catch (err: any) {
      setError(err?.message || "Could not start Pi payment");
      setStatus("Payment failed");
      setPaymentLoading(false);
    }
  }

  async function loadServiceHealth() {
    try {
      setError(null);
      const res = await backendFetch("/health");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Backend health check failed");
      setServiceHealth(body);
    } catch (err: any) {
      setError(err?.message || "Backend health check failed");
    }
  }

  async function conwayAction(action: "state" | "step" | "reset") {
    try {
      setError(null);
      const path = action === "state" ? "/api/v1/conway/state" : `/api/v1/conway/${action}`;
      const res = await backendFetch(path, action === "state" ? {} : {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "step" ? JSON.stringify({ steps: 1 }) : JSON.stringify({ preset: "glider" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Conway request failed");
      setConway(body);
    } catch (err: any) {
      setError(err?.message || "Conway request failed");
    }
  }

  async function askAdvisor() {
    try {
      setError(null);
      const res = await backendFetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: advisorMessage, agentType: "navigator" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Advisor request failed");
      setAdvisorReply(body);
    } catch (err: any) {
      setError(err?.message || "Advisor request failed");
    }
  }

  function saveLocalProjectDraft() {
    const name = projectName.trim();
    if (!name) {
      setError("Enter a project name.");
      return;
    }
    setError(null);
    setProjectDraft(name);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Pi-native computational platform
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Qmoosa Pi</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Secure Pi authentication and U2A payment handshake with an experimental Conway,
            agentic and post-quantum research layer. Experimental modules are not represented
            as Pi Mainnet approvals or production PQC.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase text-slate-500">Network mode</p>
            <p className="mt-2 font-semibold">{modeLabel}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase text-slate-500">Backend</p>
            <p className="mt-2 font-semibold">
              {backendConfigured ? "Configured" : "Not configured"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase text-slate-500">Identity</p>
            <p className="mt-2 font-semibold">{user ? "Server verified" : "Not connected"}</p>
          </div>
        </section>

        {!backendConfigured && (
          <div className="mt-6 rounded-xl border border-amber-700/50 bg-amber-950/40 p-4 text-sm text-amber-200">
            This static frontend is deployed, but Pi authentication/payment cannot be production-active
            until NEXT_PUBLIC_PI_BACKEND_URL points to the deployed Qmoosa Pi backend.
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Pi identity</h2>
          <p className="mt-2 text-sm text-slate-400">{status}</p>

          {!user ? (
            <button
              onClick={authenticatePiUser}
              disabled={loading || !backendConfigured}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Authenticating…" : "Login with Pi"}
            </button>
          ) : (
            <div className="mt-5 rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-4">
              <p className="font-semibold text-emerald-300">Server-verified Pioneer</p>
              {user.username && <p className="mt-1 text-sm">@{user.username}</p>}
              <p className="mt-1 break-all text-xs text-slate-400">UID: {user.uid}</p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Pi U2A payment test</h2>
          <p className="mt-2 text-sm text-slate-400">
            Payment is marked complete only after the backend receives a successful Pi Platform
            completion response.
          </p>
          <div className="mt-5 flex max-w-md gap-3">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              aria-label="Pi amount"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />
            <button
              onClick={createPiPayment}
              disabled={!user || paymentLoading || !backendConfigured}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paymentLoading ? "Processing…" : "Pay with Pi"}
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Conway Lab</h2>
            <p className="mt-2 text-sm text-slate-400">
              Calls the real backend B3/S23 engine. State is currently in-memory.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={!backendConfigured} onClick={() => conwayAction("state")} className="rounded-lg bg-slate-700 px-3 py-2 disabled:opacity-40">Load state</button>
              <button disabled={!backendConfigured} onClick={() => conwayAction("step")} className="rounded-lg bg-violet-600 px-3 py-2 disabled:opacity-40">Step</button>
              <button disabled={!backendConfigured} onClick={() => conwayAction("reset")} className="rounded-lg bg-slate-700 px-3 py-2 disabled:opacity-40">Reset glider</button>
            </div>
            {conway && (
              <div className="mt-4 rounded-xl bg-slate-950 p-4 text-sm">
                <p>Generation: {conway.generation ?? "—"}</p>
                <p>Live cells: {conway.liveCells ?? "—"}</p>
                <p className="mt-1 break-all text-xs text-slate-500">State hash: {conway.stateHash ?? "—"}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Agent Advisor</h2>
            <p className="mt-2 text-sm text-slate-400">
              Rules-based advisor endpoint. It is intentionally not labeled as production multi-model AI.
            </p>
            <textarea
              value={advisorMessage}
              onChange={(event) => setAdvisorMessage(event.target.value)}
              className="mt-4 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
              maxLength={4000}
            />
            <button disabled={!backendConfigured} onClick={askAdvisor} className="mt-3 rounded-lg bg-violet-600 px-4 py-2 disabled:opacity-40">
              Ask advisor
            </button>
            {advisorReply && (
              <div className="mt-4 rounded-xl bg-slate-950 p-4 text-sm">
                <p className="font-semibold">{advisorReply.agent}</p>
                <p className="mt-2 text-slate-300">{advisorReply.reply}</p>
                <p className="mt-2 text-xs text-slate-500">Mode: {advisorReply.mode}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Runtime & x402 status</h2>
            <p className="mt-2 text-sm text-slate-400">
              x402 remains disabled unless a real external settlement verifier is configured.
            </p>
            <button disabled={!backendConfigured} onClick={loadServiceHealth} className="mt-4 rounded-lg bg-slate-700 px-4 py-2 disabled:opacity-40">
              Check backend
            </button>
            {serviceHealth && (
              <div className="mt-4 rounded-xl bg-slate-950 p-4 text-sm">
                <p>Backend: {serviceHealth.ok ? "healthy" : "unhealthy"}</p>
                <p>Pi API key: {serviceHealth.piApiConfigured ? "configured" : "not configured"}</p>
                <p>x402: {serviceHealth.x402BazaarReady ? "verifier configured" : "disabled"}</p>
                <p>PQC: {serviceHealth.postQuantum}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Launchpad Draft</h2>
            <p className="mt-2 text-sm text-slate-400">
              Create a local project draft for review. Publishing/persistence is not enabled until a production database and moderation workflow exist.
            </p>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Project name"
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              maxLength={80}
            />
            <button onClick={saveLocalProjectDraft} className="mt-3 rounded-lg bg-emerald-700 px-4 py-2">
              Save local draft
            </button>
            {projectDraft && (
              <p className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-emerald-300">
                Draft ready: {projectDraft}
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Security layers</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <p className="rounded-xl bg-slate-950 p-4 text-sm text-slate-300">
              <strong>PQC:</strong> adapter target only. Real ML-DSA/ML-KEM signing is not enabled.
            </p>
            <p className="rounded-xl bg-slate-950 p-4 text-sm text-slate-300">
              <strong>Integrity receipts:</strong> HMAC only when a server secret is explicitly configured.
            </p>
          </div>
        </section>

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-800/60 bg-red-950/40 p-4 text-red-200">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
