"use client";
import AppIcon from "@/components/ui/AppIcon";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, StatusBadge, showToast } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { twMerge } from "tailwind-merge";
import { ALL_ROLES, canChangeUserRole } from "@/lib/auth/roleHierarchy";

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

const ROLES = ["ALL", ...ALL_ROLES];

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
      {/* Controls */}
      <div className="bg-white rounded-[20px] border border-[#ddddee] p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button key={r} onClick={() => applyFilter(r, searchQ)}
              className={twMerge("px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                (activeRole ?? "ALL") === r ? "border-[#034795] text-[#034795] bg-[#eaf0f8]" : "border-[#ddddee] text-[#5b6480]"
              )}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {createRoles.length > 0 && (
            <button onClick={() => setModal({ kind: "create" })}
              className="h-9 px-4 bg-[#fb6f27] text-white rounded-[10px] text-sm font-bold">
              Add user
            </button>
          )}
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilter(activeRole, searchQ)}
            placeholder="Search users..."
            className="h-9 px-4 border border-[#ddddee] rounded-[10px] text-sm outline-none focus:border-[#034795] w-48"
          />
          <button onClick={() => applyFilter(activeRole, searchQ)} className="h-9 px-4 bg-[#034795] text-white rounded-[10px] text-sm font-bold">
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-[#ddddee] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f5fa] border-b border-[#ddddee]">
              <tr>
                {["User", "Contact", "Role", "Bookings", "Location", "Verified", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5b6480] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddddee]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#f5f5fa] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#eaf0f8] flex items-center justify-center text-xs font-bold text-[#034795] shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/admin/users/${u.id}`} className="text-sm font-medium text-[#001353] hover:text-[#034795] hover:underline">
                          {u.fullName}
                        </Link>
                        <p className="text-xs text-[#5b6480]">{new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#5b6480]">{u.email}</p>
                    <p className="text-xs text-[#5b6480]">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {canManageRoles && roleOptionsFor(u).length > 1 ? (
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className="h-8 px-2 border border-[#ddddee] rounded-[8px] text-xs font-bold text-[#001353] outline-none focus:border-[#034795]"
                      >
                        {roleOptionsFor(u).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={u.role} />
                    )}
                    {u.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.permissions.map((p) => (
                          <span key={p} className="text-[10px] font-bold bg-[#eaf0f8] text-[#034795] px-1.5 py-0.5 rounded">{p}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-[#001353]">{u.bookingCount}</td>
                  <td className="px-4 py-3 text-sm text-[#5b6480]">{u.city}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.isEmailVerified && <span title="Email" className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold inline-flex items-center"><AppIcon name="mail" className="w-3 h-3" /></span>}
                      {u.isPhoneVerified && <span title="Phone" className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold inline-flex items-center"><AppIcon name="smartphone" className="w-3 h-3" /></span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={twMerge("text-xs font-bold px-2 py-1 rounded-full", u.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500")}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {u.canEdit && (
                        <Link href={`/admin/users/${u.id}/edit`}
                          className="text-xs px-2 py-1 rounded bg-[#eaf0f8] text-[#034795] hover:bg-[#dbe6f4] font-medium">
                          Edit
                        </Link>
                      )}
                      {u.canEdit && (
                        <button onClick={() => setModal({ kind: "password", user: u })}
                          className="text-xs px-2 py-1 rounded bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee] font-medium">
                          Password
                        </button>
                      )}
                      {u.canEdit && !u.isSelf && (
                        <button onClick={() => toggleActive(u.id, u.isActive)}
                          className="text-xs px-2 py-1 rounded bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee] font-medium">
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      {u.canEdit && !u.isSelf && (
                        <button onClick={() => setModal({ kind: "delete", user: u })}
                          className="text-xs px-2 py-1 rounded bg-red-50 text-[#d64545] hover:bg-red-100 font-medium">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-4 border-t border-[#ddddee] flex items-center justify-between text-sm">
          <p className="text-[#5b6480]">Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button key={p} onClick={() => { const params = new URLSearchParams(); if (activeRole) params.set("role", activeRole); params.set("page", String(p)); router.push(`/admin/users?${params}`); }}
                  className={twMerge("w-8 h-8 rounded-lg text-xs font-bold",
                    p === page ? "bg-[#034795] text-white" : "bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee]"
                  )}>
                  {p}
                </button>
              ))}
          </div>
        </div>
      </div>

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
