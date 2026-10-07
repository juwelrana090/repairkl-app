// Semantic GA4 events (SEO plan Step 10) — every gtag call in the app goes
// through here so names and params stay consistent. All helpers are no-ops
// until NEXT_PUBLIC_GA_ID is set (see gtag.ts).
import { gtag } from "./gtag";

/** User opened the booking wizard for a service. */
export function trackBookingStart(service: string): void {
  gtag("event", "booking_start", { service });
}

/** Booking POST succeeded. */
export function trackBookingComplete(
  bookingId: string,
  service: string,
  value?: number,
): void {
  gtag("event", "booking_complete", {
    booking_id: bookingId,
    service,
    ...(value !== undefined ? { value, currency: "MYR" } : {}),
  });
}

/** Any WhatsApp link/button was clicked (context says where). */
export function trackWhatsAppClick(context: string): void {
  gtag("event", "whatsapp_click", { context });
}

/** A tel: link was clicked. */
export function trackCallClick(): void {
  gtag("event", "call_click", {});
}

/** Contact form submitted successfully. */
export function trackContactSubmit(subject: string): void {
  gtag("event", "contact_submit", { subject });
}
