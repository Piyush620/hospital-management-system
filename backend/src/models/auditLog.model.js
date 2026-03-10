const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  action: {
    type: String,
    required: true
  },

  module: {
    type: String,
    required: true
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("AuditLog", auditLogSchema);