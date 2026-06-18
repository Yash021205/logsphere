import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Login({ onSwitch }) {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    try {
      setLoading(true); setError("");
      const res = await axios.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") handleLogin(); };

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

      <div>
        <label style={{ display: "block", fontSize: ".82rem", fontWeight: "600", color: "var(--muted)", marginBottom: "7px", textTransform: "uppercase", letterSpacing: ".06em" }}>
          Password
        </label>
        <input
          className="ls-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={onKey}
        />
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", fontSize: ".85rem" }}>
          {error}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleLogin}
        disabled={loading}
        style={{ width: "100%", padding: "13px", fontSize: "1rem", marginTop: "4px" }}
      >
        {loading ? "Signing in…" : "Sign In →"}
      </button>

      <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".88rem" }}>
        Don't have an account?{" "}
        <span onClick={onSwitch} style={{ color: "var(--p-300)", cursor: "pointer", fontWeight: "600" }}>
          Create one
        </span>
      </p>
    </div>
  );
}