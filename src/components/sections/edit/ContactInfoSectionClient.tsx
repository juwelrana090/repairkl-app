// Client-safe CONTACT_INFO twin for the live preview canvas (§4.3). The
// public section fetches the SiteSetting singleton server-side; the preview
// shell fetches it once and passes this serializable snapshot down, so the
// iframe renders identical markup without prisma in the client bundle.

import { bookingLink, whatsappLink, PHONE_DISPLAY } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { Icon } from "../icons";
import type { ContactInfoProps } from "@/lib/sections/schemas";

/** SiteSetting snapshot precomputed by the preview shell (plain JSON). */
export type ContactSettingsSnapshot = {
  phoneDisplay: string | null;
  email: string | null;
  addressLines: string[];
  hours: { days?: string[]; opens?: string; closes?: string } | null;
  gbpUrl: string | null;
};

export default function ContactInfoSectionClient({
  heading,
  subheading,
  showMap,
  settings,
}: ContactInfoProps & { settings: ContactSettingsSnapshot | null }) {
  const s = settings;
  const hours = s?.hours ?? null;
  const addressLines = s?.addressLines ?? [];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-4">
            {heading}
          </h2>
          {subheading ? (
            <p className="text-[#4d5672] text-lg leading-relaxed">
              {subheading}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#f5f5fa] rounded-3xl border border-[#ddddee] p-7">
            <span className="w-12 h-12 rounded-2xl bg-white text-[#034795] flex items-center justify-center mb-5">
              <Icon name="phone" className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-[#001353] mb-2">Call or WhatsApp</h3>
            <p className="text-[#4d5672] text-[15px] leading-relaxed mb-4">
              Fastest reply during business hours.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#034795] font-bold hover:underline"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {s?.phoneDisplay ?? PHONE_DISPLAY}
              </a>
              <a
                href={bookingLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#001353] font-medium hover:text-[#034795] hover:underline"
              >
                Book a repair
              </a>
            </div>
          </div>

          <div className="bg-[#f5f5fa] rounded-3xl border border-[#ddddee] p-7">
            <span className="w-12 h-12 rounded-2xl bg-white text-[#034795] flex items-center justify-center mb-5">
              <Icon name="pin" className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-[#001353] mb-2">Service area</h3>
            <p className="text-[#4d5672] text-[15px] leading-relaxed mb-4">
              Kuala Lumpur and the Klang Valley.
            </p>
            {addressLines.length > 0 ? (
              <p className="text-[#001353] font-medium leading-relaxed">
                {addressLines.join(", ")}
              </p>
            ) : null}
            {s?.email ? (
              <a
                href={`mailto:${s.email}`}
                className="mt-2 inline-block text-[#034795] font-medium hover:underline"
              >
                {s.email}
              </a>
            ) : null}
          </div>

          <div className="bg-[#f5f5fa] rounded-3xl border border-[#ddddee] p-7">
            <span className="w-12 h-12 rounded-2xl bg-white text-[#034795] flex items-center justify-center mb-5">
              <Icon name="clock" className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-[#001353] mb-2">Opening hours</h3>
            {hours?.days?.length && hours.opens && hours.closes ? (
              <p className="text-[#4d5672] text-[15px] leading-relaxed">
                {hours.days.length === 7
                  ? "Daily"
                  : hours.days.join(", ")}
                <br />
                {hours.opens} – {hours.closes}
              </p>
            ) : (
              <p className="text-[#4d5672] text-[15px] leading-relaxed">
                Message us anytime — we reply during business hours.
              </p>
            )}
            {showMap && s?.gbpUrl ? (
              <a
                href={s.gbpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-[#034795] font-bold hover:underline"
              >
                Find us on Google
                <Icon name="arrow" className="w-4 h-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
