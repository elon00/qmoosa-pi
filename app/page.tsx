"use client";

import { useState } from "react";

export default function Page() {
  const [user, setUser] = useState<{ uid: string; username: string } | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticatePiUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const Pi = (window as any).Pi;
      if (!Pi) {
        throw new Error("Pi SDK not loaded");
      }

      await Pi.init({ version: "2.0" });

      const onIncompletePaymentFound = (payment: any) => {
        console.log("Incomplete payment found:", payment);
      };

      const authResult = await Pi.authenticate(
        ["username"],
        onIncompletePaymentFound
      );
      
      const { accessToken } = authResult;

      const response = await fetch(
        "https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "App Studio authentication failed");
      }

      setSessionToken(data.sessionToken);
      setUser(data.user);
    } catch (err: any) {
      console.error("Authentication Error:", err);
      setError(err.message || "Failed to authenticate with Pi Network");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Qmoosa Pi Mainnet</h1>
      
      {!user ? (
        <div>
          <button 
            onClick={authenticatePiUser} 
            disabled={loading}
            style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
          >
            {loading ? "Authenticating..." : "Login with Pi"}
          </button>
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      ) : (
        <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc" }}>
          <h2>Authentication Successful</h2>
          <p><strong>Verified UID:</strong> {user.uid}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Session Token:</strong> {sessionToken}</p>
        </div>
      )}
    </main>
  );
}
