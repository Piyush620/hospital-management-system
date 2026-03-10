const Hospital = require("../../models/hospital.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");



const createHospital = async (data, userId) => {

  if (!data.name) {
    throw new ApiError(400, "Hospital name is required");
  }

  const hospital = await Hospital.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_HOSPITAL",
    "Hospital",
    hospital._id
  );

  return hospital;

};



const getHospitals = async () => {

  const hospitals = await Hospital
    .find({ isDeleted: false })
    .sort({ createdAt: -1 });

  return hospitals;

};



const getHospitalById = async (id) => {

  const hospital = await Hospital.findOne({
    _id: id,
    isDeleted: false
  });

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  return hospital;

};



const updateHospital = async (id, data, userId) => {

  const hospital = await Hospital.findOne({
    _id: id,
    isDeleted: false
  });

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  const updatedHospital = await Hospital.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_HOSPITAL",
    "Hospital",
    id
  );

  return updatedHospital;

};



const deleteHospital = async (id, userId) => {

  const hospital = await Hospital.findOne({
    _id: id,
    isDeleted: false
  });

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  const deletedHospital = await Hospital.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_HOSPITAL",
    "Hospital",
    id
  );

  return deletedHospital;

};



module.exports = {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital
};