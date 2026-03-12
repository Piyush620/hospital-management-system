process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/hms";
process.env.TEST_MONGO_URI = "mongodb://127.0.0.1:27017/hms_integration_test";
process.env.JWT_ACCESS_SECRET = "IntegrationAccessSecret1234567890";
process.env.JWT_REFRESH_SECRET = "IntegrationRefreshSecret1234567890";
process.env.BREVO_API_KEY = "";
process.env.BREVO_FROM_EMAIL = "noreply@example.com";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.RATE_LIMIT_MAX = "10000";
process.env.AUTH_RATE_LIMIT_MAX = "10000";
process.env.OTP_EXPIRY = "5";

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");
const User = require("../models/user.model");
const { connectTestDb, clearDatabase, disconnectTestDb } = require("../test-utils/db");

jest.setTimeout(30000);

const createAuthorizedSession = async () => {
  await request(app).post("/api/auth/signup").send({
    name: "Integration Admin",
    email: "integration-admin@example.com",
    password: "TestPass123!",
    role: "SUPER_ADMIN"
  });

  const user = await User.findOne({ email: "integration-admin@example.com" });

  await request(app).post("/api/auth/verify-otp").send({
    email: user.email,
    otp: user.otp
  });

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: "TestPass123!"
  });

  return {
    token: loginResponse.body.data.accessToken,
    refreshToken: loginResponse.body.data.refreshToken
  };
};

