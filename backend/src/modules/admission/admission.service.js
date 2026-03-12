const Admission = require("../../models/admission.model");
const Bed = require("../../models/bed.model");
const Patient = require("../../models/patient.model");
const Doctor = require("../../models/doctor.model");
const Hospital = require("../../models/hospital.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");
const { validateAdmissionCreate } = require("../../utils/validators");

const createAdmission = async (data, userId) => {
  validateAdmissionCreate(data);

  const [hospital, patient, doctor, bed] = await Promise.all([
    Hospital.findOne({
      _id: data.hospitalId,
      isDeleted: false
    }),
    Patient.findOne({
      _id: data.patientId,
      isDeleted: false
    }),
    Doctor.findOne({
      _id: data.doctorId,
      isDeleted: false
    }),
    Bed.findOne({
      _id: data.bedId,
      isDeleted: false
    })
  ]);

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  if (!bed) {
    throw new ApiError(404, "Bed not found");
  }

  if (String(patient.hospitalId) !== String(data.hospitalId)) {
    throw new ApiError(400, "Patient does not belong to hospital");
  }

  if (String(doctor.hospitalId) !== String(data.hospitalId)) {
    throw new ApiError(400, "Doctor does not belong to hospital");
  }

  if (String(bed.hospitalId) !== String(data.hospitalId)) {
    throw new ApiError(400, "Bed does not belong to hospital");
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
