"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { callApi } from "../../AdminUsersClient";

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

  const sectionCls = "bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-5";
  const headingCls = "text-lg font-bold text-[#001353]";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Edit user</h1>
        <p className="text-sm text-[#5b6480] mt-1">
          {user.fullName} · {user.isSelf ? "your own account" : user.role}
        </p>
      </div>

      <form onSubmit={saveProfile} className="flex flex-col gap-6">
        <section className={sectionCls}>
          <h2 className={headingCls}>Profile</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Phone (e.g. +60123456789)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
        </section>

        <section className={sectionCls}>
          <div>
            <h2 className={headingCls}>Address</h2>
            <p className="text-xs text-[#5b6480] mt-1">
              Fill in every field or leave all of them empty.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Street" value={address.street} onChange={(e) => setAddressField("street", e.target.value)} />
            </div>
            <Input label="City" value={address.city} onChange={(e) => setAddressField("city", e.target.value)} />
            <Input label="State" value={address.state} onChange={(e) => setAddressField("state", e.target.value)} />
            <Input label="Postcode" value={address.zipCode} onChange={(e) => setAddressField("zipCode", e.target.value)} />
            <Input label="Country" value={address.country} onChange={(e) => setAddressField("country", e.target.value)} />
          </div>
        </section>

        {profileError && <p className="text-sm text-[#d64545]">{profileError}</p>}
        <div className="flex justify-end">
          <Button type="submit" loading={profileSaving}>Save profile</Button>
        </div>
      </form>

      {roleOptions.length > 1 && (
        <section className={sectionCls}>
          <h2 className={headingCls}>Role</h2>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-bold text-[#5b6480]">Role</label>
              <select
                value={role}
                disabled={roleSaving}
                onChange={(e) => setRole(e.target.value)}
                className="h-12 px-4 border border-[#ddddee] rounded-[16px] text-sm font-bold text-[#001353] outline-none focus:border-[#034795]"
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <Button type="button" variant="secondary" loading={roleSaving} disabled={role === user.role} onClick={saveRole}>
              Change role
            </Button>
          </div>
        </section>
      )}

      {!user.isSelf && (
        <section className={sectionCls}>
          <h2 className={headingCls}>Account status</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-[#5b6480]">
              This account is currently{" "}
              <span className={isActive ? "font-bold text-green-600" : "font-bold text-red-500"}>
                {isActive ? "active" : "inactive"}
              </span>
              . Inactive users cannot sign in.
            </p>
            <Button type="button" variant="secondary" loading={statusSaving} onClick={toggleActive}>
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </section>
      )}

      <form onSubmit={changePassword} className={sectionCls}>
        <h2 className={headingCls}>{user.isSelf ? "Change your password" : "Reset password"}</h2>
        {user.isSelf && (
          <Input label="Current password" type="password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} required />
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="New password (min 8 characters)" type="password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Confirm new password" type="password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        {passwordError && <p className="text-sm text-[#d64545]">{passwordError}</p>}
        <div className="flex justify-end">
          <Button type="submit" loading={passwordSaving}>Update password</Button>
        </div>
      </form>
    </div>
  );
}
