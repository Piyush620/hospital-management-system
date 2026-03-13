const SESSION_KEY = "hms.frontend.session";
const WORKSPACE_KEY = "hms.frontend.workspace";

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
