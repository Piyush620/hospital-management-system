const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Try to load service account from environment variable or file
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If provided as JSON string in env
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else if (process.env.FIREBASE_CREDENTIALS_PATH) {
    // If provided as file path - resolve from backend root
    const credPath = path.resolve(__dirname, "../../", process.env.FIREBASE_CREDENTIALS_PATH);
    if (fs.existsSync(credPath)) {
      serviceAccount = require(credPath);
    } else {
      console.warn(`[Firebase] Credentials file not found at: ${credPath}`);
      serviceAccount = null;
    }
  } else {
    // Try default locations
    const defaultPath = path.resolve(__dirname, "../../firebase-key.json");
    if (fs.existsSync(defaultPath)) {
      serviceAccount = require(defaultPath);
    } else {
      console.warn("[Firebase] No credentials found (dev mode - OTP will log to console)");
      serviceAccount = null;
    }
  }

  if (serviceAccount) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase initialized successfully");
  }
} catch (error) {
  console.error("[Firebase] Initialization error:", error.message);
  firebaseApp = null;
}

module.exports = { firebaseApp, admin };
