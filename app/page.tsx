"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

type PiUser = {
  uid: string;
  username?: string;
  walletAddress?: string;
};

type ServiceHealth = {
  ok?: boolean;
  piApiConfigured?: boolean;
  x402BazaarReady?: boolean;
  conwayEngine?: string;
  aiMode?: string;
  postQuantum?: string;
};

type ConwayState = {
  generation?: number;
  liveCells?: number;
  stateHash?: string;
  grid?: number[][];
};

const quickAmounts = ["0.1", "0.5", "1", "3.14"];

function shortValue(value?: string, head = 8, tail = 6) {
  if (!value) return "—";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export default function Page() {
  const [user, setUser] = useState<PiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to connect in Pi Browser");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [amount, setAmount] = useState("0.1");
  const [memo, setMemo] = useState("Qmoosa Pi platform payment");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [paymentIntentUrl, setPaymentIntentUrl] = useState("");
  const [conway, setConway] = useState<ConwayState | null>(null);
  const [advisorMessage, setAdvisorMessage] = useState("Explain the current production readiness.");
  const [advisorReply, setAdvisorReply] = useState<any>(null);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDraft, setProjectDraft] = useState<string | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_PI_BACKEND_URL || "").replace(/\/$/, "");
  const sandbox = process.env.NEXT_PUBLIC_PI_SANDBOX === "true";
  const piNetwork = (process.env.NEXT_PUBLIC_PI_NETWORK || "testnet").toLowerCase();
  const backendConfigured = Boolean(backendUrl);

  const modeLabel = useMemo(
    () => (sandbox ? "Pi Sandbox" : piNetwork === "testnet" ? "Pi Testnet" : "Pi Mainnet"),
    [sandbox, piNetwork],
  );

  const connected = Boolean(user && accessToken);
  const backendHealthy = serviceHealth?.ok === true;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedAmount = params.get("amount");
    const requestedMemo = params.get("memo");

    if (requestedAmount && Number.isFinite(Number(requestedAmount))) {
      setAmount(requestedAmount.slice(0, 16));
    }
    if (requestedMemo) {
      setMemo(requestedMemo.slice(0, 120));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const numericAmount = Number(amount);
    const url = new URL(window.location.href);
    url.search = "";
    if (Number.isFinite(numericAmount) && numericAmount > 0) {
      url.searchParams.set("amount", String(numericAmount));
    }
    if (memo.trim()) url.searchParams.set("memo", memo.trim());
    const intent = url.toString();
    setPaymentIntentUrl(intent);

    let active = true;
    QRCode.toDataURL(intent, {
      width: 384,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });

    return () => {
      active = false;
    };
  }, [amount, memo]);

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
      setNotice(null);

      const Pi = window.Pi;
      if (!Pi) throw new Error("Pi SDK is not available. Open this app in Pi Browser.");

      Pi.init({ version: "2.0", sandbox });
      setStatus("Authenticating with Pi…");

      const auth = await Pi.authenticate(
        ["username", "payments", "wallet_address"],
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
      setUser({
        uid: verified.uid,
        username: verified.username,
        walletAddress: verified.wallet_address,
      });
      setStatus(`Verified Pioneer${verified.username ? ` @${verified.username}` : ""}`);
      setNotice("Pi identity verified by the Qmoosa Pi backend.");
    } catch (err: any) {
      setUser(null);
      setAccessToken(null);
      setStatus("Not connected");
      setError(err?.message || "Pi authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function clearAppSession() {
    setUser(null);
    setAccessToken(null);
    setStatus("App session cleared");
    setNotice("Local Qmoosa Pi session cleared. Pi Network account permissions are unchanged.");
    setError(null);
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
    setNotice(null);
    setStatus("Opening Pi payment…");

    try {
      await window.Pi.createPayment(
        {
          amount: numericAmount,
          memo: memo.trim() || "Qmoosa Pi platform payment",
          metadata: { source: "qmoosa-pi", feature: "platform_support" },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            setStatus("Waiting for secure server approval…");
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
            setStatus("Verifying transaction completion…");
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
            setStatus(`Payment completed: ${shortValue(txid, 12, 8)}`);
            setNotice("Payment completion was confirmed by the backend.");
            setPaymentLoading(false);
          },
          onCancel: () => {
            setStatus("Payment cancelled");
            setNotice("No completion was recorded.");
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
      setHealthLoading(true);
      setError(null);
      const startedAt = performance.now();
      const res = await backendFetch("/health");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Backend health check failed");
      setServiceHealth({ ...body, latencyMs: Math.round(performance.now() - startedAt) });
      setNotice("Backend health check completed.");
    } catch (err: any) {
      setServiceHealth(null);
      setError(err?.message || "Backend health check failed");
    } finally {
      setHealthLoading(false);
    }
  }

  async function conwayAction(action: "state" | "step" | "reset") {
    try {
      setError(null);
      const path = action === "state" ? "/api/v1/conway/state" : `/api/v1/conway/${action}`;
      const res = await backendFetch(
        path,
        action === "state"
          ? {}
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body:
                action === "step"
                  ? JSON.stringify({ steps: 1 })
                  : JSON.stringify({ preset: "glider" }),
            },
      );
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

  async function copyPaymentIntent() {
    try {
      await navigator.clipboard.writeText(paymentIntentUrl);
      setNotice("Payment-intent link copied.");
      setError(null);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
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
    setNotice("Local launchpad draft created. Nothing was published.");
  }

  return (
    <main id="main-content" className="min-h-screen">
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>

      <header className="sticky top-0 z-50 border-b border-white/8 bg-slate-950/88 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-none">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-black text-white shadow-lg shadow-violet-950/40">
              π
            </span>
            <span>
              <span className="block text-sm font-bold tracking-wide text-white">Qmoosa Pi</span>
              <span className="block text-[11px] text-slate-400">Pi-native compute studio</span>
            </span>
          </a>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
            {[
              ["Overview", "#overview"],
              ["Wallet", "#wallet"],
              ["Pay", "#pay"],
              ["Labs", "#labs"],
              ["Developers", "#developers"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200 sm:inline-flex">
              {modeLabel}
            </span>
            <span
              className={`status-dot ${backendHealthy ? "status-dot-good" : "status-dot-idle"}`}
              title={backendHealthy ? "Backend healthy" : "Backend not yet checked"}
              aria-label={backendHealthy ? "Backend healthy" : "Backend status not yet checked"}
            />
          </div>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <section id="overview" className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 sm:p-10 lg:p-12">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />

          <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="trust-chip">Pi SDK 2.0</span>
                <span className="trust-chip">Server verified</span>
                <span className="trust-chip">Conway B3/S23</span>
                <span className="trust-chip">Open-source workflow</span>
              </div>

              <p className="eyebrow">COMPUTE · PAY · EXPERIMENT</p>
              <h1 className="mt-3 max-w-4xl text-balance text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                A calmer, safer way to build with Pi.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
                Qmoosa Pi combines verified Pioneer identity, official Pi payment handshakes,
                deterministic cellular computation, and clearly labeled experimental tooling in one
                mobile-first workspace.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#wallet" className="btn-primary">
                  Connect Pioneer
                  <span aria-hidden="true">→</span>
                </a>
                <a href="#labs" className="btn-secondary">
                  Explore Labs
                </a>
              </div>

              <p className="mt-5 max-w-2xl text-xs leading-5 text-slate-500">
                Qmoosa Pi does not describe experimental x402, multi-model AI, or PQC adapters as
                production-active until their real providers and verification paths are configured.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatusCard
                label="Network"
                value={modeLabel}
                detail={sandbox ? "Local development environment" : piNetwork === "testnet" ? "Hosted Test Pi environment" : "Hosted Mainnet environment"}
                tone="violet"
              />
              <StatusCard
                label="Backend"
                value={backendHealthy ? "Healthy" : backendConfigured ? "Configured" : "Not configured"}
                detail={serviceHealth && "latencyMs" in serviceHealth ? `${(serviceHealth as any).latencyMs} ms last check` : "Run health check below"}
                tone={backendHealthy ? "green" : "slate"}
              />
              <StatusCard
                label="Identity"
                value={connected ? "Verified" : "Disconnected"}
                detail={user?.username ? `@${user.username}` : "Connect with Pi Browser"}
                tone={connected ? "green" : "slate"}
              />
            </div>
          </div>
        </section>

        {(error || notice) && (
          <div
            className={`mt-5 rounded-2xl border p-4 text-sm ${error ? "border-rose-400/30 bg-rose-400/10 text-rose-100" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"}`}
            role={error ? "alert" : "status"}
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-4">
              <p>{error || notice}</p>
              <button
                className="min-h-8 min-w-8 rounded-lg text-current opacity-70 hover:opacity-100"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                }}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div id="workspace" className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section id="wallet" className="surface-card">
            <SectionHeading
              kicker="01 · IDENTITY"
              title="Pioneer connection"
              description="Connect through the official Pi SDK, then verify the access token on the Qmoosa backend before showing a verified state."
            />

            <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/60 p-5">
              <div className="flex items-start gap-4">
                <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${connected ? "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,.7)]" : "bg-slate-600"}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-white">{status}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {connected
                      ? "Your Qmoosa Pi app session is server-verified."
                      : "Pi Browser is required for real Pioneer authentication."}
                  </p>
                </div>
              </div>

              {user && (
                <dl className="mt-5 grid gap-3 rounded-xl border border-white/6 bg-black/20 p-4 text-sm">
                  <IdentityRow label="Username" value={user.username ? `@${user.username}` : "Not shared"} />
                  <IdentityRow label="App UID" value={shortValue(user.uid, 12, 8)} />
                  <IdentityRow label="Wallet" value={shortValue(user.walletAddress, 12, 8)} />
                </dl>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {!connected ? (
                  <button
                    onClick={authenticatePiUser}
                    disabled={loading || !backendConfigured}
                    className="btn-primary flex-1"
                  >
                    {loading ? "Verifying…" : "Connect with Pi"}
                  </button>
                ) : (
                  <button onClick={clearAppSession} className="btn-secondary flex-1">
                    Clear app session
                  </button>
                )}
                <button
                  onClick={loadServiceHealth}
                  disabled={!backendConfigured || healthLoading}
                  className="btn-tertiary flex-1"
                >
                  {healthLoading ? "Testing…" : "Test backend"}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniMetric label="Pi API key" value={serviceHealth?.piApiConfigured ? "Configured" : "Not verified"} />
              <MiniMetric label="x402" value={serviceHealth?.x402BazaarReady ? "Verifier ready" : "Disabled"} />
              <MiniMetric label="Advisor" value={serviceHealth?.aiMode || "Rules-based"} />
              <MiniMetric label="PQC" value="Adapter target" />
            </div>
          </section>

          <section id="pay" className="surface-card">
            <SectionHeading
              kicker="02 · PAYMENTS"
              title="Pi payment studio"
              description="Prepare a shareable payment intent, then settle the actual transaction through Pi.createPayment and the backend approval/completion flow."
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div>
                <label className="field-label" htmlFor="amount">
                  Amount in Pi
                </label>
                <div className="relative mt-2">
                  <input
                    id="amount"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    inputMode="decimal"
                    className="field-input pr-14"
                    placeholder="0.1"
                    aria-describedby="amount-help"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-bold text-violet-300">
                    π
                  </span>
                </div>
                <p id="amount-help" className="mt-2 text-xs text-slate-500">
                  Accepted by this app: greater than 0 and up to 1000 Pi.
                </p>

                <div className="mt-3 flex flex-wrap gap-2" aria-label="Quick amount choices">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(value)}
                      className={`chip-button ${amount === value ? "chip-button-active" : ""}`}
                    >
                      {value} π
                    </button>
                  ))}
                </div>

                <label className="field-label mt-6 block" htmlFor="memo">
                  Payment memo
                </label>
                <textarea
                  id="memo"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value.slice(0, 120))}
                  className="field-input mt-2 min-h-24 resize-y"
                  placeholder="What is this payment for?"
                  maxLength={120}
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Shown in the Pi payment confirmation.</span>
                  <span>{memo.length}/120</span>
                </div>

                <button
                  onClick={createPiPayment}
                  disabled={!connected || paymentLoading || !backendConfigured}
                  className="btn-primary mt-6 w-full"
                >
                  {paymentLoading ? "Processing payment…" : "Pay with Pi SDK"}
                </button>
                {!connected && (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Connect and verify your Pioneer identity before starting a payment.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="mx-auto grid aspect-square w-full max-w-[240px] place-items-center overflow-hidden rounded-2xl bg-white p-3">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR code for a shareable Qmoosa Pi payment intent link"
                      className="h-full w-full"
                    />
                  ) : (
                    <span className="text-sm text-slate-700">QR unavailable</span>
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold text-white">Share payment intent</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  This QR opens Qmoosa Pi with the amount and memo prefilled. Actual settlement still
                  uses the official Pi SDK flow.
                </p>
                <div className="mt-4 grid gap-2">
                  <button onClick={copyPaymentIntent} className="btn-tertiary w-full">
                    Copy intent link
                  </button>
                  {qrDataUrl && (
                    <a
                      href={qrDataUrl}
                      download="qmoosa-pi-payment-intent.png"
                      className="btn-tertiary w-full"
                    >
                      Download QR PNG
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section id="labs" className="mt-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <SectionHeading
              kicker="03 · LABS"
              title="Computation workspace"
              description="Useful experimental modules stay functional while their production boundaries remain explicit."
            />
            <span className="self-start rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
              Experimental layer
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="surface-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">CONWAY ENGINE</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">B3/S23 simulator</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Deterministic backend evolution with a state hash. Current server state is in-memory.
                  </p>
                </div>
                <span className="feature-badge">Live API</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button disabled={!backendConfigured} onClick={() => conwayAction("state")} className="btn-tertiary">
                  Load state
                </button>
                <button disabled={!backendConfigured} onClick={() => conwayAction("step")} className="btn-primary">
                  Step +1
                </button>
                <button disabled={!backendConfigured} onClick={() => conwayAction("reset")} className="btn-tertiary">
                  Reset glider
                </button>
              </div>

              {conway ? (
                <div className="mt-5 grid gap-4 rounded-2xl border border-white/8 bg-black/20 p-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      <MiniMetric label="Generation" value={String(conway.generation ?? "—")} />
                      <MiniMetric label="Live cells" value={String(conway.liveCells ?? "—")} />
                    </div>
                    <p className="mt-4 text-xs text-slate-500">State hash</p>
                    <code className="mt-1 block break-all text-xs leading-5 text-slate-300">
                      {conway.stateHash ?? "—"}
                    </code>
                  </div>
                  {conway.grid && (
                    <div
                      className="grid h-36 w-36 gap-px overflow-hidden rounded-xl border border-white/8 bg-slate-900 p-1"
                      style={{ gridTemplateColumns: `repeat(${conway.grid[0]?.length || 1}, minmax(0, 1fr))` }}
                      role="img"
                      aria-label={`Conway grid, generation ${conway.generation ?? 0}`}
                    >
                      {conway.grid.flat().map((cell, index) => (
                        <span
                          key={index}
                          className={cell ? "rounded-[1px] bg-violet-400" : "rounded-[1px] bg-slate-800"}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState text="Load the backend state to inspect the current automaton." />
              )}
            </article>

            <article className="surface-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">AGENT ADVISOR</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">Pi ecosystem navigator</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    A rules-based advisor endpoint—not a production multi-model AI provider.
                  </p>
                </div>
                <span className="feature-badge">Rules-based</span>
              </div>

              <label className="field-label mt-5 block" htmlFor="advisor-message">
                Ask about architecture or readiness
              </label>
              <textarea
                id="advisor-message"
                value={advisorMessage}
                onChange={(event) => setAdvisorMessage(event.target.value)}
                className="field-input mt-2 min-h-32 resize-y"
                maxLength={4000}
              />
              <button disabled={!backendConfigured} onClick={askAdvisor} className="btn-primary mt-4">
                Ask advisor
              </button>

              {advisorReply ? (
                <div className="mt-5 rounded-2xl border border-violet-400/15 bg-violet-400/[0.06] p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{advisorReply.agent}</p>
                    <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      {advisorReply.mode}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{advisorReply.reply}</p>
                </div>
              ) : (
                <EmptyState text="Ask a question to inspect the current rules-based guidance." />
              )}
            </article>
          </div>
        </section>

        <section id="developers" className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="surface-card">
            <SectionHeading
              kicker="04 · LAUNCHPAD"
              title="Project draft"
              description="Capture a project concept locally without pretending it is published or persisted."
            />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="project-name">
                Project name
              </label>
              <input
                id="project-name"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Project name"
                className="field-input flex-1"
                maxLength={80}
              />
              <button onClick={saveLocalProjectDraft} className="btn-primary shrink-0">
                Create draft
              </button>
            </div>
            {projectDraft && (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
                Draft ready: <strong>{projectDraft}</strong>
              </div>
            )}
          </article>

          <article className="surface-card">
            <SectionHeading
              kicker="SYSTEM STATUS"
              title="Truthful capability map"
              description="The interface separates verified runtime capabilities from future integrations."
            />
            <div className="mt-5 space-y-3">
              <CapabilityRow label="Pi frontend SDK" status="Implemented" tone="good" />
              <CapabilityRow label="Backend runtime" status={backendHealthy ? "Healthy" : "Deployed"} tone="good" />
              <CapabilityRow label="Pi payment settlement" status="Requires real Pi API key" tone="pending" />
              <CapabilityRow label="x402 settlement" status="Disabled until verifier exists" tone="pending" />
              <CapabilityRow label="Multi-model AI" status="Provider not configured" tone="pending" />
              <CapabilityRow label="ML-DSA / ML-KEM" status="Architecture target" tone="pending" />
            </div>
          </article>
        </section>

        <footer className="mt-10 border-t border-white/8 pt-8 text-sm text-slate-500">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-slate-300">Qmoosa Pi</p>
              <p className="mt-1">Open, testable, and explicit about what is production-ready.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a className="footer-link" href="https://github.com/elon00/qmoosa-pi" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="footer-link" href="#overview">Back to top</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="eyebrow">{kicker}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "violet" | "green" | "slate";
}) {
  const toneClass = {
    violet: "border-violet-400/20 bg-violet-400/[0.06]",
    green: "border-emerald-400/20 bg-emerald-400/[0.06]",
    slate: "border-white/8 bg-white/[0.03]",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate font-mono text-xs text-slate-200" title={value}>
        {value}
      </dd>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/7 bg-white/[0.025] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-200" title={value}>
        {value}
      </p>
    </div>
  );
}

function CapabilityRow({
  label,
  status,
  tone,
}: {
  label: string;
  status: string;
  tone: "good" | "pending";
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/7 bg-white/[0.025] px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tone === "good" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}
      >
        {status}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-sm text-slate-500">
      {text}
    </div>
  );
}
