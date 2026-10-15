"use client";

import { useState } from "react";
import AppIcon from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";
import RedirectsManager, { type RedirectRow } from "./RedirectsManager";

const SECTIONS = [
  { id: "business", label: "Business & NAP", icon: "building" },
  { id: "contact", label: "Contact & Hours", icon: "smartphone" },
  { id: "seo", label: "SEO Integrations", icon: "chart" },
  { id: "social", label: "Social Profiles", icon: "users" },
  { id: "advanced", label: "Advanced", icon: "settings" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface SettingsForm {
  siteName: string;
  tagline: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  latitude: string;
  longitude: string;
  hoursDays: string[];
  hoursOpens: string;
  hoursCloses: string;
  social: { platform: string; url: string }[];
  gaMeasurementId: string;
  gscVerification: string;
  gbpUrl: string;
  gbpReviewUrl: string;
  gbpPlaceId: string;
  twitterHandle: string;
  defaultOgImage: string;
  robotsTxtExtra: string;
}

export default function AdminSettingsClient({
  initial,
  redirects,
}: {
  initial: SettingsForm;
  redirects: RedirectRow[];
}) {
  const [active, setActive] = useState("business");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SettingsForm>(initial);

  const set = (patch: Partial<SettingsForm>) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const lat = form.latitude.trim() ? Number(form.latitude) : null;
      const lng = form.longitude.trim() ? Number(form.longitude) : null;
      if (lat !== null && Number.isNaN(lat)) return showToast("Latitude must be a number", "error");
      if (lng !== null && Number.isNaN(lng)) return showToast("Longitude must be a number", "error");

      const social = form.social
        .map((s) => ({ platform: s.platform.trim(), url: s.url.trim() }))
        .filter((s) => s.platform && s.url);

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: form.siteName,
          tagline: form.tagline || null,
          phone: form.phone,
          phoneDisplay: form.phoneDisplay,
          email: form.email,
          addressLine: form.addressLine || null,
          city: form.city || null,
          region: form.region || null,
          postalCode: form.postalCode || null,
          countryCode: form.countryCode || null,
          latitude: lat,
          longitude: lng,
          openingHours:
            form.hoursDays.length > 0
              ? { days: form.hoursDays, opens: form.hoursOpens, closes: form.hoursCloses }
              : null,
          socialProfiles: social.length > 0 ? social : null,
          gaMeasurementId: form.gaMeasurementId || null,
          gscVerification: form.gscVerification || null,
          gbpUrl: form.gbpUrl || null,
          gbpReviewUrl: form.gbpReviewUrl || null,
          gbpPlaceId: form.gbpPlaceId || null,
          twitterHandle: form.twitterHandle || null,
          defaultOgImage: form.defaultOgImage || null,
          robotsTxtExtra: form.robotsTxtExtra || null,
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        issues?: { path: (string | number)[]; message: string }[];
      };
      if (!res.ok) {
        const detail = body.issues?.[0]
          ? `${body.issues[0].path.join(".") || "field"}: ${body.issues[0].message}`
          : "";
        showToast(body.error === "Invalid payload" && detail ? detail : body.error || "Save failed", "error");
        return;
      }
      showToast("Settings saved", "success");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) =>
    set({
      hoursDays: form.hoursDays.includes(day)
        ? form.hoursDays.filter((d) => d !== day)
        : [...form.hoursDays, day],
    });

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar */}
      <div className="w-48 shrink-0 flex flex-col gap-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={twMerge(
              "flex items-center gap-2 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all text-left",
              active === s.id
                ? "bg-[#eaf0f8] text-[#034795] font-bold"
                : "text-[#5b6480] hover:bg-[#eeeef6]",
            )}
          >
            <AppIcon name={s.icon} className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-[24px] border border-[#ddddee] p-6 max-w-3xl">
        {active === "business" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[#001353] mb-2">Business & NAP</h2>
            <p className="text-xs text-[#5b6480] -mt-3">
              Name, address and phone — this feeds LocalBusiness schema, the footer and Google.
              Keep it identical everywhere.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Site name" value={form.siteName} onChange={(e) => set({ siteName: e.target.value })} />
              <Input label="Tagline" value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </div>
            <Input
              label="Street address"
              value={form.addressLine}
              placeholder="Jalan …"
              onChange={(e) => set({ addressLine: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city} onChange={(e) => set({ city: e.target.value })} />
              <Input label="State / region" value={form.region} onChange={(e) => set({ region: e.target.value })} />
              <Input label="Postal code" value={form.postalCode} onChange={(e) => set({ postalCode: e.target.value })} />
              <Input
                label="Country code"
                value={form.countryCode}
                placeholder="MY"
                maxLength={2}
                onChange={(e) => set({ countryCode: e.target.value })}
              />
              <Input
                label="Latitude"
                value={form.latitude}
                placeholder="3.1390"
                onChange={(e) => set({ latitude: e.target.value })}
              />
              <Input
                label="Longitude"
                value={form.longitude}
                placeholder="101.6869"
                onChange={(e) => set({ longitude: e.target.value })}
              />
            </div>
          </div>
        )}

        {active === "contact" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[#001353] mb-2">Contact & Hours</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone (E.164)"
                value={form.phone}
                hint="+601155804809"
                onChange={(e) => set({ phone: e.target.value })}
              />
              <Input
                label="Phone (display)"
                value={form.phoneDisplay}
                hint="+60 11-5580 4809"
                onChange={(e) => set({ phoneDisplay: e.target.value })}
              />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
            <div>
              <p className="text-xs text-[#5b6480] mb-1.5">Opening days</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 h-9 rounded-[10px] text-xs font-bold border-2 transition-colors ${
                      form.hoursDays.includes(d)
                        ? "border-[#034795] bg-[#eaf0f8] text-[#034795]"
                        : "border-[#ddddee] bg-white text-[#5b6480]"
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Opens"
                type="time"
                value={form.hoursOpens}
                onChange={(e) => set({ hoursOpens: e.target.value })}
              />
              <Input
                label="Closes"
                type="time"
                value={form.hoursCloses}
                onChange={(e) => set({ hoursCloses: e.target.value })}
              />
            </div>
          </div>
        )}

        {active === "seo" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[#001353] mb-2">SEO Integrations</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="GA4 measurement ID"
                value={form.gaMeasurementId}
                placeholder="G-XXXXXXXXXX"
                onChange={(e) => set({ gaMeasurementId: e.target.value })}
              />
              <Input
                label="GSC verification code"
                value={form.gscVerification}
                hint="content= value from the meta tag"
                onChange={(e) => set({ gscVerification: e.target.value })}
              />
              <Input
                label="Google Business Profile URL"
                value={form.gbpUrl}
                placeholder="https://maps.app.goo.gl/…"
                onChange={(e) => set({ gbpUrl: e.target.value })}
              />
              <Input
                label="GBP review URL"
                value={form.gbpReviewUrl}
                placeholder="https://search.google.com/local/writereview…"
                onChange={(e) => set({ gbpReviewUrl: e.target.value })}
              />
              <Input
                label="GBP place ID"
                value={form.gbpPlaceId}
                hint="ChIJ… identifier"
                onChange={(e) => set({ gbpPlaceId: e.target.value })}
              />
              <Input
                label="Twitter / X handle"
                value={form.twitterHandle}
                placeholder="@repairkl"
                onChange={(e) => set({ twitterHandle: e.target.value })}
              />
            </div>
            <Input
              label="Default OG image"
              value={form.defaultOgImage}
              placeholder="/images/og-default.jpg"
              hint="Fallback image for pages without their own OG image"
              onChange={(e) => set({ defaultOgImage: e.target.value })}
            />
          </div>
        )}

        {active === "social" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[#001353] mb-2">Social Profiles</h2>
            <p className="text-xs text-[#5b6480] -mt-3">
              Used for sameAs schema links. Empty rows are ignored.
            </p>
            {form.social.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={s.platform}
                  placeholder="facebook"
                  onChange={(e) => {
                    const social = [...form.social];
                    social[i] = { ...s, platform: e.target.value };
                    set({ social });
                  }}
                  className="w-32 h-10 px-3 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none focus:border-[#034795]"
                />
                <input
                  value={s.url}
                  placeholder="https://facebook.com/repairkl"
                  onChange={(e) => {
                    const social = [...form.social];
                    social[i] = { ...s, url: e.target.value };
                    set({ social });
                  }}
                  className="flex-1 h-10 px-3 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none focus:border-[#034795]"
                />
                <button
                  type="button"
                  onClick={() => set({ social: form.social.filter((_, j) => j !== i) })}
                  className="w-9 h-10 text-[#d64545] text-sm font-bold bg-red-50 rounded-[10px] hover:bg-red-100"
                >
                  <AppIcon name="x" className="w-4 h-4 mx-auto" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set({ social: [...form.social, { platform: "", url: "" }] })}
              className="self-start px-4 h-10 text-sm font-bold text-[#034795] bg-[#eaf0f8] rounded-[12px] hover:bg-[#d5e3f5]"
            >
              + Add profile
            </button>
          </div>
        )}

        {active === "advanced" && (
          <div className="flex flex-col gap-6">
            <h2 className="font-bold text-[#001353]">Advanced</h2>
            <div>
              <p className="text-xs text-[#5b6480] mb-1.5">
                robots.txt extra rules (appended after the generated block)
              </p>
              <textarea
                rows={5}
                value={form.robotsTxtExtra}
                placeholder={"Disallow: /admin\nDisallow: /api"}
                onChange={(e) => set({ robotsTxtExtra: e.target.value })}
                className="w-full border border-[#ddddee] rounded-[12px] px-4 py-3 text-sm text-[#001353] outline-none focus:border-[#034795] font-mono resize-y"
              />
            </div>
            <div className="border-t border-[#ddddee] pt-5">
              <RedirectsManager initial={redirects} />
            </div>
          </div>
        )}

        {active !== "advanced" && (
          <div className="mt-6">
            <Button onClick={handleSave} loading={saving}>
              Save Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
