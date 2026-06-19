const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if not found to prevent email enumeration
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    // In production, BASE_URL should come from env. For local dev we use localhost:5173
    const origin = req.headers.origin || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password?token=${resetToken}&email=${email}`;

    // Send email
    // This is a test account setup for nodemailer. In prod, configure your real SMTP credentials
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
          user: process.env.EMAIL_USER || 'test@ethereal.email',
          pass: process.env.EMAIL_PASS || 'pass123',
      },
    });

    const mailOptions = {
      from: '"LogSphere Support" <support@logsphere.io>',
      to: user.email,
      subject: "LogSphere Password Reset",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You recently requested to reset your password for your LogSphere account.</p>
          <p>Click the button below to reset it. This link is valid for 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
          <p style="color: #64748b; font-size: 0.9em;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    // We don't await the sendMail in this mock example if the credentials are bad
    // because we want the response to go through.
    try {
        await transporter.sendMail(mailOptions);
    } catch (mailErr) {
        console.log("Could not send email. Ethereal account might be needed or SMTP not configured.", mailErr);
        // For development, just log the URL so the user can test the flow!
        console.log("\n=================================");
        console.log("TESTING MODE: Reset URL is:");
        console.log(resetUrl);
        console.log("=================================\n");
    }

    res.status(200).json({ message: "If that email exists, a reset link has been sent." });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error processing request." });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Set new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password." });
  }
};

module.exports = { register, login, refresh, forgotPassword, resetPassword };