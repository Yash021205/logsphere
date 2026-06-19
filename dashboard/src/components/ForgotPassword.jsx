import { useState } from "react";
import axios from "../api/axios";

export default function ForgotPassword({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // { type: "success"|"error", msg }
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    if (!email) {
      setStatus({ type: "error", msg: "Please enter your email address." });
      return;
    }
    try {
      setLoading(true);
      setStatus(null);
      await axios.post("/auth/forgot-password", { email });
      setStatus({ type: "success", msg: "If that email exists, a reset link has been sent." });
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") handleForgot();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <label style={{ display: "block", fontSize: ".82rem", fontWeight: "600", color: "var(--muted)", marginBottom: "7px", textTransform: "uppercase", letterSpacing: ".06em" }}>
          Email address
        </label>
        <input
          className="ls-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={onKey}
        />
      </div>

      {status && (
        <div style={{ 
            padding: "10px 14px", 
            borderRadius: "8px", 
            background: status.type === "success" ? "rgba(22,163,74,0.12)" : "rgba(239,68,68,.1)", 
            border: `1px solid ${status.type === "success" ? "#16a34a" : "rgba(239,68,68,.3)"}`, 
            color: status.type === "success" ? "#22c55e" : "#f87171", 
            fontSize: ".85rem" 
        }}>
          {status.msg}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleForgot}
        disabled={loading}
        style={{ width: "100%", padding: "13px", fontSize: "1rem", marginTop: "4px" }}
      >
        {loading ? "Sending link…" : "Send Reset Link"}
      </button>

      <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".88rem" }}>
        Remember your password?{" "}
        <span onClick={onSwitch} style={{ color: "var(--p-300)", cursor: "pointer", fontWeight: "600" }}>
          Back to login
        </span>
      </p>
    </div>
  );
}
