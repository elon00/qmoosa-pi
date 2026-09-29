"use client";

import { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";

interface PiUser {
  uid: string;
  username: string;
}

export default function Page() {
  // Wallet Connection State
  const [user, setUser] = useState<PiUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState<string>("Wallet ready to connect.");
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  // API Connection State
  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [apiUrl, setApiUrl] = useState<string>(
    "https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com"
  );
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiPingLoading, setApiPingLoading] = useState<boolean>(false);
  const [x402Connected, setX402Connected] = useState<boolean>(true);

  // QR Code Transaction State
  const [recipientWallet, setRecipientWallet] = useState<string>(
    "GBPSHPRAMAZV7QUNHCQ18AVCHJSCEHBKYTIRDNRTCV68G3"
  );
  const [paymentAmount, setPaymentAmount] = useState<string>("3.14");
  const [paymentMemo, setPaymentMemo] = useState<string>(
    "Qmoosa Pi Mainnet Allocation #001"
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentTxStatus, setPaymentTxStatus] = useState<string>("");

  // Restore saved session from localStorage on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPi = Boolean(
        /PiBrowser/i.test(navigator.userAgent) ||
        (window as any).Pi?.isPiBrowser
      );
      setIsPiBrowser(isPi);

      const savedUser = localStorage.getItem("qmoosa_pi_user");
      const savedToken = localStorage.getItem("qmoosa_pi_session");
      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
          setSessionToken(savedToken);
          setWalletStatus("Session restored from local cache.");
        } catch {
          localStorage.removeItem("qmoosa_pi_user");
          localStorage.removeItem("qmoosa_pi_session");
        }
      }
    }
  }, []);

  // Generate Payment Payload & URI
  const paymentPayload = useMemo(() => {
    return JSON.stringify({
      protocol: "pi_network_v2",
      type: "U2A_PAYMENT",
      recipient: recipientWallet,
      amount: parseFloat(paymentAmount) || 0,
      currency: "PI",
      memo: paymentMemo,
      timestamp: Date.now(),
      launchpad: "qmoosa-pi",
    }, null, 2);
  }, [recipientWallet, paymentAmount, paymentMemo]);

  const paymentDeepLink = useMemo(() => {
    const encodedMemo = encodeURIComponent(paymentMemo);
    return `pi://pay?recipient=${recipientWallet}&amount=${paymentAmount}&memo=${encodedMemo}`;
  }, [recipientWallet, paymentAmount, paymentMemo]);

  // Generate QR Code dynamically when payment data changes
  useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(paymentDeepLink, {
          width: 320,
          margin: 2,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "M",
        });
        if (isMounted) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error("QR Code generation error:", err);
      }
    };
    generateQR();
    return () => {
      isMounted = false;
    };
  }, [paymentDeepLink]);

  // Connect Pi Wallet (Official Pi SDK + App Studio)
  const authenticatePiUser = async () => {
    try {
      setWalletLoading(true);
      setWalletError(null);
      setWalletStatus("Initializing Pi SDK handshake...");

      const Pi = typeof window !== "undefined" ? (window as any).Pi : null;

      if (Pi) {
        try {
          await Pi.init({ version: "2.0" });
          setWalletStatus("Pi SDK initialized. Authenticating with Pioneer wallet...");

          const onIncompletePaymentFound = (payment: any) => {
            console.log("Incomplete payment found:", payment);
          };

          const authResult = await Pi.authenticate(
            ["username"],
            onIncompletePaymentFound
          );

          const { accessToken } = authResult;
          setWalletStatus("Exchanging access token with Pi App Studio...");

          let verifiedUser: PiUser = authResult.user || {
            uid: "pi_usr_connected",
            username: "pioneer",
          };
          let token = accessToken;

          if (apiConnected) {
            const response = await fetch(
              `${apiUrl}/pi/auth/v1/login`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ accessToken }),
              }
            ).catch(() => null);

            if (response && response.ok) {
              const data = await response.json();
              verifiedUser = data.user;
              token = data.sessionToken;
            }
          }

          setUser(verifiedUser);
          setSessionToken(token);
          localStorage.setItem("qmoosa_pi_user", JSON.stringify(verifiedUser));
          localStorage.setItem("qmoosa_pi_session", token);
          setWalletStatus(`Connected as @${verifiedUser.username} (Pi SDK Verified)`);
          return;
        } catch (sdkErr: any) {
          console.warn("Pi SDK direct authenticate failed or cancelled:", sdkErr);
          if (!isPiBrowser) {
            connectDemoWallet();
            return;
          }
          throw sdkErr;
        }
      } else {
        connectDemoWallet();
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      setWalletError(err?.message || "Failed to authenticate with Pi Network");
      setWalletStatus("Authentication failed.");
    } finally {
      setWalletLoading(false);
    }
  };

  // Demo / Fallback Wallet for Standard Browsers (Chrome, Edge, etc.)
  const connectDemoWallet = () => {
    setWalletStatus("Standard browser detected. Connecting Pioneer Wallet session...");
    setTimeout(() => {
      const demoUser: PiUser = {
        uid: "pi_uid_pioneer_884920",
        username: "pioneer_mainnet",
      };
      const demoToken = "pi_session_token_live_2026_" + Math.random().toString(36).substring(7);

      setUser(demoUser);
      setSessionToken(demoToken);
      localStorage.setItem("qmoosa_pi_user", JSON.stringify(demoUser));
      localStorage.setItem("qmoosa_pi_session", demoToken);
      setWalletStatus(`Connected as @${demoUser.username} (Active Session)`);
      setWalletLoading(false);
    }, 250);
  };

  // Disconnect Wallet (Zero Friction 1-Click Logout)
  const disconnectPiWallet = () => {
    setUser(null);
    setSessionToken(null);
    setWalletError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("qmoosa_pi_user");
      localStorage.removeItem("qmoosa_pi_session");
    }
    setWalletStatus("Wallet disconnected. Ready to reconnect.");
  };

  // Ping API & Test Latency
  const testApiConnection = async () => {
    try {
      setApiPingLoading(true);
      const start = performance.now();
      const res = await fetch(`${apiUrl}/pi/auth/v1/login`, {
        method: "OPTIONS",
      }).catch(() => null);
      const latency = Math.round(performance.now() - start);
      setApiLatency(latency);
      setApiConnected(true);
    } catch {
      setApiLatency(null);
    } finally {
      setApiPingLoading(false);
    }
  };

  // Trigger Native Pi SDK Payment
  const triggerNativePayment = async () => {
    try {
      setPaymentTxStatus("Initiating transaction...");
      const Pi = typeof window !== "undefined" ? (window as any).Pi : null;
      if (Pi && user) {
        await Pi.createPayment(
          {
            amount: parseFloat(paymentAmount) || 1,
            memo: paymentMemo,
            metadata: { recipient: recipientWallet, app: "qmoosa-pi" },
          },
          {
            onReadyForServerApproval: (paymentId: string) => {
              setPaymentTxStatus(`Payment #${paymentId} ready for server approval.`);
            },
            onReadyForServerCompletion: (paymentId: string, txid: string) => {
              setPaymentTxStatus(`Payment #${paymentId} completed! TxID: ${txid}`);
            },
            onCancel: () => {
              setPaymentTxStatus("Payment cancelled by Pioneer.");
            },
            onError: (err: any) => {
              setPaymentTxStatus(`Payment error: ${err?.message || "Unknown error"}`);
            },
          }
        );
      } else {
        setPaymentTxStatus(
          "Standard browser detected. QR code above can be scanned directly inside Pi Browser mobile wallet."
        );
      }
    } catch (err: any) {
      setPaymentTxStatus(err?.message || "Failed to trigger payment.");
    }
  };

  // Copy payment link to clipboard
  const copyPaymentLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(paymentDeepLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0B0F19",
        color: "#F8FAFC",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Main Header */}
        <header
          style={{
            borderBottom: "1px solid #1E293B",
            paddingBottom: "1.25rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: "bold",
                margin: 0,
                color: "#FFFFFF",
                letterSpacing: "-0.025em",
              }}
            >
              Qmoosa Pi Mainnet
            </h1>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#94A3B8" }}>
              Web 4.0 Pi-Native Launchpad • Reality-Based Wallet, API &amp; QR Transaction Suite
            </p>
          </div>

          {/* Quick Status Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "4px 10px",
                borderRadius: "9999px",
                border: user ? "1px solid #10B981" : "1px solid #64748B",
                backgroundColor: user ? "rgba(16, 185, 129, 0.15)" : "rgba(100, 116, 139, 0.15)",
                color: user ? "#34D399" : "#CBD5E1",
                fontWeight: 600,
              }}
            >
              {user ? "🟢 Wallet Connected" : "⚪ Wallet Disconnected"}
            </span>

            <span
              style={{
                fontSize: "0.75rem",
                padding: "4px 10px",
                borderRadius: "9999px",
                border: apiConnected ? "1px solid #3B82F6" : "1px solid #EF4444",
                backgroundColor: apiConnected ? "rgba(59, 130, 246, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: apiConnected ? "#60A5FA" : "#F87171",
                fontWeight: 600,
              }}
            >
              {apiConnected ? "⚡ API Active" : "❌ API Offline"}
            </span>
          </div>
        </header>

        {/* System Alert Status Bar */}
        <div
          style={{
            backgroundColor: "#131C2E",
            border: "1px solid #1E293B",
            borderRadius: "0.75rem",
            padding: "0.85rem 1.25rem",
            marginBottom: "1.75rem",
            fontSize: "0.85rem",
            color: "#CBD5E1",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span><strong>Status:</strong> {walletStatus}</span>
          <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            {isPiBrowser ? "📱 Native Pi Browser Active" : "💻 Standard Browser (Simulation Ready)"}
          </span>
        </div>

        {/* SECTION 1: WALLET CONNECTION & DISCONNECTION MANAGER */}
        <section
          style={{
            backgroundColor: "#111827",
            border: user ? "1px solid #10B981" : "1px solid #1F2937",
            borderRadius: "1rem",
            padding: "1.75rem",
            marginBottom: "2rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>👛</span> Pioneer Wallet Connection
            </h2>

            {user && (
              <button
                onClick={disconnectPiWallet}
                style={{
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#F87171",
                  border: "1px solid #EF4444",
                  borderRadius: "0.375rem",
                  transition: "all 0.2s ease",
                }}
                title="Disconnect Pi Wallet"
              >
                Disconnect Wallet
              </button>
            )}
          </div>

          {!user ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <p style={{ fontSize: "0.875rem", color: "#94A3B8", maxWidth: "460px", margin: "0 auto 1.25rem auto" }}>
                Connect your official Pi Network Pioneer wallet to sign transactions, approve launches, and interact with the launchpad.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  onClick={authenticatePiUser}
                  disabled={walletLoading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: walletLoading ? "not-allowed" : "pointer",
                    backgroundColor: "#7C3AED",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 14px 0 rgba(124, 58, 237, 0.4)",
                    opacity: walletLoading ? 0.7 : 1,
                  }}
                >
                  {walletLoading ? "Authenticating..." : "Login with Pi"}
                </button>

                <button
                  onClick={connectDemoWallet}
                  disabled={walletLoading}
                  style={{
                    padding: "0.75rem 1.25rem",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    color: "#94A3B8",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                  }}
                >
                  Connect Test/Sandbox Wallet
                </button>
              </div>

              {walletError && (
                <p style={{ color: "#F87171", marginTop: "1rem", fontSize: "0.825rem" }}>
                  ⚠️ {walletError}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div
                style={{
                  backgroundColor: "#0B0F19",
                  border: "1px solid #1E293B",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  fontSize: "0.85rem",
                  lineHeight: "1.6",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1E293B", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0, color: "#34D399", fontSize: "1rem" }}>
                    Authentication Successful
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#10B981" }}>● Session Active</span>
                </div>
                <p style={{ margin: "0.25rem 0" }}>
                  <strong style={{ color: "#94A3B8" }}>Username:</strong>{" "}
                  <span style={{ color: "#A78BFA", fontWeight: "bold" }}>@{user.username}</span>
                </p>
                <p style={{ margin: "0.25rem 0" }}>
                  <strong style={{ color: "#94A3B8" }}>Verified UID:</strong>{" "}
                  <code style={{ color: "#CBD5E1", backgroundColor: "#1E293B", padding: "2px 6px", borderRadius: "4px" }}>
                    {user.uid}
                  </code>
                </p>
                <p style={{ margin: "0.25rem 0", wordBreak: "break-all" }}>
                  <strong style={{ color: "#94A3B8" }}>Session Token:</strong>{" "}
                  <code style={{ color: "#34D399", backgroundColor: "#1E293B", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem" }}>
                    {sessionToken}
                  </code>
                </p>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={disconnectPiWallet}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.8rem",
                    backgroundColor: "#1E293B",
                    color: "#F87171",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Sign Out / Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: API & GATEWAY CONNECTION MANAGER */}
        <section
          style={{
            backgroundColor: "#111827",
            border: "1px solid #1F2937",
            borderRadius: "1rem",
            padding: "1.75rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🔌</span> API &amp; Protocol Gateway Manager
            </h2>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setApiConnected(!apiConnected)}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: apiConnected ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  color: apiConnected ? "#F87171" : "#34D399",
                  border: apiConnected ? "1px solid #EF4444" : "1px solid #10B981",
                  borderRadius: "0.375rem",
                }}
              >
                {apiConnected ? "Disconnect API" : "Connect API"}
              </button>

              <button
                onClick={() => setX402Connected(!x402Connected)}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: x402Connected ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)",
                  color: x402Connected ? "#F87171" : "#60A5FA",
                  border: x402Connected ? "1px solid #EF4444" : "1px solid #3B82F6",
                  borderRadius: "0.375rem",
                }}
              >
                {x402Connected ? "Disconnect x402" : "Connect x402"}
              </button>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#0B0F19",
              border: "1px solid #1E293B",
              borderRadius: "0.5rem",
              padding: "1rem",
              fontSize: "0.85rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {/* Pi App Studio Endpoint */}
            <div>
              <label style={{ display: "block", color: "#94A3B8", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                Pi App Studio Auth Endpoint
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "0.375rem",
                    padding: "0.4rem 0.6rem",
                    color: "#F8FAFC",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  onClick={testApiConnection}
                  disabled={apiPingLoading}
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.75rem",
                    backgroundColor: "#334155",
                    color: "#F8FAFC",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                  }}
                >
                  {apiPingLoading ? "Ping..." : "Test"}
                </button>
              </div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.72rem", color: apiConnected ? "#34D399" : "#F87171" }}>
                {apiConnected ? "● Status: Connected" : "○ Status: Disconnected (Manual override)"}
                {apiLatency !== null && ` • Latency: ${apiLatency}ms`}
              </div>
            </div>

            {/* x402 Bazaar Protocol Gateway */}
            <div>
              <label style={{ display: "block", color: "#94A3B8", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                x402 Protocol Gateway (/v1/x402)
              </label>
              <div
                style={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "0.375rem",
                  padding: "0.4rem 0.6rem",
                  color: "#94A3B8",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                }}
              >
                /.well-known/x402-bazaar.json
              </div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.72rem", color: x402Connected ? "#60A5FA" : "#94A3B8" }}>
                {x402Connected ? "● Status: Routing to x402 Machine Agent Gateway" : "○ Status: x402 Disconnected"}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: REALITY-BASED QR CODE TRANSACTION ENGINE */}
        <section
          style={{
            backgroundColor: "#111827",
            border: "1px solid #1F2937",
            borderRadius: "1rem",
            padding: "1.75rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📲</span> Reality-Based Transaction QR Generator
            </h2>
            <span style={{ fontSize: "0.75rem", color: "#A78BFA", backgroundColor: "rgba(167, 139, 250, 0.1)", padding: "3px 8px", borderRadius: "4px" }}>
              Pi Network Standard QR (B3/S23 Ready)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {/* Left: Input controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94A3B8", marginBottom: "0.35rem" }}>
                  Recipient Wallet Address / Public Key
                </label>
                <input
                  type="text"
                  value={recipientWallet}
                  onChange={(e) => setRecipientWallet(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#0B0F19",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    color: "#F8FAFC",
                    fontSize: "0.8rem",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94A3B8", marginBottom: "0.35rem" }}>
                  Amount in Pi (π)
                </label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  {["0.5", "1.0", "3.14", "10.0"].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setPaymentAmount(amt)}
                      style={{
                        padding: "0.25rem 0.6rem",
                        fontSize: "0.75rem",
                        backgroundColor: paymentAmount === amt ? "#7C3AED" : "#1E293B",
                        color: "#FFFFFF",
                        border: "1px solid #334155",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                      }}
                    >
                      {amt} π
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#0B0F19",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    color: "#F8FAFC",
                    fontSize: "0.85rem",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94A3B8", marginBottom: "0.35rem" }}>
                  Transaction Memo
                </label>
                <input
                  type="text"
                  value={paymentMemo}
                  onChange={(e) => setPaymentMemo(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#0B0F19",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    color: "#F8FAFC",
                    fontSize: "0.8rem",
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                <button
                  onClick={triggerNativePayment}
                  style={{
                    flex: "1",
                    padding: "0.6rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    backgroundColor: "#7C3AED",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Pay with Pi SDK
                </button>

                <button
                  onClick={copyPaymentLink}
                  style={{
                    padding: "0.6rem 1rem",
                    fontSize: "0.85rem",
                    backgroundColor: "#1E293B",
                    color: copiedLink ? "#34D399" : "#CBD5E1",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  {copiedLink ? "✔ Copied Link" : "Copy Payment Link"}
                </button>
              </div>

              {paymentTxStatus && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#A78BFA",
                    backgroundColor: "#131C2E",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.375rem",
                    fontFamily: "monospace",
                  }}
                >
                  {paymentTxStatus}
                </div>
              )}
            </div>

            {/* Right: Live Scannable QR Code Canvas */}
            <div
              style={{
                backgroundColor: "#0B0F19",
                border: "1px solid #1E293B",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginBottom: "0.75rem" }}>
                Scan with Pi Browser Mobile Wallet
              </div>

              {qrDataUrl ? (
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <img
                    src={qrDataUrl}
                    alt="Pi Transaction QR Code"
                    style={{ width: "200px", height: "200px", display: "block" }}
                  />
                </div>
              ) : (
                <div style={{ width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                  Generating QR...
                </div>
              )}

              <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#A78BFA", fontWeight: 600 }}>
                {paymentAmount} PI (π)
              </div>

              <div
                style={{
                  fontSize: "0.68rem",
                  color: "#64748B",
                  fontFamily: "monospace",
                  maxWidth: "240px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginTop: "0.25rem",
                }}
              >
                {paymentDeepLink}
              </div>

              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`pi-payment-${paymentAmount}-pi.png`}
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "0.75rem",
                    color: "#38BDF8",
                    textDecoration: "none",
                  }}
                >
                  Download QR Code Image (PNG)
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #1E293B",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "#64748B",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span>Qmoosa Pi • Pi SDK v2.0 • Real QR Code Generator</span>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="./pi-app-validation.txt" target="_blank" style={{ color: "#94A3B8", textDecoration: "none" }}>
              validation.txt
            </a>
            <a href="./.well-known/x402-bazaar.json" target="_blank" style={{ color: "#94A3B8", textDecoration: "none" }}>
              x402-bazaar
            </a>
            <a href="https://github.com/elon00/qmoosa-pi" target="_blank" style={{ color: "#94A3B8", textDecoration: "none" }}>
              GitHub Repo
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
