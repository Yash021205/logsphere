import { useState } from "react";
import axios from "../api/axios";

export default function Signup({ onSwitch }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [systemId, setSystemId] = useState("");

  const handleSignup = async () => {
    try {
      await axios.post("/auth/register", {
        email,
        password,
        systemId
      });

      alert("Signup successful! Please log in.");
      onSwitch(); // Switch back to login page
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Signup</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="System ID (companyA)"
        onChange={(e) => setSystemId(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSignup}>Signup</button>
      <p style={{ marginTop: "15px", cursor: "pointer", color: "#60a5fa" }} onClick={onSwitch}>
        Already have an account? Log in
      </p>
    </div>
  );
}