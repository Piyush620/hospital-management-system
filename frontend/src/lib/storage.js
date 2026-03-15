const SESSION_KEY = "hms.frontend.session";
const WORKSPACE_KEY = "hms.frontend.workspace";
const PENDING_SIGNUP_KEY = "hms.frontend.pendingSignup";

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getStoredSession() {
  const value = safeParse(localStorage.getItem(SESSION_KEY), null);

  return (
    value || {
      user: null,
      accessToken: "",
      refreshToken: ""
    }
  );
}

export function setStoredSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredWorkspace() {
  return safeParse(localStorage.getItem(WORKSPACE_KEY), {
    activeHospitalId: ""
  });
}

export function setStoredWorkspace(workspace) {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
}

export function getPendingSignup() {
  return safeParse(sessionStorage.getItem(PENDING_SIGNUP_KEY), null);
}

export function setPendingSignup(signup) {
  sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(signup));
}

export function clearPendingSignup() {
  sessionStorage.removeItem(PENDING_SIGNUP_KEY);
}
