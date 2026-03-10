const admissionService = require("./admission.service");


exports.createAdmission = async (req, res, next) => {
  try {

    const admission = await admissionService.createAdmission(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      admission
    });

  } catch (err) {
    next(err);
  }
};


exports.getAdmissions = async (req, res, next) => {
  try {

    const { hospitalId } = req.query;

    const admissions = await admissionService.getAdmissions(hospitalId);

    res.json({
      success: true,
      admissions
    });

  } catch (err) {
    next(err);
  }
};


exports.updateAdmission = async (req, res, next) => {
  try {

    const admission = await admissionService.updateAdmission(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      admission
    });

  } catch (err) {
    next(err);
  }
};


exports.dischargePatient = async (req, res, next) => {
  try {

    const admission = await admissionService.dischargePatient(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      admission
    });

  } catch (err) {
    next(err);
  }
};