// Role-change policy for the admin tier.
//
// - SUPER_ADMIN: can change any user's role, including ADMIN and other SUPER_ADMIN.
// - ADMIN: can change non-admin users only (CUSTOMER, WORKER, SUPPORT, EDITOR).
//   Cannot touch an ADMIN/SUPER_ADMIN account, and cannot grant ADMIN/SUPER_ADMIN.
// - Everyone else: cannot change roles.
//
// Pure functions, no DB access, so they can be unit-tested and reused by the
// role PATCH API (B2) and the permission gate (B1).

export const ALL_ROLES = [
  "CUSTOMER",
  "WORKER",
  "SUPPORT",
  "EDITOR",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export const PROTECTED_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

// Roles that hold admin-tier access (used for the last-admin guard).
export const ADMIN_TIER_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

const ASSIGNABLE_BY_ADMIN = ["CUSTOMER", "WORKER", "SUPPORT", "EDITOR"] as const;

export function isProtectedRole(role: string): boolean {
  return (PROTECTED_ROLES as readonly string[]).includes(role);
}

export function canChangeUserRole(
  actorRole: string,
  targetCurrentRole: string,
  newRole: string,
): boolean {
  if (actorRole === "SUPER_ADMIN") return true;
  if (actorRole !== "ADMIN") return false;
  if (isProtectedRole(targetCurrentRole)) return false;
  return (ASSIGNABLE_BY_ADMIN as readonly string[]).includes(newRole);
}
