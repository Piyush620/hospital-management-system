import { apiClient } from "./http";
import { extractData, extractList } from "../lib/utils";

function paramsToQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

function createCrudApi(basePath, listFallbackKeys = []) {
  return {
    list: async (params) => {
      const response = await apiClient.request(`${basePath}${paramsToQuery(params)}`);
      return {
        items: extractList(response, listFallbackKeys),
        total: response.total ?? response.data?.total ?? 0,
        page: response.page ?? response.data?.page ?? 1,
        limit: response.limit ?? response.data?.limit ?? 10,
        raw: response
      };
    },
    get: async (id) => extractData(await apiClient.request(`${basePath}/${id}`)),
    create: async (body) => extractData(await apiClient.request(basePath, { method: "POST", body })),
    update: async (id, body) =>
      extractData(await apiClient.request(`${basePath}/${id}`, { method: "PUT", body })),
    remove: async (id) => apiClient.request(`${basePath}/${id}`, { method: "DELETE" })
  };
}

export const healthApi = {
  ready: () => apiClient.request("/api/ready")
};

export const authApi = {
  signup: (body) => apiClient.request("/api/auth/signup", { method: "POST", body }),
  login: async (body) => extractData(await apiClient.request("/api/auth/login", { method: "POST", body })),
  verifyOtp: (body) => apiClient.request("/api/auth/verify-otp", { method: "POST", body }),
  resendOtp: (body) => apiClient.request("/api/auth/resend-otp", { method: "POST", body })
};

export const hospitalsApi = {
  ...createCrudApi("/api/hospitals", ["hospitals"]),
  list: async () => {
    const response = await apiClient.request("/api/hospitals");
    return extractList(response, ["hospitals"]);
  }
};

export const departmentsApi = createCrudApi("/api/departments", ["departments"]);
export const doctorsApi = createCrudApi("/api/doctors", ["doctors"]);
export const patientsApi = createCrudApi("/api/patients", ["patients"]);
export const appointmentsApi = {
  ...createCrudApi("/api/appointments", ["appointments"]),
  listByDoctor: async (doctorId) =>
    extractList(await apiClient.request(`/api/appointments/doctor/${doctorId}`), ["appointments"])
};
export const wardsApi = createCrudApi("/api/wards", ["wards"]);
export const roomsApi = createCrudApi("/api/rooms", ["rooms"]);
export const bedsApi = createCrudApi("/api/beds", ["beds"]);
export const admissionsApi = {
  ...createCrudApi("/api/admissions", ["admissions"]),
  discharge: async (id) =>
    extractData(await apiClient.request(`/api/admissions/discharge/${id}`, { method: "POST" }))
};
export const billingsApi = createCrudApi("/api/billings", ["bills", "billings"]);
export const paymentsApi = createCrudApi("/api/payments", ["payments"]);
export const dashboardApi = {
  stats: async () => extractData(await apiClient.request("/api/dashboard/stats")),
  admissionsTrend: async () => extractData(await apiClient.request("/api/dashboard/admissions-trend"))
};
export const auditApi = createCrudApi("/api/audit-logs", ["logs", "auditLogs"]);

export { apiClient };
