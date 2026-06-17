import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Signup({ onSwitch }) {
  const navigate  = useNavigate();
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [role,       setRole]       = useState("Client");
  const [adminEmail, setAdminEmail] = useState("");
  const [status,     setStatus]     = useState(null); // { type: "success"|"error", msg }
  const [loading,    setLoading]    = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setStatus(null);
      await axios.post("/auth/register", {
        email,
        password,
        role,
        ...(role === "Client" && { adminEmail })
      });
      setStatus({ type: "success", msg: "Account created! Redirecting to login…" });
      setTimeout(onSwitch, 1500);
    } catch (err) {
      const msg = err.response?.data || "Signup failed — please try again.";
      setStatus({ type: "error", msg: typeof msg === "string" ? msg : "Signup failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      <input
        className="btn-secondary"
        style={{ background: "rgba(255,255,255,0.05)", textAlign: "left", cursor: "text" }}
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        className="btn-secondary"
        style={{ background: "rgba(255,255,255,0.05)", textAlign: "left", cursor: "text" }}
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Account Role</label>
        <select
          className="btn-secondary"
          style={{ background: "rgba(255,255,255,0.05)", textAlign: "left", width: "100%" }}
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="Client">Client (Individual System)</option>
          <option value="Admin">Admin (Full Visibility)</option>
        </select>
      </div>

      {role === "Client" && (
        <input
          className="btn-secondary"
          style={{ background: "rgba(255,255,255,0.05)", textAlign: "left", cursor: "text" }}
          placeholder="Admin Email"
          value={adminEmail}
          onChange={e => setAdminEmail(e.target.value)}
        />
      )}

      {status && (
        <p style={{
          margin: 0,
          padding: "10px 14px",
          borderRadius: "8px",
          fontSize: "0.85rem",
          background: status.type === "success" ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
          color:      status.type === "success" ? "#22c55e" : "#ef4444",
          border:     `1px solid ${status.type === "success" ? "#16a34a" : "#dc2626"}`
        }}>
          {status.msg}
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleSignup}
        disabled={loading}
        style={{ marginTop: "10px", opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Creating account…" : "Sign Up"}
      </button>

      <p
        style={{ marginTop: "10px", cursor: "pointer", color: "#6366f1", textAlign: "center" }}
        onClick={onSwitch}
      >
        Already have an account? Log in
      </p>
    </div>
  );
}