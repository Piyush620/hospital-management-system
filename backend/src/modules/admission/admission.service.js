const Admission = require("../../models/admission.model");
const Bed = require("../../models/bed.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");
const { validateAdmissionCreate } = require("../../utils/validators");

const createAdmission = async (data, userId) => {
  validateAdmissionCreate(data);

  const bed = await Bed.findById(data.bedId);

  if (!bed) {
    throw new ApiError(404, "Bed not found");
  }

  if (bed.status === "OCCUPIED") {
    throw new ApiError(400, "Bed already occupied");
  }

  const admission = await Admission.create({
    ...data,
    createdBy: userId
  });

  await Bed.findByIdAndUpdate(data.bedId, {
    status: "OCCUPIED"
  });

  await logAction(
    userId,
    "ADMIT_PATIENT",
    "Admission",
    admission._id
  );

  return admission;
};

const getAdmissions = async (hospitalId) => {

  return Admission.find({
    hospitalId,
    isDeleted: false
  })
  .populate("patientId")
  .populate("doctorId")
  .populate("bedId")
  .sort({ createdAt: -1 });

};

const updateAdmission = async (id, data) => {

  const admission = await Admission.findById(id);

  if (!admission) {
    throw new ApiError(404, "Admission not found");
  }

  return Admission.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );
};

const dischargePatient = async (id, userId) => {

  const admission = await Admission.findById(id);

  if (!admission) {
    throw new ApiError(404, "Admission not found");
  }

  const updatedAdmission = await Admission.findByIdAndUpdate(
    id,
    {
      status: "DISCHARGED",
      dischargeDate: new Date()
    },
    { new: true }
  );

  await Bed.findByIdAndUpdate(
    admission.bedId,
    { status: "AVAILABLE" }
  );

  await logAction(
    userId,
    "DISCHARGE_PATIENT",
    "Admission",
    id
  );

  return updatedAdmission;
};

module.exports = {
  createAdmission,
  getAdmissions,
  updateAdmission,
  dischargePatient
};
