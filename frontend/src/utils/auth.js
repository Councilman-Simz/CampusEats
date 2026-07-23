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

export function isStudent() {
  return getCurrentUserRole() === "student";
}

export function isRestaurantOwner() {
  return (
    getCurrentUserRole() ===
    "restaurant_owner"
  );
}

export function isAdmin() {
  return getCurrentUserRole() === "admin";
}

export function canAccessRole(...allowedRoles) {
  const role = getCurrentUserRole();

  return Boolean(
    role && allowedRoles.includes(role)
  );
}

