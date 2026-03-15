const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let firebaseApp = null;
let firebaseConfigError = "";

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (process.env.FIREBASE_CREDENTIALS_PATH) {
    const credPath = path.resolve(__dirname, "../../", process.env.FIREBASE_CREDENTIALS_PATH);

    if (fs.existsSync(credPath)) {
      return require(credPath);
    }

    console.warn(`[Firebase] Credentials file not found at: ${credPath}`);
    return null;
  }

  const defaultPath = path.resolve(__dirname, "../../firebase-key.json");

  if (fs.existsSync(defaultPath)) {
    return require(defaultPath);
  }

  console.warn("[Firebase] No credentials found. Firebase phone verification will be unavailable.");
  return null;
}

try {
  const serviceAccount = loadServiceAccount();

  if (serviceAccount) {
    firebaseApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });

    console.log("[Firebase] Admin SDK initialized successfully");
  }
} catch (error) {
  firebaseConfigError = error.message;
  firebaseApp = null;
  console.error("[Firebase] Initialization error:", error.message);
}

module.exports = {
  firebaseApp,
  admin,
  firebaseConfigError,
  isFirebaseConfigured: () => Boolean(firebaseApp)
};
