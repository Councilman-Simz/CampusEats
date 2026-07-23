export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  return getCurrentUser()?.id ?? null;
}

export function getCurrentUserRole() {
  return getCurrentUser()?.role ?? null;
}

export function getToken() {
  return localStorage.getItem("token");
}
