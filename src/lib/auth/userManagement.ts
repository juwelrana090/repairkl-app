import type { SessionPayload } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ADMIN_TIER_ROLES, isProtectedRole } from "@/lib/auth/roleHierarchy";
import { PERMISSIONS } from "@/lib/auth/permissions";

// Shared rules for the admin user routes (edit, role, password, delete).
// The JWT role can be stale, so the actor is always re-read from the DB.

export type UserActor = { id: string; role: string };

// A user who may manage other accounts: ADMIN-tier roles, or anyone holding the
// rules:manage grant from rule management.
export type UserManager = UserActor & { hasRulesGrant: boolean };

export async function loadAdminTierActor(session: SessionPayload): Promise<UserActor | null> {
  const actor = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!actor || !actor.isActive) return null;
  if (!(ADMIN_TIER_ROLES as readonly string[]).includes(actor.role)) return null;
  return { id: actor.id, role: actor.role };
}

export async function loadUserManager(session: SessionPayload): Promise<UserManager | null> {
  const actor = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      role: true,
      isActive: true,
      permissions: { where: { permission: PERMISSIONS.RULES_MANAGE }, select: { id: true } },
    },
  });
  if (!actor || !actor.isActive) return null;
  const hasRulesGrant = actor.permissions.length > 0;
  const isAdminTier = (ADMIN_TIER_ROLES as readonly string[]).includes(actor.role);
  if (!isAdminTier && !hasRulesGrant) return null;
  return { id: actor.id, role: actor.role, hasRulesGrant };
}

// Role-change policy role. A rules:manage grant gets the same reach as ADMIN:
// non-protected accounts only, assignable roles only (see canChangeUserRole).
export function rolePolicyRole(manager: UserManager): string {
  return manager.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
}

// SUPER_ADMIN can edit any account. ADMIN and rules:manage holders can edit
// non-protected accounts. ADMIN/SUPER_ADMIN accounts are protected from everyone
// except SUPER_ADMIN.
export function canManageUserAccount(
  actorRole: string,
  targetRole: string,
  hasRulesGrant = false,
): boolean {
  if (actorRole === "SUPER_ADMIN") return true;
  if (isProtectedRole(targetRole)) return false;
  return actorRole === "ADMIN" || hasRulesGrant;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?[0-9]{8,15}$/;
export const MIN_PASSWORD_LENGTH = 8;
