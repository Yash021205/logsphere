import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import "../LandingPage.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null); // { type, msg }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setStatus({ type: "error", msg: "Invalid or missing password reset link." });
    }
  }, [token, email]);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setStatus({ type: "error", msg: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setStatus({ type: "error", msg: "Password must be at least 6 characters." });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);
      await axios.post("/auth/reset-password", { email, token, newPassword: password });
      setStatus({ type: "success", msg: "Password reset successful! Redirecting to login..." });
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password. The link may have expired.";
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && token && email) handleReset();
  };

  return (
    <div className="auth-wrap">
      <div className="lp-orbs">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
      </div>
      <div className="lp-grid" />

      <div className="auth-right" style={{ margin: "0 auto" }}>
        <div style={{ maxWidth: "380px", width: "100%", margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: "700", marginBottom: "6px", letterSpacing: "-.02em" }}>
            Set new password
          </h1>
          <p style={{ color: "var(--muted)", fontSize: ".92rem", marginBottom: "32px" }}>
            Please enter your new password below.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: ".82rem", fontWeight: "600", color: "var(--muted)", marginBottom: "7px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                New Password
              </label>
              <input
                className="ls-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onKey}
                disabled={!token || !email}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".82rem", fontWeight: "600", color: "var(--muted)", marginBottom: "7px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                Confirm Password
              </label>
              <input
                className="ls-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={onKey}
                disabled={!token || !email}
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
              onClick={handleReset}
              disabled={loading || !token || !email}
              style={{ width: "100%", padding: "13px", fontSize: "1rem", marginTop: "4px" }}
            >
              {loading ? "Resetting…" : "Reset Password"}
            </button>

            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".88rem" }}>
              <Link to="/auth" style={{ color: "var(--p-300)", textDecoration: "none", fontWeight: "600" }}>
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
