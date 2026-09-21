export function dashboardPathForRole(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "SUPPLIER") return "/supplier";
  return "/client";
}
