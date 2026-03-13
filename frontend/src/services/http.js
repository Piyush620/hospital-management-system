const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

class ApiClient {
  constructor() {
    this.getAccessToken = () => "";
    this.getRefreshToken = () => "";
    this.onAccessToken = () => {};
    this.onUnauthorized = () => {};
    this.refreshPromise = null;
  }

  configure(config) {
    this.getAccessToken = config.getAccessToken;
    this.getRefreshToken = config.getRefreshToken;
    this.onAccessToken = config.onAccessToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  async request(path, options = {}, retry = true) {
    const headers = new Headers(options.headers || {});
    const accessToken = this.getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const payload = await response.json().catch(() => ({}));

    if (response.status === 401 && retry && this.getRefreshToken()) {
      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        return this.request(path, options, false);
      }
    }

    if (!response.ok || payload.success === false) {
      const error = new Error(payload.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.payload = payload;

      if (response.status === 401 || response.status === 403) {
        this.onUnauthorized();
      }

      throw error;
    }

    return payload;
  }

  async refreshAccessToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.onUnauthorized();
      return false;
    }

    this.refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refreshToken })
    })
      .then((response) => response.json().then((payload) => ({ response, payload })))
      .then(({ response, payload }) => {
        if (!response.ok || payload.success === false || !payload?.data?.accessToken) {
          this.onUnauthorized();
          return false;
        }

        this.onAccessToken(payload.data.accessToken);
        return true;
      })
      .catch(() => {
        this.onUnauthorized();
        return false;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }
}

export const apiClient = new ApiClient();
