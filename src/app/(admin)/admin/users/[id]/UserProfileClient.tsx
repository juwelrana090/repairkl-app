"use client";
import { useState, type ComponentProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import { ALL_ROLES, canChangeUserRole } from "@/lib/auth/roleHierarchy";
import { callApi, DeleteModal, PasswordModal, type User } from "../AdminUsersClient";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import AdminButton from "@/components/admin/ui/Button";
import AdminBadge from "@/components/admin/ui/Badge";
import { AdminCard } from "@/components/admin/ui/Card";
import { AdminSelect } from "@/components/admin/ui/Field";

type ModalState = { kind: "password" } | { kind: "delete" } | null;
type BadgeColor = NonNullable<ComponentProps<typeof AdminBadge>["color"]>;

const ROLE_COLOR: Record<string, BadgeColor> = {
  CUSTOMER: "info",
  WORKER: "warning",
  SUPPORT: "primary",
  EDITOR: "success",
  ADMIN: "error",
  SUPER_ADMIN: "neutral",
};

export default function UserProfileClient({
  user, actorRole, canManageRoles,
}: {
  user: User; actorRole: string; canManageRoles: boolean;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [roleSaving, setRoleSaving] = useState(false);

  // Same rule as the list: only roles the actor may assign, plus the current role.
  const roleOptions = ALL_ROLES.filter((r) => r === user.role || canChangeUserRole(actorRole, user.role, r));
  const showRoleSelect = canManageRoles && roleOptions.length > 1;

  const closeModal = () => setModal(null);
  const onSaved = () => { setModal(null); router.refresh(); };

  const changeRole = async (newRole: string) => {
    if (newRole === user.role) return;
    setRoleSaving(true);
    const res = await callApi(`/api/admin/users/${user.id}/role`, "PATCH", { role: newRole });
    setRoleSaving(false);
    if (res.ok) {
      showToast(`Role changed to ${newRole}`, "success");
      router.refresh();
    } else {
      showToast(res.error, "error");
    }
  };

  const toggleActive = async () => {
    const res = await callApi(`/api/admin/users/${user.id}/toggle-active`, "POST", { isActive: !user.isActive });
    if (res.ok) {
      showToast(`User ${user.isActive ? "deactivated" : "activated"}`, "success");
      router.refresh();
    } else {
      showToast(res.error, "error");
    }
  };

  const editLinkCls =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#034795] px-3.5 py-2 text-sm font-medium text-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition hover:bg-[#023a7a]";

  return (
    <>
      <AdminPageHeader
        title={user.fullName}
        description={user.email}
        breadcrumbs={[
          { label: "Users", href: "/admin/users" },
          { label: user.fullName },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {user.canEdit && (
              <Link href={`/admin/users/${user.id}/edit`} className={editLinkCls}>
                Edit
              </Link>
            )}
            {user.canEdit && (
              <AdminButton size="sm" variant="outline" onClick={() => setModal({ kind: "password" })}>
                {user.isSelf ? "Change password" : "Reset password"}
              </AdminButton>
            )}
            {user.canEdit && !user.isSelf && (
              <AdminButton size="sm" variant="outline" onClick={toggleActive}>
                {user.isActive ? "Deactivate" : "Activate"}
              </AdminButton>
            )}
            {user.canEdit && !user.isSelf && (
              <AdminButton size="sm" variant="danger" onClick={() => setModal({ kind: "delete" })}>
                Delete
              </AdminButton>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-6">
        {/* Summary */}
        <AdminCard>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#eaf0f8] text-2xl font-semibold text-[#034795]">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <AdminBadge color={ROLE_COLOR[user.role] ?? "neutral"} size="sm">
                  {user.role.replace("_", " ")}
                </AdminBadge>
                <AdminBadge color={user.isActive ? "success" : "error"} size="sm">
                  {user.isActive ? "Active" : "Inactive"}
                </AdminBadge>
                {user.isSelf && <span className="text-xs font-medium text-[#5b6480]">(you)</span>}
              </div>
            </div>
          </div>
        </AdminCard>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Details */}
          <div className="lg:col-span-2">
            <AdminCard title="Details">
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" value={user.email} />
                <Field label="Phone" value={user.phone} />
                <Field label="City" value={user.city} />
                <Field label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                <Field label="Bookings" value={String(user.bookingCount)} />
                <Field
                  label="Verified"
                  value={[user.isEmailVerified && "Email", user.isPhoneVerified && "Phone"].filter(Boolean).join(", ") || "Not verified"}
                />
              </dl>
            </AdminCard>
          </div>

          <div className="flex flex-col gap-6">
            {/* Role */}
            <AdminCard title="Role">
              {showRoleSelect ? (
                <div className="flex flex-col gap-2">
                  <AdminSelect
                    aria-label="Role"
                    value={user.role}
                    disabled={roleSaving}
                    onChange={(e) => changeRole(e.target.value)}
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </AdminSelect>
                  <p className="text-xs text-[#5b6480]">Changes apply on the next request and are logged on the server.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div>
                    <AdminBadge color={ROLE_COLOR[user.role] ?? "neutral"} size="sm">
                      {user.role.replace("_", " ")}
                    </AdminBadge>
                  </div>
                  <p className="text-xs text-[#5b6480]">
                    {canManageRoles ? "You cannot change this user's role." : "Only users with rules:manage can change roles."}
                  </p>
                </div>
              )}
            </AdminCard>

            {/* Permissions */}
            <AdminCard title="Granted permissions">
              {user.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {user.permissions.map((p) => (
                    <span key={p} className="rounded-md bg-[#eaf0f8] px-2 py-1 text-xs font-medium text-[#034795]">{p}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5b6480]">No extra permissions granted.</p>
              )}
            </AdminCard>
          </div>
        </div>
      </div>

      {modal?.kind === "password" && (
        <PasswordModal user={user} onClose={closeModal} onSaved={onSaved} />
      )}
      {modal?.kind === "delete" && (
        <DeleteModal user={user} onClose={closeModal} onDeleted={() => router.push("/admin/users")} />
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-[#8a92a8] uppercase tracking-wide">{label}</dt>
      <dd className="break-words text-sm text-[#3d4766]">{value}</dd>
    </div>
  );
}
