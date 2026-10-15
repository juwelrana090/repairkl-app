"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast, StatusBadge } from "@/components/ui";
import { callApi, DeleteModal } from "../AdminUsersClient";

export type RoleRow = { role: string; userCount: number; defaults: string[] };
export type GrantUser = { id: string; fullName: string; email: string; role: string; isSelf: boolean; grants: string[] };

export default function RolesClient({
  roles, permissionKeys, users, canGrant,
}: {
  roles: RoleRow[]; permissionKeys: string[]; users: GrantUser[]; canGrant: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<GrantUser | null>(null);

  const defaultsFor = (role: string) => roles.find((r) => r.role === role)?.defaults ?? [];

  const toggleGrant = async (user: GrantUser, permission: string) => {
    const has = user.grants.includes(permission);
    const key = `${user.id}:${permission}`;
    setPending(key);
    const res = await callApi(`/api/admin/users/${user.id}/permissions`, "POST", {
      permission,
      granted: !has,
    });
    setPending(null);
    if (res.ok) {
      showToast(`${permission} ${has ? "revoked" : "granted"} for ${user.fullName}`, "success");
      router.refresh();
    } else {
      showToast(res.error, "error");
    }
  };

  const cardCls = "bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-4";

  return (
    <div className="flex flex-col gap-6">
      {/* Role defaults */}
      <section className={cardCls}>
        <h2 className="text-lg font-bold text-[#001353]">Role defaults</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-[#5b6480] uppercase tracking-wide">
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Users</th>
                {permissionKeys.map((p) => (
                  <th key={p} className="py-2 pr-4 font-mono normal-case">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.role} className="border-t border-[#ddddee]">
                  <td className="py-3 pr-4"><StatusBadge status={r.role} /></td>
                  <td className="py-3 pr-4 text-[#5b6480]">{r.userCount}</td>
                  {permissionKeys.map((p) => (
                    <td key={p} className="py-3 pr-4 text-[#001353]">
                      {r.defaults.includes(p) ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#5b6480]">
          SUPER_ADMIN holds every permission and cannot lose rules:manage. ADMIN does not hold rules:manage by default; it must be granted below.
        </p>
      </section>

      {/* Per-user grants */}
      <section className={cardCls}>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-[#001353]">User grants</h2>
          <p className="text-xs text-[#5b6480]">
            {canGrant
              ? "Tick a box to grant a permission to that user. Ticked boxes marked “default” come from the role and cannot be changed here."
              : "Read-only. Only SUPER_ADMIN can grant or revoke permissions."}
          </p>
        </div>
        {users.length === 0 ? (
          <p className="text-sm text-[#5b6480]">No admin-tier, EDITOR, or granted users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-[#5b6480] uppercase tracking-wide">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Role</th>
                  {permissionKeys.map((p) => (
                    <th key={p} className="py-2 pr-4 font-mono normal-case">{p}</th>
                  ))}
                  {canGrant && <th className="py-2 pr-4">Action</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const defaults = defaultsFor(u.role);
                  // setPermissionGrant rejects SUPER_ADMIN targets; they already hold everything.
                  const lockedRow = u.role === "SUPER_ADMIN";
                  return (
                    <tr key={u.id} className="border-t border-[#ddddee]">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[#001353]">
                          {u.fullName} {u.isSelf && <span className="text-xs text-[#5b6480]">(you)</span>}
                        </p>
                        <p className="text-xs text-[#5b6480]">{u.email}</p>
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={u.role} /></td>
                      {permissionKeys.map((p) => {
                        const fromRole = defaults.includes(p);
                        const granted = u.grants.includes(p);
                        const key = `${u.id}:${p}`;
                        const disabled = !canGrant || lockedRow || fromRole || pending === key;
                        return (
                          <td key={p} className="py-3 pr-4">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={fromRole || granted}
                                disabled={disabled}
                                onChange={() => toggleGrant(u, p)}
                                className="w-4 h-4 accent-[#034795] disabled:cursor-not-allowed"
                              />
                              {fromRole && <span className="text-[11px] font-bold text-[#5b6480]">default</span>}
                            </label>
                          </td>
                        );
                      })}
                      {canGrant && (
                        <td className="py-3 pr-4">
                          {!u.isSelf && (
                            <button
                              type="button"
                              onClick={() => setDeleting(u)}
                              className="text-xs px-2 py-1 rounded bg-red-50 text-[#d64545] hover:bg-red-100 font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {deleting && (
        <DeleteModal
          user={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => { setDeleting(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
