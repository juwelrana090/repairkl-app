"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

const SECTIONS = [
  { id: "general", label: "General", icon: "⚙️" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "payment", label: "Payment", icon: "💳" },
  { id: "security", label: "Security", icon: "🔒" },
];

export default function AdminSettingsClient() {
  const [active, setActive] = useState("general");
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState({
    appName: "Shifty", supportEmail: "support@shifty.com",
    supportPhone: "+8801711000000", taxRate: "5",
    workerCommission: "70", minBookingHours: "24",
    currency: "BDT", timezone: "Asia/Dhaka",
  });

  const [notif, setNotif] = useState({
    emailOnBooking: true, smsOnBooking: true,
    emailOnComplete: true, smsOnComplete: false,
    emailOnReview: true, pushEnabled: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    showToast("Settings saved! ✅", "success");
  };

  const setG = (k: keyof typeof general) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setGeneral({ ...general, [k]: e.target.value });

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-48 shrink-0 flex flex-col gap-1">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={twMerge("flex items-center gap-2 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all text-left",
              active === s.id ? "bg-[#fff0e8] text-[#fd6b22] font-bold" : "text-[#8f92a1] hover:bg-[#f3f6f8]"
            )}>
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-[24px] border border-[#e8e6ea] p-6">
        {active === "general" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[#1b1d21] mb-2">General Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="App Name" value={general.appName} onChange={setG("appName")} />
              <Input label="Support Email" type="email" value={general.supportEmail} onChange={setG("supportEmail")} />
              <Input label="Support Phone" value={general.supportPhone} onChange={setG("supportPhone")} />
              <Input label="Tax Rate (%)" type="number" value={general.taxRate} onChange={setG("taxRate")} />
              <Input label="Worker Commission (%)" type="number" value={general.workerCommission} onChange={setG("workerCommission")} />
              <Input label="Min Advance Booking (hrs)" type="number" value={general.minBookingHours} onChange={setG("minBookingHours")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#8f92a1] mb-1">Currency</p>
                <select value={general.currency} onChange={setG("currency")} className="w-full h-14 border-2 border-[#e6e8ec] rounded-[16px] px-4 text-sm outline-none">
                  <option value="BDT">BDT (Bangladeshi Taka)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-[#8f92a1] mb-1">Timezone</p>
                <select value={general.timezone} onChange={setG("timezone")} className="w-full h-14 border-2 border-[#e6e8ec] rounded-[16px] px-4 text-sm outline-none">
                  <option value="Asia/Dhaka">Asia/Dhaka (UTC+6)</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {active === "notifications" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[#1b1d21] mb-2">Notification Settings</h2>
            {[
              { key: "emailOnBooking", label: "Email on new booking" },
              { key: "smsOnBooking", label: "SMS on new booking" },
              { key: "emailOnComplete", label: "Email when job completed" },
              { key: "smsOnComplete", label: "SMS when job completed" },
              { key: "emailOnReview", label: "Email on new review" },
              { key: "pushEnabled", label: "Push notifications" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#e8e6ea] last:border-0">
                <span className="text-sm font-medium text-[#1b1d21]">{item.label}</span>
                <button
                  onClick={() => setNotif({ ...notif, [item.key]: !notif[item.key as keyof typeof notif] })}
                  className={twMerge("w-12 h-6 rounded-full transition-all relative", notif[item.key as keyof typeof notif] ? "bg-[#4fbf67]" : "bg-[#d9d9d9]")}
                >
                  <span className={twMerge("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", notif[item.key as keyof typeof notif] ? "translate-x-6" : "translate-x-0.5")} />
                </button>
              </div>
            ))}
          </div>
        )}

        {active === "payment" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[#1b1d21] mb-2">Payment Settings</h2>
            <div className="bg-[#f9fafb] rounded-[16px] p-4">
              <p className="text-sm font-bold text-[#1b1d21] mb-1">Payment Gateways</p>
              <p className="text-xs text-[#8f92a1]">Configure SSLCommerz, bKash, Nagad, and card payment integrations in your .env file.</p>
            </div>
            <Input label="SSLCommerz Store ID" placeholder="Configure in .env" disabled />
            <Input label="bKash App Key" placeholder="Configure in .env" disabled />
            <Input label="Nagad Merchant ID" placeholder="Configure in .env" disabled />
          </div>
        )}

        {active === "security" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[#1b1d21] mb-2">Security Settings</h2>
            <div className="bg-[#f9fafb] rounded-[16px] p-4">
              <p className="text-sm font-bold text-[#1b1d21] mb-1">JWT Configuration</p>
              <p className="text-xs text-[#8f92a1]">JWT secret is configured via the JWT_SECRET environment variable. Minimum 32 characters recommended.</p>
            </div>
            <Input label="Session Duration" value="30 days" disabled />
            <Input label="OTP Expiry" value="15 minutes" disabled />
            <Input label="Max Login Attempts" value="5" disabled />
          </div>
        )}

        <div className="mt-6">
          <Button onClick={handleSave} loading={saving}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
