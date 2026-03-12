const Billing = require("../../models/billing.model");
const Admission = require("../../models/admission.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");
const { validateBillingCreate } = require("../../utils/validators");


exports.createBill = async (data, userId) => {
  validateBillingCreate(data);

  const admission = await Admission.findOne({
    _id: data.admissionId,
    isDeleted: false
  });

  if (!admission) {
    throw new ApiError(404, "Admission not found");
  }

  const bill = await Billing.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_BILL",
    "Billing",
    bill._id
  );

  return bill;
};


exports.getBills = async (hospitalId) => {

  if (!hospitalId) {
    throw new ApiError(400, "Hospital ID required");
  }

  return Billing
    .find({
      hospitalId,
      isDeleted: false
    })
    .populate("patientId")
    .populate("admissionId")
    .sort({ createdAt: -1 });

};


exports.updatePaymentStatus = async (id, userId) => {

  const bill = await Billing.findOne({
    _id: id,
    isDeleted: false
  });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  const updatedBill = await Billing.findByIdAndUpdate(
    id,
    { status: "PAID" },
    { new: true }
  );

  await logAction(
    userId,
    "PAYMENT_SUCCESS",
    "Billing",
    id
  );

  return updatedBill;
};


exports.updateBill = async (id, data, userId) => {

  const bill = await Billing.findOne({
    _id: id,
    isDeleted: false
  });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  const updatedBill = await Billing.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_BILL",
    "Billing",
    id
  );

  return updatedBill;
};


exports.deleteBill = async (id, userId) => {

  const bill = await Billing.findOne({
    _id: id,
    isDeleted: false
  });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  const deletedBill = await Billing.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_BILL",
    "Billing",
    id
  );

  return deletedBill;
};
