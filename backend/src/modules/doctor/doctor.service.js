const Doctor = require("../../models/doctor.model");
const ApiError = require("../../errors/ApiError");
const { getPagination } = require("../../utils/pagination");
const { logAction } = require("../../utils/auditLogger");
const { validateDoctorCreate } = require("../../utils/validators");

const createDoctor = async (data, userId) => {
  validateDoctorCreate(data);

  const doctor = await Doctor.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_DOCTOR",
    "Doctor",
    doctor._id
  );

  return doctor;
};

const getDoctors = async (query, hospitalId, departmentId) => {

  const { page, limit, skip } = getPagination(query);

  const filter = {
    isDeleted: false
  };

  if (hospitalId) {
    filter.hospitalId = hospitalId;
  }

  if (departmentId) {
    filter.departmentId = departmentId;
  }

  const doctors = await Doctor
    .find(filter)
    .skip(skip)
    .limit(limit);

  const total = await Doctor.countDocuments(filter);

  return {
    total,
    page,
    limit,
    data: doctors
  };
};

const updateDoctor = async (id, data, userId) => {

  const doctor = await Doctor.findById(id);

  if (!doctor || doctor.isDeleted) {
    throw new ApiError(404, "Doctor not found");
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_DOCTOR",
    "Doctor",
    id
  );

  return updatedDoctor;
};

const deleteDoctor = async (id, userId) => {

  const doctor = await Doctor.findById(id);

  if (!doctor || doctor.isDeleted) {
    throw new ApiError(404, "Doctor not found");
  }

  const deletedDoctor = await Doctor.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_DOCTOR",
    "Doctor",
    id
  );

  return deletedDoctor;
};

module.exports = {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor
};
