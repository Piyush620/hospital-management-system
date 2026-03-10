const hospitalService = require("./hospital.service");
const asyncHandler = require("../../utils/asyncHandler");

const createHospital = asyncHandler(async (req, res) => {

  const hospital = await hospitalService.createHospital(
    req.body,
    req.user.id
  );

  res.status(201).json({
    success: true,
    hospital
  });

});

const getHospitals = asyncHandler(async (req, res) => {

  const hospitals = await hospitalService.getHospitals();

  res.json({
    success: true,
    hospitals
  });

});

const getHospital = asyncHandler(async (req, res) => {

  const hospital = await hospitalService.getHospitalById(
    req.params.id
  );

  res.json({
    success: true,
    hospital
  });

});

const updateHospital = asyncHandler(async (req, res) => {

  const hospital = await hospitalService.updateHospital(
    req.params.id,
    req.body,
    req.user.id
  );

  res.json({
    success: true,
    hospital
  });

});

const deleteHospital = asyncHandler(async (req, res) => {

  const hospital = await hospitalService.deleteHospital(
    req.params.id,
    req.user.id
  );

  res.json({
    success: true,
    hospital
  });

});

module.exports = {
  createHospital,
  getHospitals,
  getHospital,
  updateHospital,
  deleteHospital
};