import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import AdminUsersClient from "./AdminUsersClient";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import { getSession } from "@/lib/auth/session";
import { canManageUserAccount, loadUserManager, rolePolicyRole } from "@/lib/auth/userManagement";

export const metadata: Metadata = buildPageMetadata("admin.users");

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { role, search, page = "1" } = sp;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 20;
  const skip = (pageNum - 1) * limit;

  const where: Record<string, unknown> = {};
  if (role && role !== "ALL") where.role = role;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const session = await getSession();
  // DB-backed: admin-tier users and rules:manage holders. JWT role may be stale.
  const manager = session ? await loadUserManager(session) : null;
  const canManageRoles = !!manager;
  const actorRole = manager ? rolePolicyRole(manager) : "";
  const actorId = session?.userId ?? "";

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        address: true,
        _count: { select: { bookings: true } },
        permissions: { select: { permission: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Users" description={`${total} total users`} />

      <AdminUsersClient
        users={users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isActive: u.isActive,
          isEmailVerified: u.isEmailVerified,
          isPhoneVerified: u.isPhoneVerified,
          bookingCount: u._count.bookings,
          city: u.address?.city ?? "—",
          createdAt: u.createdAt.toISOString(),
          permissions: u.permissions.map((p) => p.permission),
          isSelf: u.id === actorId,
          canEdit: u.id === actorId || (!!manager && canManageUserAccount(actorRole, u.role, manager.hasRulesGrant)),
        }))}
        total={total}
        page={pageNum}
        limit={limit}
        activeRole={role}
        search={search}
        actorRole={actorRole}
        canManageRoles={canManageRoles}
      />
    </div>
  );
}
