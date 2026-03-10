const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
{
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
    index: true
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  bedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bed",
    required: true
  },

  admissionDate: {
    type: Date,
    default: Date.now
  },

  dischargeDate: {
    type: Date
  },

  status: {
    type: String,
    enum: ["ADMITTED", "DISCHARGED"],
    default: "ADMITTED"
  },

  reason: {
    type: String,
    trim: true
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

module.exports = mongoose.model("Admission", admissionSchema);