const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  age: {
    type: Number,
    required: true
  },

  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  address: {
    type: String
  },

  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
  },

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
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

patientSchema.index({ hospitalId: 1, isDeleted: 1 });

module.exports = mongoose.model("Patient", patientSchema);