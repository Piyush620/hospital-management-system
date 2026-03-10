const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
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
    required: true,
    index: true
  },

  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  appointmentDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: [
      "SCHEDULED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW"
    ],
    default: "SCHEDULED"
  },

  notes: {
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

module.exports =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
