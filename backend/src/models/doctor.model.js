const mongoose = require("mongoose");

const softDeletePlugin = require("../plugins/softDelete.plugin");

const doctorSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  specialization: {
    type: String,
    required: true,
    trim: true
  },

  experience: {
    type: Number,
    required: true,
    min: 0
  },

  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },

  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
    index: true
  },

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
    index: true
  },

  availability: {
    type: String,
    enum: ["Available", "Unavailable"],
    default: "Available"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

},
{ timestamps: true }
);

doctorSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Doctor", doctorSchema);