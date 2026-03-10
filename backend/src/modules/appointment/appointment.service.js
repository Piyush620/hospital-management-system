const Appointment = require("../../models/appointment.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");
const { getPagination } = require("../../utils/pagination");
const { validateAppointmentCreate } = require("../../utils/validators");

exports.createAppointment = async (data, userId) => {
  validateAppointmentCreate(data);

  const appointment = await Appointment.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_APPOINTMENT",
    "Appointment",
    appointment._id
  );

  return appointment;
};


exports.getAppointments = async (hospitalId, query) => {

  if (!hospitalId) {
    throw new ApiError(400, "Hospital ID required");
  }

  const { page, limit, skip } = getPagination(query);

  const appointments = await Appointment
    .find({
      hospitalId,
      isDeleted: false
    })
    .populate("patientId")
    .populate("doctorId")
    .populate("departmentId")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Appointment.countDocuments({
    hospitalId,
    isDeleted: false
  });

  return {
    total,
    page,
    limit,
    data: appointments
  };
};


exports.getDoctorAppointments = async (doctorId) => {

  if (!doctorId) {
    throw new ApiError(400, "Doctor ID required");
  }

  return Appointment
    .find({
      doctorId,
      isDeleted: false
    })
    .populate("patientId")
    .populate("departmentId")
    .sort({ createdAt: -1 });
};


exports.updateAppointment = async (id, data, userId) => {

  const appointment = await Appointment.findOne({
    _id: id,
    isDeleted: false
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_APPOINTMENT",
    "Appointment",
    id
  );

  return updatedAppointment;
};


exports.deleteAppointment = async (id, userId) => {

  const appointment = await Appointment.findOne({
    _id: id,
    isDeleted: false
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const deletedAppointment = await Appointment.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_APPOINTMENT",
    "Appointment",
    id
  );

  return deletedAppointment;
};
