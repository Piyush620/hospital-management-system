const Patient = require("../../models/patient.model");
const Doctor = require("../../models/doctor.model");
const Appointment = require("../../models/appointment.model");
const Bed = require("../../models/bed.model");
const Billing = require("../../models/billing.model");
const Admission = require("../../models/admission.model");

exports.getStats = async () => {

  const totalPatients = await Patient.countDocuments();

  const totalDoctors = await Doctor.countDocuments();

  const totalAppointments = await Appointment.countDocuments();

  const totalBeds = await Bed.countDocuments();

  const occupiedBeds = await Bed.countDocuments({ status: "OCCUPIED" });

  const revenue = await Billing.aggregate([
    {
      $match: {
        status: "PAID",
        isDeleted: false
      }
    },
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

exports.getAdmissionsTrend = async () => {
  const trend = await Admission.aggregate([
    {
      $match: {
        isDeleted: false
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    },
    {
      $project: {
        month: {
          $concat: [
            { $arrayElemAt: [["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], { $subtract: ["$_id.month", 1] }] },
            " ",
            { $toString: "$_id.year" }
          ]
        },
        admissions: "$count"
      }
    }
  ]);

  return trend;
};
