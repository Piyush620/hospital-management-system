const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
{
  wardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ward",
    required: true,
    index: true
  },

  roomNumber: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    enum: ["General", "Private", "ICU"],
    default: "General"
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

},
{ timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);