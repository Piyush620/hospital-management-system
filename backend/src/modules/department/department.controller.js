const departmentService = require("./department.service");
const asyncHandler = require("../../utils/asyncHandler");

const createDepartment = asyncHandler(async (req, res) => {

  const department = await departmentService.createDepartment(
    req.body,
    req.user.id
  );

  res.status(201).json({
    success: true,
    department
  });

});

const getDepartments = asyncHandler(async (req, res) => {

  const { hospitalId } = req.query;

  const departments = await departmentService.getDepartments(hospitalId);

  res.json({
    success: true,
    departments
  });

});

const updateDepartment = asyncHandler(async (req, res) => {

  const department = await departmentService.updateDepartment(
    req.params.id,
    req.body
  );

  res.json({
    success: true,
    department
  });

});

const deleteDepartment = asyncHandler(async (req, res) => {

  const department = await departmentService.deleteDepartment(
    req.params.id
  );

  res.json({
    success: true,
    department
  });

});


/* ===============================
   Added for dashboard stats route
   =============================== */

const Patient = require("../../models/patient.model");
const Doctor = require("../../models/doctor.model");
const Admission = require("../../models/admission.model");
const Billing = require("../../models/billing.model");

const getStats = asyncHandler(async (req, res) => {

  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalAdmissions = await Admission.countDocuments();

  const revenue = await Billing.aggregate([
    { $match: { status: "Paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  res.json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      totalAdmissions,
      totalRevenue: revenue[0]?.total || 0
    }
  });

});


module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  getStats   // ✅ Added export
};