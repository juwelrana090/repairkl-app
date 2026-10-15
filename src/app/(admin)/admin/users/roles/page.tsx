import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import { getSession } from "@/lib/auth/session";
import { ALL_ROLES } from "@/lib/auth/roleHierarchy";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from "@/lib/auth/permissions";
import { loadUserManager } from "@/lib/auth/userManagement";
import RolesClient from "./RolesClient";

export const metadata: Metadata = buildPageMetadata("admin.users");

export const dynamic = "force-dynamic";

// Role Management: role defaults plus per-user permission grants.
// Only SUPER_ADMIN can toggle grants (enforced in setPermissionGrant); others see it read-only.
export default async function AdminRolesPage() {
  const session = await getSession();
  // DB-backed: JWT role may be stale.
  const manager = session ? await loadUserManager(session) : null;

  if (!manager) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Role Management</h1>
        <p className="text-sm text-[#5b6480]">
          Only admin-tier users and users with rules:manage can open this page.
        </p>
      </div>
    );
  }

  const [counts, people] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.user.findMany({
      where: {
        OR: [
          { role: { in: ["ADMIN", "SUPER_ADMIN", "EDITOR"] } },
          { permissions: { some: {} } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        permissions: { select: { permission: true } },
      },
      orderBy: [{ role: "asc" }, { fullName: "asc" }],
      take: 200,
    }),
  ]);

  const roles = ALL_ROLES.map((role) => ({
    role,
    userCount: counts.find((c) => c.role === role)?._count._all ?? 0,
    defaults: DEFAULT_ROLE_PERMISSIONS[role] ?? [],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Role Management</h1>
        <p className="text-sm text-[#5b6480] mt-1">
          Role defaults and per-user permission grants.
          {manager.role !== "SUPER_ADMIN" && " You can view grants; only SUPER_ADMIN can change them."}
        </p>
      </div>

      <RolesClient
        roles={roles}
        permissionKeys={Object.values(PERMISSIONS)}
        users={people.map((p) => ({
          id: p.id,
          fullName: p.fullName,
          email: p.email,
          role: p.role,
          isSelf: p.id === manager.id,
          grants: p.permissions.map((g) => g.permission),
        }))}
        canGrant={manager.role === "SUPER_ADMIN"}
      />
    </div>
  );
}
