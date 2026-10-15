"use client";
import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import { callApi } from "../../AdminUsersClient";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import AdminButton from "@/components/admin/ui/Button";
import { AdminCard } from "@/components/admin/ui/Card";
import { AdminInput, AdminLabel, AdminSelect } from "@/components/admin/ui/Field";

type Address = { street: string; city: string; state: string; zipCode: string; country: string };

export type EditableUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isSelf: boolean;
  address: Address;
};

function TextField({ id, label, ...input }: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <AdminLabel htmlFor={id}>{label}</AdminLabel>
      <AdminInput id={id} {...input} />
    </div>
  );
}

export default function EditUserClient({
  user, roleOptions,
}: {
  user: EditableUser; roleOptions: string[];
}) {
  const router = useRouter();

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState<Address>(user.address);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [role, setRole] = useState(user.role);
  const [roleSaving, setRoleSaving] = useState(false);

  const [isActive, setIsActive] = useState(user.isActive);
  const [statusSaving, setStatusSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const setAddressField = (key: keyof Address, value: string) =>
    setAddress((prev) => ({ ...prev, [key]: value }));

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    // Address is all-or-nothing on the server; all blank leaves it unchanged.
    const res = await callApi(`/api/admin/users/${user.id}`, "PATCH", { fullName, email, phone, address });
    setProfileSaving(false);
    if (res.ok) {
      showToast("Profile saved", "success");
      router.refresh();
    } else {
      setProfileError(res.error);
    }
  };

  const saveRole = async () => {
    if (role === user.role) return;
    setRoleSaving(true);
    const res = await callApi(`/api/admin/users/${user.id}/role`, "PATCH", { role });
    setRoleSaving(false);
    if (res.ok) {
      showToast(`Role changed to ${role}`, "success");
      router.refresh();
    } else {
      showToast(res.error, "error");
      setRole(user.role);
    }
  };

  const toggleActive = async () => {
    setStatusSaving(true);
    const res = await callApi(`/api/admin/users/${user.id}/toggle-active`, "POST", { isActive: !isActive });
    setStatusSaving(false);
    if (res.ok) {
      setIsActive(!isActive);
      showToast(`User ${isActive ? "deactivated" : "activated"}`, "success");
      router.refresh();
    } else {
      showToast(res.error, "error");
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    const res = await callApi(`/api/admin/users/${user.id}/password`, "POST", {
      password: newPassword,
      ...(user.isSelf ? { currentPassword } : {}),
    });
    setPasswordSaving(false);
    if (res.ok) {
      showToast("Password updated", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordError(res.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit user"
        description={`${user.fullName} · ${user.isSelf ? "your own account" : user.role}`}
        breadcrumbs={[
          { label: "Users", href: "/admin/users" },
          { label: user.fullName, href: `/admin/users/${user.id}` },
          { label: "Edit" },
        ]}
      />

      <form onSubmit={saveProfile} className="flex flex-col gap-6">
        <AdminCard title="Profile">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="edit-full-name" label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <TextField id="edit-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField id="edit-phone" label="Phone (e.g. +60123456789)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
        </AdminCard>

        <AdminCard title="Address" desc="Fill in every field or leave all of them empty.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField id="edit-street" label="Street" value={address.street} onChange={(e) => setAddressField("street", e.target.value)} />
            </div>
            <TextField id="edit-city" label="City" value={address.city} onChange={(e) => setAddressField("city", e.target.value)} />
            <TextField id="edit-state" label="State" value={address.state} onChange={(e) => setAddressField("state", e.target.value)} />
            <TextField id="edit-postcode" label="Postcode" value={address.zipCode} onChange={(e) => setAddressField("zipCode", e.target.value)} />
            <TextField id="edit-country" label="Country" value={address.country} onChange={(e) => setAddressField("country", e.target.value)} />
          </div>
        </AdminCard>

        {profileError && <p className="text-sm text-[#f04438]">{profileError}</p>}
        <div className="flex justify-end">
          <AdminButton type="submit" disabled={profileSaving}>
            {profileSaving ? "Saving…" : "Save profile"}
          </AdminButton>
        </div>
      </form>

      {roleOptions.length > 1 && (
        <AdminCard title="Role">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <AdminLabel htmlFor="edit-role">Role</AdminLabel>
              <AdminSelect id="edit-role" value={role} disabled={roleSaving} onChange={(e) => setRole(e.target.value)}>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </AdminSelect>
            </div>
            <AdminButton
              type="button"
              variant="outline"
              disabled={roleSaving || role === user.role}
              onClick={saveRole}
            >
              {roleSaving ? "Changing…" : "Change role"}
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {!user.isSelf && (
        <AdminCard title="Account status">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#5b6480]">
              This account is currently{" "}
              <span className={isActive ? "font-medium text-[#1a8f5c]" : "font-medium text-[#d92d20]"}>
                {isActive ? "active" : "inactive"}
              </span>
              . Inactive users cannot sign in.
            </p>
            <AdminButton type="button" variant="outline" disabled={statusSaving} onClick={toggleActive}>
              {statusSaving ? "Saving…" : isActive ? "Deactivate" : "Activate"}
            </AdminButton>
          </div>
        </AdminCard>
      )}

      <form onSubmit={changePassword} className="flex flex-col gap-6">
        <AdminCard title={user.isSelf ? "Change your password" : "Reset password"}>
          <div className="grid gap-5 sm:grid-cols-2">
            {user.isSelf && (
              <div className="sm:col-span-2">
                <TextField id="edit-current-password" label="Current password" type="password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
            )}
            <TextField id="edit-new-password" label="New password (min 8 characters)" type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} required />
            <TextField id="edit-confirm-password" label="Confirm new password" type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
        </AdminCard>
        {passwordError && <p className="text-sm text-[#f04438]">{passwordError}</p>}
        <div className="flex justify-end">
          <AdminButton type="submit" disabled={passwordSaving}>
            {passwordSaving ? "Updating…" : "Update password"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
