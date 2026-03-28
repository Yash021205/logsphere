import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Signup({ onSwitch }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Client");

  const handleSignup = async () => {
    try {
      await axios.post("/auth/register", {
        email,
        password,
        role
      });

      alert("Signup successful! Please log in.");
      onSwitch(); // Switch back to login page
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <input
        className="btn-secondary"
        style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', cursor: 'text' }}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="btn-secondary"
        style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', cursor: 'text' }}
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Account Role</label>
        <select 
          className="btn-secondary" 
          style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', width: '100%' }}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Client">Client (Individual System)</option>
          <option value="Admin">Admin (Full Visibility)</option>
        </select>
      </div>

      <button className="btn-primary" onClick={handleSignup} style={{ marginTop: '10px' }}>Signup</button>
      <p style={{ marginTop: "10px", cursor: "pointer", color: "#6366f1", textAlign: 'center' }} onClick={onSwitch}>
        Already have an account? Log in
      </p>
    </div>
  );
}