const Payment = require("../../models/payment.model");
const Billing = require("../../models/billing.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");


exports.createPayment = async (data, userId) => {

  const bill = await Billing.findById(data.billingId);

  if (!bill) {
    throw new ApiError(404, "Billing record not found");
  }

  const payment = await Payment.create({
    ...data,
    createdBy: userId,
    status: "Completed"
  });

  await Billing.findByIdAndUpdate(
    data.billingId,
    { status: "PAID" }
  );

  await logAction(
    userId,
    "CREATE_PAYMENT",
    "Payment",
    payment._id
  );

  return payment;
};


exports.getPayments = async (hospitalId) => {

  return Payment
    .find({
      hospitalId,
      isDeleted: false
    })
    .populate("billingId")
    .sort({ createdAt: -1 });

};


exports.updatePayment = async (id, data, userId) => {

  const payment = await Payment.findOne({
    _id: id,
    isDeleted: false
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const updatedPayment = await Payment.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_PAYMENT",
    "Payment",
    id
  );

  return updatedPayment;
};


exports.deletePayment = async (id, userId) => {

  const payment = await Payment.findOne({
    _id: id,
    isDeleted: false
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const deletedPayment = await Payment.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_PAYMENT",
    "Payment",
    id
  );

  return deletedPayment;
};