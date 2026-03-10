const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  address: {
    type: String
  },

  phone: {
    type: String
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

hospitalSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Hospital", hospitalSchema);