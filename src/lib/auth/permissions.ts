// Permission keys for the admin tier. Pure logic only (no DB access), so it
// can be used from API routes, server components, and tests.
//
// - rules:manage: may change user roles and permission grants (role/permission
//   management screen). SUPER_ADMIN always has it and cannot lose it.
// - Only SUPER_ADMIN can grant or revoke rules:manage for other users.

// - content:*, media:manage, seo:manage, settings:manage: CMS capabilities.
//   ADMIN has all of them by default; EDITOR has content/media/seo (no settings).

export const PERMISSIONS = {
  RULES_MANAGE: "rules:manage",
  CONTENT_EDIT: "content:edit",
  CONTENT_PUBLISH: "content:publish",
  MEDIA_MANAGE: "media:manage",
  SEO_MANAGE: "seo:manage",
  SETTINGS_MANAGE: "settings:manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Permissions each role holds without an explicit grant. SUPER_ADMIN is handled
// separately in hasPermission() and holds every permission implicitly.
// rules:manage is never a role default except for SUPER_ADMIN; ADMIN needs a grant.
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.SEO_MANAGE,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
  EDITOR: [
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.SEO_MANAGE,
  ],
};

export function hasPermission(
  actorRole: string,
  grantedPermissions: readonly string[],
  permission: PermissionKey,
): boolean {
  if (actorRole === "SUPER_ADMIN") return true;
  if (DEFAULT_ROLE_PERMISSIONS[actorRole]?.includes(permission)) return true;
  return grantedPermissions.includes(permission);
}

// Role-only check for places without DB grants (e.g. UI hints, middleware).
export function can(actorRole: string, permission: PermissionKey): boolean {
  return hasPermission(actorRole, [], permission);
}

export function canManageRules(
  actorRole: string,
  grantedPermissions: readonly string[],
): boolean {
  return hasPermission(actorRole, grantedPermissions, PERMISSIONS.RULES_MANAGE);
}

export function canGrantPermission(actorRole: string): boolean {
  return actorRole === "SUPER_ADMIN";
}
