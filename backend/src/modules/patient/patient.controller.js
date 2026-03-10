const patientService = require("./patient.service");

exports.createPatient = async (req, res, next) => {
  try {

    const userId = req.user.id || req.user._id;

    const patient = await patientService.createPatient(
      req.body,
      userId
    );

    res.status(201).json({
      success: true,
      patient
    });

  } catch (error) {
    next(error);
  }
};

exports.getPatients = async (req, res, next) => {
  try {

    const { hospitalId } = req.query;

    const patients = await patientService.getPatients(hospitalId, req.query);

    res.json({
      success: true,
      ...patients
    });

  } catch (error) {
    next(error);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {

    const patient = await patientService.getPatientById(req.params.id);

    res.json({
      success: true,
      patient
    });

  } catch (error) {
    next(error);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {

    const patient = await patientService.updatePatient(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      patient
    });

  } catch (error) {
    next(error);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {

    const patient = await patientService.deletePatient(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: "Patient deleted",
      patient
    });

  } catch (error) {
    next(error);
  }
};