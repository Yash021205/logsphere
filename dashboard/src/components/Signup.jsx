import { useState } from "react";
import axios from "../api/axios";

export default function Signup() {

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

      alert("Signup successful!");

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
    </div>
  );
}