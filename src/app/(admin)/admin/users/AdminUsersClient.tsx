"use client";
import AppIcon from "@/components/ui/AppIcon";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, showToast } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { twMerge } from "tailwind-merge";
import { ALL_ROLES, canChangeUserRole } from "@/lib/auth/roleHierarchy";
import AdminButton from "@/components/admin/ui/Button";
import AdminBadge from "@/components/admin/ui/Badge";
import AdminPagination from "@/components/admin/ui/Pagination";
import { AdminCard } from "@/components/admin/ui/Card";
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui/Table";

export interface User {
  id: string; fullName: string; email: string; phone: string; role: string;
  isActive: boolean; isEmailVerified: boolean; isPhoneVerified: boolean;
  bookingCount: number; city: string; createdAt: string; permissions: string[];
  isSelf: boolean; canEdit: boolean;
}

type ModalState =
  | { kind: "create" }
  | { kind: "password"; user: User }
  | { kind: "delete"; user: User }
  | null;

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "neutral";

const ROLES = ["ALL", ...ALL_ROLES];

// Same colour family as the dashboard role labels.
const ROLE_COLOR: Record<string, BadgeColor> = {
  CUSTOMER: "info",
  WORKER: "warning",
  SUPPORT: "primary",
  EDITOR: "success",
  ADMIN: "error",
  SUPER_ADMIN: "neutral",
};

export async function callApi(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, error: (data?.error as string | undefined) ?? "Request failed" };
}

