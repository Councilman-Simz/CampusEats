import axios from "axios";

const PRODUCTION_API_URL =
  "https://campuseats-1.onrender.com";

function getApiUrl() {
  const configured =
    import.meta.env.VITE_API_URL?.trim();

  if (
    configured &&
    !configured.includes("your-backend-url") &&
    configured !== "undefined"
  ) {
    return configured.replace(/\/$/, "");
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
      config.headers = config.headers || {};
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
    /*
     * A protected page must not erase the entire
     * session merely because one request returned
     * 401 or 403.
     */
    if (error.response?.status === 401) {
      console.warn(
        "Unauthorized request:",
        error.config?.url
      );
    }

    if (error.response?.status === 403) {
      console.warn(
        "Forbidden request:",
        error.config?.url
      );
    }

    return Promise.reject(error);
  }
);

export { getApiUrl };
export default api;
