import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth/session";
import {
  PERMISSIONS,
  canGrantPermission,
  canManageRules,
  hasPermission,
  type PermissionKey,
} from "@/lib/auth/permissions";
import { ADMIN_TIER_ROLES } from "@/lib/auth/roleHierarchy";

const VALID_PERMISSIONS = Object.values(PERMISSIONS) as string[];

export async function getGrantedPermissions(userId: string): Promise<string[]> {
  const rows = await prisma.userPermission.findMany({
    where: { userId },
    select: { permission: true },
  });
  return rows.map((r) => r.permission);
}

// Live actor lookup for API routes. The JWT role can be stale (up to 7 days), so
// the DB role and isActive flag are authoritative.
async function loadActor(userId: string) {
  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });
  return actor && actor.isActive ? actor : null;
}

// DB-backed permission gate for admin API routes (role default + explicit grants).
export async function sessionHasPermission(
  session: SessionPayload,
  permission: PermissionKey,
): Promise<boolean> {
  const actor = await loadActor(session.userId);
  if (!actor) return false;
  return hasPermission(
    actor.role,
    await getGrantedPermissions(session.userId),
    permission,
  );
}

// For ops that are not CMS permissions (user/worker moderation): ADMIN or SUPER_ADMIN.
export async function sessionIsAdminTier(session: SessionPayload): Promise<boolean> {
  const actor = await loadActor(session.userId);
  return !!actor && (ADMIN_TIER_ROLES as readonly string[]).includes(actor.role);
}

// Server-side gate for role/permission management. Reads grants from the DB so
// a revoked permission takes effect immediately (the JWT only carries the role).
export async function sessionCanManageRules(
  session: SessionPayload,
): Promise<boolean> {
  if (session.role === "SUPER_ADMIN") return true;
  return canManageRules(session.role, await getGrantedPermissions(session.userId));
}

export type GrantResult = { ok: true } | { ok: false; error: string };

// Only SUPER_ADMIN may grant/revoke. SUPER_ADMIN targets are rejected: they hold
// every permission implicitly and must not lose rules:manage.
export async function setPermissionGrant(
  actor: SessionPayload,
  targetUserId: string,
  permission: string,
  granted: boolean,
): Promise<GrantResult> {
  if (!canGrantPermission(actor.role)) {
    return { ok: false, error: "Only SUPER_ADMIN can grant permissions" };
  }
  if (!VALID_PERMISSIONS.includes(permission)) {
    return { ok: false, error: "Unknown permission" };
  }
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true },
  });
  if (!target) return { ok: false, error: "User not found" };
  if (target.role === "SUPER_ADMIN") {
    return { ok: false, error: "SUPER_ADMIN holds all permissions" };
  }

  const key = permission as PermissionKey;
  if (granted) {
    await prisma.userPermission.upsert({
      where: { userId_permission: { userId: targetUserId, permission: key } },
      create: { userId: targetUserId, permission: key, grantedById: actor.userId },
      update: {},
    });
  } else {
    await prisma.userPermission.deleteMany({
      where: { userId: targetUserId, permission: key },
    });
  }
  return { ok: true };
}