export default function AdminUsersClient({
  users, total, page, limit, activeRole, search, actorRole, canManageRoles,
}: {
  users: User[]; total: number; page: number; limit: number; activeRole?: string; search?: string;
  actorRole: string; canManageRoles: boolean;
}) {
  const router = useRouter();
  const [searchQ, setSearchQ] = useState(search ?? "");
  const [modal, setModal] = useState<ModalState>(null);

  // Server enforces the same rules; this only hides options that would be rejected.
  const roleOptionsFor = (user: User) =>
    ALL_ROLES.filter((r) => r === user.role || canChangeUserRole(actorRole, user.role, r));
  const createRoles = ALL_ROLES.filter((r) => canChangeUserRole(actorRole, "CUSTOMER", r));

  const closeModal = () => setModal(null);
  const onSaved = () => { setModal(null); router.refresh(); };

  const changeRole = async (user: User, newRole: string) => {
    if (newRole === user.role) return;
    const res = await callApi(`/api/admin/users/${user.id}/role`, "PATCH", { role: newRole });
    if (res.ok) { showToast(`Role changed to ${newRole}`, "success"); router.refresh(); }
    else {
      showToast(res.error, "error");
      router.refresh();
    }
  };

  const applyFilter = (role?: string, q?: string) => {
    const params = new URLSearchParams();
    if (role && role !== "ALL") params.set("role", role);
    if (q) params.set("search", q);
    router.push(`/admin/users?${params.toString()}`);
  };

  const toggleActive = async (userId: string, active: boolean) => {
    const res = await callApi(`/api/admin/users/${userId}/toggle-active`, "POST", { isActive: !active });
    if (res.ok) { showToast(`User ${active ? "deactivated" : "activated"}`, "success"); router.refresh(); }
    else showToast(res.error, "error");
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Toolbar: role filter, search, add */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e4e7f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => {
            const active = (activeRole ?? "ALL") === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => applyFilter(r, searchQ)}
                className={twMerge(
                  "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                  active
                    ? "border-[#034795] bg-[#eaf0f8] text-[#034795]"
                    : "border-[#d0d5dd] bg-white text-[#5b6480] hover:bg-[#f9fafb]"
                )}
              >
                {r === "ALL" ? "All" : r.replace("_", " ")}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]">
              <AppIcon name="search" className="h-4 w-4" />
            </span>
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilter(activeRole, searchQ)}
              placeholder="Search users..."
              className="h-11 w-56 rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-3 text-sm text-[#001353] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline-none transition placeholder:text-[#98a2b3] focus:border-[#034795]"
            />
          </div>
          <AdminButton variant="outline" size="md" onClick={() => applyFilter(activeRole, searchQ)}>
            Search
          </AdminButton>
          {createRoles.length > 0 && (
            <AdminButton
              size="md"
              startIcon={<AppIcon name="plus" className="h-4 w-4" />}
              onClick={() => setModal({ kind: "create" })}
            >
              Add user
            </AdminButton>
          )}
        </div>
      </div>

      {/* Table */}
      <AdminCard className="overflow-hidden" title="Users" desc={`Showing ${users.length} of ${total}`}>
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTh>User</AdminTh>
              <AdminTh>Contact</AdminTh>
              <AdminTh>Role</AdminTh>
              <AdminTh className="text-center">Bookings</AdminTh>
              <AdminTh>Location</AdminTh>
              <AdminTh>Verified</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {users.map((u) => (
              <AdminTableRow key={u.id}>
                <AdminTd>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0f8] text-sm font-semibold text-[#034795]">
                      {u.fullName.charAt(0)}
                    </div>
                    <div>
                      <Link href={`/admin/users/${u.id}`} className="font-medium text-[#001353] hover:text-[#034795] hover:underline">
                        {u.fullName}
                      </Link>
                      <p className="text-xs text-[#8a92a8]">{new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </AdminTd>
                <AdminTd>
                  <p>{u.email}</p>
                  <p className="text-xs text-[#8a92a8]">{u.phone}</p>
                </AdminTd>
                <AdminTd>
                  {canManageRoles && roleOptionsFor(u).length > 1 ? (
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="h-9 cursor-pointer rounded-lg border border-[#d0d5dd] bg-white px-2.5 text-xs font-medium text-[#001353] outline-none focus:border-[#034795]"
                    >
                      {roleOptionsFor(u).map((r) => (
                        <option key={r} value={r}>{r.replace("_", " ")}</option>
                      ))}
                    </select>
                  ) : (
                    <AdminBadge color={ROLE_COLOR[u.role] ?? "neutral"} size="sm">
                      {u.role.replace("_", " ")}
                    </AdminBadge>
                  )}
                  {u.permissions.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {u.permissions.map((p) => (
                        <span key={p} className="rounded bg-[#eaf0f8] px-1.5 py-0.5 text-[10px] font-semibold text-[#034795]">{p}</span>
                      ))}
                    </div>
                  )}
                </AdminTd>
                <AdminTd className="text-center font-semibold text-[#001353]">{u.bookingCount}</AdminTd>
                <AdminTd>{u.city}</AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-1.5">
                    {u.isEmailVerified && (
                      <span title="Email verified" className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#ecfdf3] text-[#067647]">
                        <AppIcon name="mail" className="h-4 w-4" />
                      </span>
                    )}
                    {u.isPhoneVerified && (
                      <span title="Phone verified" className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#eff8ff] text-[#175cd3]">
                        <AppIcon name="smartphone" className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </AdminTd>
                <AdminTd>
                  <AdminBadge color={u.isActive ? "success" : "error"} size="sm">
                    {u.isActive ? "Active" : "Inactive"}
                  </AdminBadge>
                </AdminTd>
                <AdminTd>
                  <div className="flex flex-wrap gap-1.5">
                    {u.canEdit && (
                      <Link
                        href={`/admin/users/${u.id}/edit`}
                        className="inline-flex cursor-pointer items-center rounded-lg bg-[#eaf0f8] px-2.5 py-1.5 text-xs font-medium text-[#034795] transition hover:bg-[#dbe6f4]"
                      >
                        Edit
                      </Link>
                    )}
                    {u.canEdit && (
                      <AdminButton variant="outline" size="sm" onClick={() => setModal({ kind: "password", user: u })}>
                        Password
                      </AdminButton>
                    )}
                    {u.canEdit && !u.isSelf && (
                      <AdminButton variant="outline" size="sm" onClick={() => toggleActive(u.id, u.isActive)}>
                        {u.isActive ? "Deactivate" : "Activate"}
                      </AdminButton>
                    )}
                    {u.canEdit && !u.isSelf && (
                      <AdminButton variant="danger" size="sm" onClick={() => setModal({ kind: "delete", user: u })}>
                        Delete
                      </AdminButton>
                    )}
                  </div>
                </AdminTd>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#f0f2f7] pt-4 text-sm">
            <p className="text-[#5b6480]">
              Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <AdminPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                const params = new URLSearchParams();
                if (activeRole) params.set("role", activeRole);
                if (search) params.set("search", search);
                params.set("page", String(p));
                router.push(`/admin/users?${params}`);
              }}
            />
          </div>
        )}
      </AdminCard>

      {modal?.kind === "create" && (
        <UserFormModal createRoles={createRoles} onClose={closeModal} onSaved={onSaved} />
      )}
      {modal?.kind === "password" && (
        <PasswordModal user={modal.user} onClose={closeModal} onSaved={onSaved} />
      )}
      {modal?.kind === "delete" && (
        <DeleteModal user={modal.user} onClose={closeModal} onDeleted={onSaved} />
      )}
    </>
  );
}

