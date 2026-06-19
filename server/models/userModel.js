const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["Admin", "Client"],
    default: "Client"
  },
  systemId: {
    type: String,
    index: true
  },
  adminEmail: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },

  // ── Password reset ─────────────────────────────────────────────
  resetToken: {
    type: String,   // SHA-256 hash of the raw token sent by email
    default: null
  },
  resetTokenExpiry: {
    type: Date,     // Token expires after 1 hour
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("User", UserSchema);