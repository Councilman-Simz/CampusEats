export function getApiBaseUrl() {
  const configuredUrl =
    import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return "http://localhost:8000";
}

export function getWebSocketBaseUrl() {
  return getApiBaseUrl()
    .replace(/^https:/, "wss:")
    .replace(/^http:/, "ws:");
}
