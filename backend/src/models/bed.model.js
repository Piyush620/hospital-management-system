const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({

  bedNumber: {
    type: String,
    required: true,
    trim: true
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
    index: true
  },

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
    index: true
  },

  status: {
    type: String,
    enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE"],
    default: "AVAILABLE"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Bed", bedSchema);