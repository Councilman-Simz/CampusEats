import axios from "axios";

const PRODUCTION_API_URL =
  "https://campuseats-1.onrender.com";

function getApiUrl() {
  const configuredUrl =
    import.meta.env.VITE_API_URL?.trim();

  if (
    configuredUrl &&
    configuredUrl !== "undefined" &&
    !configuredUrl.includes("your-backend-url")
  ) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }

  return "http://localhost:8000";
}

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl =
      error.config?.url || "";

    if (status === 401) {
      console.warn(
        "Unauthorized request:",
        requestUrl
      );

      const isProtectedOwnerRequest =
        requestUrl.startsWith("/owner/");

      if (isProtectedOwnerRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    if (status === 403) {
      console.warn(
        "Forbidden request:",
        requestUrl
      );
    }

    return Promise.reject(error);
  }
);

export { getApiUrl };
export default api;