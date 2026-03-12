const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authMiddleware = require("./middleware/auth.middleware");
const roleMiddleware = require("./middleware/role.middleware");
const errorMiddleware = require("./middleware/error.middleware");
const createRateLimiter = require("./middleware/rateLimit.middleware");
const normalizeSuccessResponse = require("./middleware/responseNormalizer.middleware");
const securityHeaders = require("./middleware/securityHeaders.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const hospitalRoutes = require("./modules/hospital/hospital.routes");
const departmentRoutes = require("./modules/department/department.routes");
const doctorRoutes = require("./modules/doctor/doctor.routes");
const patientRoutes = require("./modules/patient/patient.routes");
const appointmentRoutes = require("./modules/appointment/appointment.routes");
const wardRoutes = require("./modules/ward/ward.routes");
const roomRoutes = require("./modules/room/room.routes");
const bedRoutes = require("./modules/bed/bed.routes");
const admissionRoutes = require("./modules/admission/admission.routes");
const billingRoutes = require("./modules/billing/billing.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const auditRoutes = require("./modules/audit/audit.routes");

const createApp = () => {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : "*";

  const hasWeakSecret = (value) => {
    if (!value) return true;
    const weakPatterns = ["change_me", "replace_with", "example", "default", "secret"];
    const lower = value.toLowerCase();
    return value.length < 32 || weakPatterns.some((pattern) => lower.includes(pattern));
  };

  if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  if (isProduction) {
    const invalidConfig = [];

    if (hasWeakSecret(process.env.JWT_ACCESS_SECRET)) {
      invalidConfig.push("JWT_ACCESS_SECRET");
    }

    if (hasWeakSecret(process.env.JWT_REFRESH_SECRET)) {
      invalidConfig.push("JWT_REFRESH_SECRET");
    }

    if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN.trim() === "*" || corsOrigins === "*") {
      invalidConfig.push("CORS_ORIGIN");
    }

    if (invalidConfig.length > 0) {
      throw new Error(`[FATAL] Invalid production security config: ${invalidConfig.join(", ")}`);
    }
  }

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(securityHeaders);
  app.use(normalizeSuccessResponse);
  app.use(
    "/api",
    createRateLimiter({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
      max: Number(process.env.RATE_LIMIT_MAX || 300)
    })
  );

  app.use(
    "/api/auth",
    createRateLimiter({
      windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
      max: Number(process.env.AUTH_RATE_LIMIT_MAX || 50),
      message: "Too many auth requests, please try again later."
    }),
    authRoutes
  );

  app.get("/", (req, res) => {
    res.send("Hospital Management API Running");
  });

  const healthPayload = () => ({
    success: true,
    message: "Service is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });

  app.get("/health", (req, res) => {
    res.json(healthPayload());
  });

  app.get("/api/health", (req, res) => {
    res.json(healthPayload());
  });

  const readyHandler = (req, res) => {
    const dbReady = mongoose.connection.readyState === 1;

    if (!dbReady) {
      return res.status(503).json({
        success: false,
        message: "Service not ready",
        dbReady: false
      });
    }

    return res.json({
      success: true,
      message: "Service is ready",
      dbReady: true
    });
  };

  app.get("/ready", readyHandler);
  app.get("/api/ready", readyHandler);

  app.get("/api/test", authMiddleware, (req, res) => {
    res.json({
      message: "Protected route working",
      user: req.user
    });
  });

  app.get(
    "/api/admin-test",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "HOSPITAL_ADMIN"),
    (req, res) => {
      res.json({
        success: true,
        message: "Admin access granted"
      });
    }
  );

  app.use("/api/hospitals", hospitalRoutes);
  app.use("/api/departments", departmentRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/wards", wardRoutes);
  app.use("/api/rooms", roomRoutes);
  app.use("/api/beds", bedRoutes);
  app.use("/api/admissions", admissionRoutes);
  app.use("/api/billings", billingRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/audit-logs", auditRoutes);

  app.use(errorMiddleware);

  return app;
};

module.exports = createApp();
