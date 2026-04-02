const User = require("../models/userModel");
const System = require("../models/systemModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// REGISTER
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

    // Auto-generate system credentials for ALL users
    const assignedSystemId = "sys-" + crypto.randomBytes(4).toString("hex");
    const systemKey = crypto.randomBytes(16).toString("hex");

    const newSystem = new System({
      systemId: assignedSystemId,
      systemKey
    });
    await newSystem.save();

    const user = new User({
      email,
      password: hashedPassword,
      role: userRole,
      systemId: assignedSystemId,
      ...(userRole === "Client" && { adminEmail })
    });

    await user.save();

    res.json({ 
      message: "User registered successfully",
      role: userRole,
      systemId: assignedSystemId
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

    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      console.warn(`Invalid password for: ${email}`);
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        systemId: user.systemId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
};

module.exports = { register, login };