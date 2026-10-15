"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge, showToast } from "@/components/ui";
import { ALL_ROLES, canChangeUserRole } from "@/lib/auth/roleHierarchy";
import { callApi, DeleteModal, PasswordModal, type User } from "../AdminUsersClient";

type ModalState = { kind: "password" } | { kind: "delete" } | null;

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

  const btnBase = "h-9 px-4 rounded-[10px] text-sm font-bold transition-colors";

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-16 h-16 rounded-full bg-[#eaf0f8] flex items-center justify-center text-2xl font-bold text-[#034795] shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px] truncate">{user.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge status={user.role} />
              <span className={user.isActive
                ? "text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-600"
                : "text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-500"}>
                {user.isActive ? "Active" : "Inactive"}
              </span>
              {user.isSelf && <span className="text-xs font-bold text-[#5b6480]">(you)</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {user.canEdit && (
            <Link href={`/admin/users/${user.id}/edit`} className={`${btnBase} inline-flex items-center bg-[#eaf0f8] text-[#034795] hover:bg-[#dbe6f4]`}>
              Edit
            </Link>
          )}
          {user.canEdit && (
            <button onClick={() => setModal({ kind: "password" })} className={`${btnBase} bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee]`}>
              {user.isSelf ? "Change password" : "Reset password"}
            </button>
          )}
          {user.canEdit && !user.isSelf && (
            <button onClick={toggleActive} className={`${btnBase} bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee]`}>
              {user.isActive ? "Deactivate" : "Activate"}
            </button>
          )}
          {user.canEdit && !user.isSelf && (
            <button onClick={() => setModal({ kind: "delete" })} className={`${btnBase} bg-red-50 text-[#d64545] hover:bg-red-100`}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-5">
          <h2 className="text-lg font-bold text-[#001353]">Details</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div className="flex flex-col gap-6">
          {/* Role */}
          <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#001353]">Role</h2>
            {showRoleSelect ? (
              <>
                <select
                  value={user.role}
                  disabled={roleSaving}
                  onChange={(e) => changeRole(e.target.value)}
                  className="h-11 px-4 border border-[#ddddee] rounded-[12px] text-sm font-bold text-[#001353] outline-none focus:border-[#034795]"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-xs text-[#5b6480]">Changes apply on the next request and are logged on the server.</p>
              </>
            ) : (
              <>
                <StatusBadge status={user.role} />
                <p className="text-xs text-[#5b6480]">
                  {canManageRoles ? "You cannot change this user's role." : "Only users with rules:manage can change roles."}
                </p>
              </>
            )}
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#001353]">Granted permissions</h2>
            {user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {user.permissions.map((p) => (
                  <span key={p} className="text-[11px] font-bold bg-[#eaf0f8] text-[#034795] px-2 py-1 rounded">{p}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5b6480]">No extra permissions granted.</p>
            )}
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
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-bold text-[#5b6480] uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-[#001353] break-words">{value}</dd>
    </div>
  );
}
