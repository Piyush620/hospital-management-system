import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getStoredSession,
  getStoredWorkspace,
  setStoredSession,
  setStoredWorkspace
} from "../lib/storage";
import { apiClient, authApi, healthApi, hospitalsApi } from "../services/api";

const AuthContext = createContext(null);

function inferDefaultHospital(hospitals, currentId) {
  if (!Array.isArray(hospitals) || hospitals.length === 0) {
    return "";
  }

  if (currentId && hospitals.some((hospital) => hospital._id === currentId)) {
    return currentId;
  }

  return hospitals[0]._id;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());
  const [activeHospitalId, setActiveHospitalId] = useState(
    () => getStoredWorkspace().activeHospitalId || ""
  );
  const [hospitals, setHospitals] = useState([]);
  const [appReady, setAppReady] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");

  useEffect(() => {
    apiClient.configure({
      getAccessToken: () => session.accessToken,
      getRefreshToken: () => session.refreshToken,
      onAccessToken: (accessToken) => {
        setSession((current) => {
          const next = { ...current, accessToken };
          setStoredSession(next);
          return next;
        });
      },
      onUnauthorized: () => {
        clearSession();
        setSession({ user: null, accessToken: "", refreshToken: "" });
      }
    });
  }, [session.accessToken, session.refreshToken]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setBooting(true);
      setBootError("");

      try {
        await healthApi.ready();
        if (cancelled) {
          return;
        }

        setAppReady(true);

        if (session.accessToken) {
          const hospitalList = await hospitalsApi.list();
          if (cancelled) {
            return;
          }

          const nextHospitalId = inferDefaultHospital(hospitalList, activeHospitalId);
          setHospitals(hospitalList);
          setActiveHospitalId(nextHospitalId);
          setStoredWorkspace({ activeHospitalId: nextHospitalId });
        }
      } catch (error) {
        if (!cancelled) {
          setBootError(error.message || "Unable to initialize the application.");
        }
      } finally {
        if (!cancelled) {
          setBooting(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [session.accessToken]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const nextSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };
    setSession(nextSession);
    setStoredSession(nextSession);
    return data;
  };

  const logout = () => {
    clearSession();
    setSession({ user: null, accessToken: "", refreshToken: "" });
    setHospitals([]);
    setActiveHospitalId("");
    setStoredWorkspace({ activeHospitalId: "" });
  };

  const updateWorkspaceHospital = (hospitalId) => {
    setActiveHospitalId(hospitalId);
    setStoredWorkspace({ activeHospitalId: hospitalId });
  };

  const refreshHospitals = async () => {
    if (!session.accessToken) {
      return [];
    }

    const hospitalList = await hospitalsApi.list();
    const nextHospitalId = inferDefaultHospital(hospitalList, activeHospitalId);
    setHospitals(hospitalList);
    setActiveHospitalId(nextHospitalId);
    setStoredWorkspace({ activeHospitalId: nextHospitalId });
    return hospitalList;
  };

  const value = useMemo(
    () => ({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      isAuthenticated: Boolean(session.accessToken && session.user),
      appReady,
      booting,
      bootError,
      hospitals,
      activeHospitalId,
      setActiveHospitalId: updateWorkspaceHospital,
      refreshHospitals,
      login,
      logout
    }),
    [session, appReady, booting, bootError, hospitals, activeHospitalId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
