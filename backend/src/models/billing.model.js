const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  description: {
    type: String
  },

  status: {
    type: String,
    enum: ["PENDING","PAID"],
    default: "PENDING"
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

},{timestamps:true});

module.exports =
mongoose.models.Billing ||
mongoose.model("Billing", billingSchema);