import type { Metadata } from "next";
import AdminSettingsClient from "./AdminSettingsClient";

export const metadata: Metadata = { title: "Settings – Admin" };

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Settings</h1>
        <p className="text-sm text-[#8f92a1] mt-1">Configure your platform settings</p>
      </div>
      <AdminSettingsClient />
    </div>
  );
}
