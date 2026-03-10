const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
{
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  billingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Billing",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  method: {
    type: String,
    enum: ["Cash", "Card", "UPI", "Insurance"],
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending"
  },

  transactionId: {
    type: String
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);

module.exports =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);
  
  