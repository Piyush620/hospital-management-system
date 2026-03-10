const appointmentService = require("./appointment.service");

exports.createAppointment = async (req, res, next) => {
  try {

    const appointment = await appointmentService.createAppointment(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      appointment
    });

  } catch (err) {
    next(err);
  }
};


exports.getAppointments = async (req, res, next) => {
  try {

    const { hospitalId } = req.query;

    const result = await appointmentService.getAppointments(
      hospitalId,
      req.query
    );

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    next(err);
  }
};


exports.getDoctorAppointments = async (req, res, next) => {
  try {

    const appointments = await appointmentService.getDoctorAppointments(
      req.params.doctorId
    );

    res.json({
      success: true,
      appointments
    });

  } catch (err) {
    next(err);
  }
};


exports.updateAppointment = async (req, res, next) => {
  try {

    const appointment = await appointmentService.updateAppointment(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      appointment
    });

  } catch (err) {
    next(err);
  }
};


exports.deleteAppointment = async (req, res, next) => {
  try {

    await appointmentService.deleteAppointment(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: "Appointment cancelled"
    });

  } catch (err) {
    next(err);
  }
};