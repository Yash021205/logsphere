import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Login({ onSwitch }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <input
        className="btn-secondary"
        style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', cursor: 'text' }}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="btn-secondary"
        style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', cursor: 'text' }}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn-primary" onClick={handleLogin}>Login</button>
      
      <p style={{ marginTop: "10px", cursor: "pointer", color: "#6366f1", textAlign: 'center' }} onClick={onSwitch}>
        Don't have an account? Sign up
      </p>
    </div>
  );
}