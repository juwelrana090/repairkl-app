import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import { getSession } from "@/lib/auth/session";
import { canManageUserAccount, loadUserManager, rolePolicyRole } from "@/lib/auth/userManagement";
import UserProfileClient from "./UserProfileClient";

export const metadata: Metadata = buildPageMetadata("admin.users");

export const dynamic = "force-dynamic";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  // DB-backed: admin-tier users and rules:manage holders. JWT role may be stale.
  const manager = session ? await loadUserManager(session) : null;
  const canManageRoles = !!manager;
  const actorRole = manager ? rolePolicyRole(manager) : "";
  const actorId = session?.userId ?? "";

  const u = await prisma.user.findUnique({
    where: { id },
    include: {
      address: true,
      _count: { select: { bookings: true } },
      permissions: { select: { permission: true } },
    },
  });
  if (!u) notFound();

  const isSelf = u.id === actorId;
  const canEdit = isSelf || (!!manager && canManageUserAccount(actorRole, u.role, manager.hasRulesGrant));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/users" className="text-sm font-semibold text-[#034795] hover:underline w-fit">
        ← Back to user list
      </Link>

      <UserProfileClient
        user={{
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
          isSelf,
          canEdit,
        }}
        actorRole={actorRole}
        canManageRoles={canManageRoles}
      />
    </div>
  );
}