// Create only. Editing an existing user lives on /admin/users/[id]/edit.
export function UserFormModal({
  createRoles, onClose, onSaved,
}: {
  createRoles: string[]; onClose: () => void; onSaved: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(createRoles[0] ?? "CUSTOMER");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const res = await callApi("/api/admin/users", "POST", { fullName, email, phone, password, role });
    setSaving(false);
    if (res.ok) {
      showToast("User created", "success");
      onSaved();
    } else {
      setFormError(res.error);
    }
  };

  return (
    <Modal open onClose={onClose} title="Add user" size="md">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Phone (e.g. +60123456789)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Input label="Password (min 8 characters)" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#5b6480]">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="h-12 px-4 border border-[#ddddee] rounded-[16px] text-sm text-[#001353] outline-none focus:border-[#034795]">
            {createRoles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {formError && <p className="text-sm text-[#d64545]">{formError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Create user</Button>
        </div>
      </form>
    </Modal>
  );
}

// Self requires the current password. Admin reset for others does not.
export function PasswordModal({
  user, onClose, onSaved,
}: {
  user: User; onClose: () => void; onSaved: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setFormError("Passwords do not match");
      return;
    }
    setSaving(true);
    setFormError("");
    const res = await callApi(`/api/admin/users/${user.id}/password`, "POST", {
      password,
      ...(user.isSelf ? { currentPassword } : {}),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Password updated", "success");
      onSaved();
    } else {
      setFormError(res.error);
    }
  };

  return (
    <Modal open onClose={onClose}
      title={user.isSelf ? "Change your password" : `Reset password · ${user.fullName}`} size="sm">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {user.isSelf && (
          <Input label="Current password" type="password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} required />
        )}
        <Input label="New password (min 8 characters)" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <Input label="Confirm new password" type="password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} required />
        {formError && <p className="text-sm text-[#d64545]">{formError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Update password</Button>
        </div>
      </form>
    </Modal>
  );
}

export function DeleteModal({
  user, onClose, onDeleted,
}: {
  user: Pick<User, "id" | "fullName" | "email">; onClose: () => void; onDeleted: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const remove = async () => {
    setSaving(true);
    setFormError("");
    const res = await callApi(`/api/admin/users/${user.id}`, "DELETE");
    setSaving(false);
    if (res.ok) {
      showToast("User deleted", "success");
      onDeleted();
    } else {
      setFormError(res.error);
    }
  };

  return (
    <Modal open onClose={onClose} title="Delete user" size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[#5b6480]">
          Permanently delete <strong className="text-[#001353]">{user.fullName}</strong> ({user.email})? This cannot be undone.
        </p>
        {formError && <p className="text-sm text-[#d64545]">{formError}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" loading={saving} onClick={remove}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}
