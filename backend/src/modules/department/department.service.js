const Department = require("../../models/department.model");
const Hospital = require("../../models/hospital.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");


const createDepartment = async (data, userId) => {

  if (!data.name) {
    throw new ApiError(400, "Department name is required");
  }

  if (!data.hospitalId) {
    throw new ApiError(400, "Hospital ID is required");
  }

  const hospital = await Hospital.findOne({
    _id: data.hospitalId,
    isDeleted: false
  });

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  const department = await Department.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_DEPARTMENT",
    "Department",
    department._id
  );

  return department;
};


const getDepartments = async (hospitalId) => {

  return Department.find({
    hospitalId,
    isDeleted: false
  }).sort({ createdAt: -1 });

};


const updateDepartment = async (id, data) => {

  const department = await Department.findById(id);

  if (!department || department.isDeleted) {
    throw new ApiError(404, "Department not found");
  }

  return Department.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

};


const deleteDepartment = async (id) => {

  const department = await Department.findById(id);

  if (!department || department.isDeleted) {
    throw new ApiError(404, "Department not found");
  }

  return Department.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

};


module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment
};
