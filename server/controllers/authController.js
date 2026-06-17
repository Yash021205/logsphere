const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ── helpers ─────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, systemId: user.systemId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// REGISTER
// No System record is created here any more.
// A System + systemId are provisioned only when the user claims a device
// (POST /api/devices/claim/:id). This prevents orphaned System documents.
const register = async (req, res) => {
  try {
    const { email, password, role, adminEmail } = req.body;

    if (!email || !password) {
      return res.status(400).send("Missing email or password");
    }

    const userRole = role === "Admin" ? "Admin" : "Client";

    if (userRole === "Client") {
      if (!adminEmail) {
        return res.status(400).send("Admin email is required for Client registration");
      }
      const adminExists = await User.findOne({ email: adminEmail, role: "Admin" });
      if (!adminExists) {
        return res.status(400).send("Admin not found with the provided email");
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role: userRole,
      systemId: null, // assigned after first device claim
      ...(userRole === "Client" && { adminEmail })
    });

    await user.save();

    res.json({
      message: "User registered successfully",
      role: userRole
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Registration failed");
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.warn(`Invalid password for: ${email}`);
      return res.status(400).send("Invalid credentials");
    }

    res.json({ token: signToken(user) });

  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
};

// REFRESH
// Re-reads the user's current systemId from the DB and issues a fresh JWT.
// Called by the dashboard immediately after a device is claimed so the user
// doesn't have to log out and back in.
const refresh = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("No token");

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always pull fresh data from DB so the new systemId is included
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).send("User not found");

    res.json({ token: signToken(user) });
  } catch (err) {
    console.error(err);
    res.status(401).send("Invalid token");
  }
};

module.exports = { register, login, refresh };