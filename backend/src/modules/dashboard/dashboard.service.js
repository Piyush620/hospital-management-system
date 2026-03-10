const Patient = require("../../models/patient.model");
const Doctor = require("../../models/doctor.model");
const Appointment = require("../../models/appointment.model");
const Bed = require("../../models/bed.model");
const Billing = require("../../models/billing.model");

exports.getStats = async () => {

  const totalPatients = await Patient.countDocuments();

  const totalDoctors = await Doctor.countDocuments();

  const totalAppointments = await Appointment.countDocuments();

  const totalBeds = await Bed.countDocuments();

  const occupiedBeds = await Bed.countDocuments({ status: "OCCUPIED" });

  const revenue = await Billing.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" }
      }
    }
  ]);

  return {
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalBeds,
    occupiedBeds,
    totalRevenue: revenue[0]?.totalRevenue || 0
  };

};