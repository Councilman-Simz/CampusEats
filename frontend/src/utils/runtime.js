const PRODUCTION_API_URL =
  "https://campuseats-1.onrender.com";

export function getApiBaseUrl() {
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

export function getWebSocketBaseUrl() {
  return getApiBaseUrl()
    .replace(/^https:/, "wss:")
    .replace(/^http:/, "ws:");
}
