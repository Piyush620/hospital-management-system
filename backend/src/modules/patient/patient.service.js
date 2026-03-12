const Patient = require("../../models/patient.model");
const Hospital = require("../../models/hospital.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");
const { getPagination } = require("../../utils/pagination");
const { validatePatientCreate } = require("../../utils/validators");


/*
CREATE PATIENT
*/

exports.createPatient = async (data, userId) => {
  validatePatientCreate(data);

  const hospital = await Hospital.findOne({
    _id: data.hospitalId,
    isDeleted: false
  });

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  const patient = await Patient.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_PATIENT",
    "Patient",
    patient._id
  );

  return patient;

};


/*
GET PATIENTS (WITH PAGINATION)
*/

exports.getPatients = async (hospitalId, query) => {

  // If no hospitalId provided, return empty or all patients (depending on business logic)
  // For now, we'll allow getting all if hospitalId is not specified
  const filter = {
    isDeleted: false
  };

  if (hospitalId) {
    filter.hospitalId = hospitalId;
  }

  const { page, limit, skip } = getPagination(query || {});

  const patients = await Patient.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Patient.countDocuments(filter);

  return {
    total,
    page,
    limit,
    data: patients
  };

};


/*
GET SINGLE PATIENT
*/

exports.getPatientById = async (id) => {

  const patient = await Patient.findOne({
    _id: id,
    isDeleted: false
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return patient;

};


/*
UPDATE PATIENT
*/

exports.updatePatient = async (id, data, userId) => {

  const patient = await Patient.findOne({
    _id: id,
    isDeleted: false
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_PATIENT",
    "Patient",
    id
  );

  return updatedPatient;

};


/*
DELETE PATIENT (SOFT DELETE)
*/

exports.deletePatient = async (id, userId) => {

  const patient = await Patient.findOne({
    _id: id,
    isDeleted: false
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const deletedPatient = await Patient.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_PATIENT",
    "Patient",
    id
  );

  return deletedPatient;

};
