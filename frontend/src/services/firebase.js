import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let firebaseApp = null;
let recaptchaVerifier = null;

function getMissingConfigKeys() {
  return Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

function getFirebaseApp() {
  if (!firebaseApp) {
    const missing = getMissingConfigKeys();

    if (missing.length > 0) {
      throw new Error(`Missing Firebase frontend config: ${missing.join(", ")}`);
    }

    firebaseApp = initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function ensureRecaptcha(containerId = "firebase-recaptcha") {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(getFirebaseAuth(), containerId, {
      size: "normal"
    });
  }

  return recaptchaVerifier;
}

export async function sendPhoneOtp(phoneNumber, containerId = "firebase-recaptcha") {
  const verifier = ensureRecaptcha(containerId);
  return signInWithPhoneNumber(getFirebaseAuth(), phoneNumber, verifier);
}

export async function clearFirebaseSession() {
  try {
    await signOut(getFirebaseAuth());
  } catch {
    return;
  }
}