describe("Main workflow integration", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  test("runs the main hospital workflow end to end", async () => {
    const session = await createAuthorizedSession();
    const auth = { Authorization: `Bearer ${session.token}` };

    const hospitalResponse = await request(app)
      .post("/api/hospitals")
      .set(auth)
      .send({
        name: "Integration Hospital",
        address: "123 Integration Way",
        phone: "9999999999"
      });

    expect(hospitalResponse.status).toBe(201);
    const hospitalId = hospitalResponse.body.data._id;

    const departmentResponse = await request(app)
      .post("/api/departments")
      .set(auth)
      .send({
        name: "Cardiology",
        description: "Integration department",
        hospitalId
      });

    expect(departmentResponse.status).toBe(201);
    const departmentId = departmentResponse.body.data._id;

    const doctorResponse = await request(app)
      .post("/api/doctors")
      .set(auth)
      .send({
        name: "Dr. Integration",
        specialization: "Cardiology",
        experience: 6,
        consultationFee: 650,
        departmentId,
        hospitalId,
        availability: "Available"
      });

    expect(doctorResponse.status).toBe(201);
    const doctorId = doctorResponse.body.data._id;

    const patientResponse = await request(app)
      .post("/api/patients")
      .set(auth)
      .send({
        name: "Integration Patient",
        age: 34,
        gender: "FEMALE",
        phone: "9876543210",
        address: "789 Patient Road",
        bloodGroup: "A+",
        hospitalId
      });

    expect(patientResponse.status).toBe(201);
    const patientId = patientResponse.body.data._id;

    const appointmentResponse = await request(app)
      .post("/api/appointments")
      .set(auth)
      .send({
        hospitalId,
        patientId,
        doctorId,
        departmentId,
        appointmentDate: "2026-12-31T10:00:00.000Z",
        notes: "Integration visit"
      });

    expect(appointmentResponse.status).toBe(201);
    const appointmentId = appointmentResponse.body.data._id;

    const wardResponse = await request(app)
      .post("/api/wards")
      .set(auth)
      .send({
        hospitalId,
        name: "Integration Ward",
        description: "Integration ward"
      });

    expect(wardResponse.status).toBe(201);
    const wardId = wardResponse.body.data._id;

    const roomResponse = await request(app)
      .post("/api/rooms")
      .set(auth)
      .send({
        wardId,
        roomNumber: "301",
        type: "Private"
      });

    expect(roomResponse.status).toBe(201);
    const roomId = roomResponse.body.data._id;

    const bedResponse = await request(app)
      .post("/api/beds")
      .set(auth)
      .send({
        bedNumber: "301-A",
        roomId,
        hospitalId
      });

    expect(bedResponse.status).toBe(201);
    const bedId = bedResponse.body.data._id;

    const admissionResponse = await request(app)
      .post("/api/admissions")
      .set(auth)
      .send({
        hospitalId,
        patientId,
        doctorId,
        bedId,
        reason: "Observation"
      });

    expect(admissionResponse.status).toBe(201);
    const admissionId = admissionResponse.body.data._id;

    const billingResponse = await request(app)
      .post("/api/billings")
      .set(auth)
      .send({
        hospitalId,
        patientId,
        admissionId,
        amount: 2400,
        description: "Integration billing"
      });

    expect(billingResponse.status).toBe(201);
    const billingId = billingResponse.body.data._id;

    const paymentResponse = await request(app)
      .post("/api/payments")
      .set(auth)
      .send({
        hospitalId,
        billingId,
        amount: 2400,
        method: "UPI",
        transactionId: "IT-TXN-001"
      });

    expect(paymentResponse.status).toBe(201);

    const dashboardResponse = await request(app)
      .get("/api/dashboard/stats")
      .set(auth);

    expect(dashboardResponse.status).toBe(200);
    expect(dashboardResponse.body.data.totalRevenue).toBe(2400);
    expect(dashboardResponse.body.data.totalAppointments).toBe(1);

    const appointmentListResponse = await request(app)
      .get(`/api/appointments?hospitalId=${hospitalId}`)
      .set(auth);

    expect(appointmentListResponse.status).toBe(200);
    expect(appointmentListResponse.body.data[0]._id).toBe(appointmentId);

    const auditResponse = await request(app)
      .get("/api/audit-logs?page=1&limit=20")
      .set(auth);

    expect(auditResponse.status).toBe(200);
    expect(auditResponse.body.data.length).toBeGreaterThan(0);

    const refreshResponse = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: session.refreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.accessToken).toBeTruthy();
  });

  test("rejects invalid linked IDs and keeps doctor appointments populated", async () => {
    const session = await createAuthorizedSession();
    const auth = { Authorization: `Bearer ${session.token}` };

    const hospitalResponse = await request(app)
      .post("/api/hospitals")
      .set(auth)
      .send({
        name: "Validation Hospital",
        address: "456 Validation Way",
        phone: "8888888888"
      });

    const hospitalId = hospitalResponse.body.data._id;

    const departmentResponse = await request(app)
      .post("/api/departments")
      .set(auth)
      .send({
        name: "Validation Department",
        hospitalId
      });

    const departmentId = departmentResponse.body.data._id;

    const doctorResponse = await request(app)
      .post("/api/doctors")
      .set(auth)
      .send({
        name: "Dr. Validation",
        specialization: "General",
        experience: 4,
        consultationFee: 400,
        departmentId,
        hospitalId
      });

    const doctorId = doctorResponse.body.data._id;

    const patientResponse = await request(app)
      .post("/api/patients")
      .set(auth)
      .send({
        name: "Validation Patient",
        age: 29,
        gender: "MALE",
        phone: "9123456789",
        hospitalId
      });

    const patientId = patientResponse.body.data._id;

    const appointmentResponse = await request(app)
      .post("/api/appointments")
      .set(auth)
      .send({
        hospitalId,
        patientId,
        doctorId,
        departmentId,
        appointmentDate: "2026-12-30T10:00:00.000Z"
      });

    expect(appointmentResponse.status).toBe(201);

    const invalidBed = await request(app)
      .post("/api/beds")
      .set(auth)
      .send({
        bedNumber: "BAD-1",
        roomId: new mongoose.Types.ObjectId().toString(),
        hospitalId
      });

    expect(invalidBed.status).toBe(404);
    expect(invalidBed.body.message).toBe("Room not found");

    const invalidBilling = await request(app)
      .post("/api/billings")
      .set(auth)
      .send({
        hospitalId,
        patientId,
        admissionId: new mongoose.Types.ObjectId().toString(),
        amount: 500,
        description: "Should fail"
      });

    expect(invalidBilling.status).toBe(404);
    expect(invalidBilling.body.message).toBe("Admission not found");

    const doctorAppointments = await request(app)
      .get(`/api/appointments/doctor/${doctorId}`)
      .set(auth);

    expect(doctorAppointments.status).toBe(200);
    expect(doctorAppointments.body.data[0].doctorId._id).toBe(doctorId);
  });
});
