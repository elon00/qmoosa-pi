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

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Conway Engine", "Backend engine implemented; persistent state is still a production gate."],
            ["Agentics", "Rules-based advisor exists; real multi-model inference provider is not yet configured."],
            ["PQC", "Integrity layer is adapter-ready; real ML-DSA/ML-KEM production signing remains pending."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{description}</p>
            </div>
          ))}
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
