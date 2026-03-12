jest.mock("../models/bed.model", () => ({}));
jest.mock("../models/room.model", () => ({}));
jest.mock("../models/billing.model", () => ({}));
jest.mock("../models/admission.model", () => ({}));
jest.mock("../models/patient.model", () => ({}));
jest.mock("../models/doctor.model", () => ({}));
jest.mock("../models/appointment.model", () => ({}));
jest.mock("../utils/auditLogger", () => ({
  logAction: jest.fn()
}));

const ApiError = require("../errors/ApiError");
const Bed = require("../models/bed.model");
const Room = require("../models/room.model");
const Billing = require("../models/billing.model");
const Admission = require("../models/admission.model");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");
const Appointment = require("../models/appointment.model");

const bedService = require("../modules/bed/bed.service");
const billingService = require("../modules/billing/billing.service");
const dashboardService = require("../modules/dashboard/dashboard.service");
const appointmentService = require("../modules/appointment/appointment.service");

describe("Service regressions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createBed rejects unknown roomId", async () => {
    Room.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      bedService.createBed({ roomId: "room-1", hospitalId: "hospital-1" }, "user-1")
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Room not found"
    });
  });

  test("createBill rejects unknown admissionId", async () => {
    Admission.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      billingService.createBill(
        {
          patientId: "patient-1",
          admissionId: "admission-1",
          amount: 500,
          hospitalId: "hospital-1"
        },
        "user-1"
      )
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Admission not found"
    });
  });

  test("dashboard revenue only sums paid bills", async () => {
    Patient.countDocuments = jest.fn().mockResolvedValue(1);
    Doctor.countDocuments = jest.fn().mockResolvedValue(2);
    Appointment.countDocuments = jest.fn().mockResolvedValue(3);
    Bed.countDocuments = jest
      .fn()
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1);
    Billing.aggregate = jest.fn().mockResolvedValue([{ totalRevenue: 2200 }]);

    const stats = await dashboardService.getStats();

    expect(Billing.aggregate).toHaveBeenCalledWith([
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
    expect(stats.totalRevenue).toBe(2200);
  });

  test("getDoctorAppointments populates doctorId like appointment list", async () => {
    const sort = jest.fn().mockResolvedValue([]);
    const populateDepartment = jest.fn().mockReturnValue({ sort });
    const populateDoctor = jest.fn().mockReturnValue({ populate: populateDepartment });
    const populatePatient = jest.fn().mockReturnValue({ populate: populateDoctor });

    Appointment.find = jest.fn().mockReturnValue({
      populate: populatePatient
    });

    await appointmentService.getDoctorAppointments("doctor-1");

    expect(Appointment.find).toHaveBeenCalledWith({
      doctorId: "doctor-1",
      isDeleted: false
    });
    expect(populatePatient).toHaveBeenCalledWith("patientId");
    expect(populateDoctor).toHaveBeenCalledWith("doctorId");
    expect(populateDepartment).toHaveBeenCalledWith("departmentId");
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });
});
