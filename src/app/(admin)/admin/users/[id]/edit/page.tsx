import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import { getSession } from "@/lib/auth/session";
import { ALL_ROLES, canChangeUserRole } from "@/lib/auth/roleHierarchy";
import { canManageUserAccount, loadUserManager, rolePolicyRole } from "@/lib/auth/userManagement";
import EditUserClient from "./EditUserClient";

export const metadata: Metadata = buildPageMetadata("admin.users");

export const dynamic = "force-dynamic";

// Separate edit page (not a modal). Self can edit own profile; everyone else needs
// admin-tier or rules:manage and the same rule as the API routes.
export default async function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  // DB-backed: JWT role may be stale.
  const manager = await loadUserManager(session);
  const isSelf = session.userId === id;
  if (!isSelf && !manager) redirect(`/admin/users/${id}`);

  const u = await prisma.user.findUnique({
    where: { id },
    include: { address: true },
  });
  if (!u) notFound();

  const actorRole = manager ? rolePolicyRole(manager) : "";
  if (!isSelf && (!manager || !canManageUserAccount(actorRole, u.role, manager.hasRulesGrant))) {
    redirect(`/admin/users/${id}`);
  }

  // Self cannot change own role (route returns 400), so only offer roles to other users.
  const roleOptions =
    manager && !isSelf
      ? ALL_ROLES.filter((r) => r === u.role || canChangeUserRole(actorRole, u.role, r))
      : [];

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/admin/users/${u.id}`} className="text-sm font-semibold text-[#034795] hover:underline w-fit">
        ← Back to user profile
      </Link>

      <EditUserClient
        user={{
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isActive: u.isActive,
          isSelf,
          address: {
            street: u.address?.street ?? "",
            city: u.address?.city ?? "",
            state: u.address?.state ?? "",
            zipCode: u.address?.zipCode ?? "",
            country: u.address?.country ?? "",
          },
        }}
        roleOptions={roleOptions}
      />
    </div>
  );
}
