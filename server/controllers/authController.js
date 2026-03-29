const User = require("../models/userModel");
const System = require("../models/systemModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// REGISTER
const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).send("Missing email or password");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "Admin" ? "Admin" : "Client";

    let assignedSystemId = null;

    if (userRole === "Client") {
      // Auto-generate system credentials for Client
      assignedSystemId = "sys-" + crypto.randomBytes(4).toString("hex");
      const systemKey = crypto.randomBytes(16).toString("hex");

      const newSystem = new System({
        systemId: assignedSystemId,
        systemKey
      });
      await newSystem.save();
    }

    const user = new User({
      email,
      password: hashedPassword,
      role: userRole,
      systemId: assignedSystemId
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