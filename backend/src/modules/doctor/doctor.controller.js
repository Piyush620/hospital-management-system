const doctorService = require("./doctor.service");
const asyncHandler = require("../../utils/asyncHandler");

const createDoctor = asyncHandler(async (req, res) => {

  const doctor = await doctorService.createDoctor(
    req.body,
    req.user.id
  );

  res.status(201).json({
    success: true,
    doctor
  });

});

const getDoctors = async (req, res, next) => {

  try {

    const { hospitalId, departmentId } = req.query;

    const result = await doctorService.getDoctors(
      req.query,
      hospitalId,
      departmentId
    );

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    next(err);
  }

};

const updateDoctor = asyncHandler(async (req, res) => {

  const doctor = await doctorService.updateDoctor(
  req.params.id,
  req.body,
  req.user.id
);

  res.json({
    success: true,
    doctor
  });

});

const deleteDoctor = asyncHandler(async (req, res) => {

  const doctor = await doctorService.deleteDoctor(
  req.params.id,
  req.user.id
);

  res.json({
    success: true,
    doctor
  });

});

module.exports = {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor
};