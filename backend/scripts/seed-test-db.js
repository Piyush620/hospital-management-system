require("dotenv").config();

const User = require("../src/models/user.model");
const Hospital = require("../src/models/hospital.model");
const Department = require("../src/models/department.model");
const Doctor = require("../src/models/doctor.model");
const Patient = require("../src/models/patient.model");
const { hashPassword } = require("../src/utils/hash");
const { connectTestDb, clearDatabase, disconnectTestDb, getTestMongoUri } = require("../src/test-utils/db");

const main = async () => {
  await connectTestDb();
  await clearDatabase();

  const admin = await User.create({
    name: "Seed Admin",
    email: "seed-admin@example.com",
    password: await hashPassword("SeedPass123!"),
    role: "SUPER_ADMIN",
    isVerified: true
  });

  const hospital = await Hospital.create({
    name: "Seed Hospital",
    address: "100 Seed Street",
    phone: "9999999999",
    createdBy: admin._id
  });

  const department = await Department.create({
    name: "General Medicine",
    description: "Baseline seed department",
    hospitalId: hospital._id,
    createdBy: admin._id
  });

  const doctor = await Doctor.create({
    name: "Dr. Seed",
    specialization: "General Medicine",
    experience: 5,
    consultationFee: 500,
    departmentId: department._id,
    hospitalId: hospital._id,
    createdBy: admin._id
  });

  const patient = await Patient.create({
    name: "Seed Patient",
    age: 30,
    gender: "OTHER",
    phone: "8888888888",
    address: "200 Seed Avenue",
    bloodGroup: "O+",
    hospitalId: hospital._id,
    createdBy: admin._id
  });

  console.log(`Seeded test database: ${getTestMongoUri()}`);
  console.log(`Admin email: ${admin.email}`);
  console.log(`Hospital ID: ${hospital._id}`);
  console.log(`Department ID: ${department._id}`);
  console.log(`Doctor ID: ${doctor._id}`);
  console.log(`Patient ID: ${patient._id}`);
};

main()
  .catch((error) => {
    console.error("Failed to seed test database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectTestDb();
  });
