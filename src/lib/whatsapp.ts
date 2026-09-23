// Single source of truth for RepairKL's WhatsApp / phone contact.

export const WHATSAPP_NUMBER = "601174347814"; // international format, digits only
export const PHONE_DISPLAY = "+60 11-7434 7814";
export const PHONE_TEL = "tel:+601174347814";

export const DEFAULT_BOOKING_MESSAGE =
  "Hi RepairKL, I'd like to book an appliance repair.";

/** wa.me link, optionally with a pre-filled message. Used as the href (SEO + no-JS fallback). */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Booking link for a specific service (or a general booking if none given). */
export function bookingLink(service?: string): string {
  return whatsappLink(
    service
      ? `Hi RepairKL, I'd like to book ${service}.`
      : DEFAULT_BOOKING_MESSAGE,
  );
}

/* ------------------------------------------------------------------ */
/* Browser-only helpers below. Only call these from client components  */
/* or event handlers — they touch window / navigator / document.        */
/* ------------------------------------------------------------------ */

type Platform = "android" | "ios" | "inapp" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent || "";
  // Facebook / Instagram / Messenger / LINE in-app browsers block custom schemes
  if (/FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\//i.test(ua)) return "inapp";
  if (/Android/i.test(ua)) return "android";
  const isIpadOs = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || isIpadOs) return "ios";
  return "desktop";
}

/**
 * Opens a WhatsApp chat directly, skipping the wa.me "Continue to chat" page.
 * - Android: intent:// URL → opens WhatsApp / WhatsApp Business directly; Chrome
 *   falls back to wa.me automatically if no WhatsApp app is installed.
 * - iOS: whatsapp:// deep link; falls back to wa.me in the same tab if the app
 *   did not open within 1.5s.
 * - In-app browsers (Facebook/Instagram): wa.me (custom schemes are blocked there).
 * - Desktop: web.whatsapp.com/send in a new tab → opens the chat directly.
 */
export function openWhatsApp(
  message?: string,
  phone: string = WHATSAPP_NUMBER,
): void {
  const digits = phone.replace(/\D/g, "") || WHATSAPP_NUMBER;
  const text = message ? encodeURIComponent(message) : "";
  const textParam = text ? `&text=${text}` : "";
  const waMe = `https://wa.me/${digits}${text ? `?text=${text}` : ""}`;

  switch (detectPlatform()) {
    case "android": {
      const fallback = encodeURIComponent(waMe);
      window.location.href =
        `intent://send?phone=${digits}${textParam}` +
        `#Intent;scheme=whatsapp;S.browser_fallback_url=${fallback};end`;
      return;
    }
    case "ios": {
      let appOpened = false;
      const onHide = () => {
        if (document.hidden) appOpened = true;
      };
      document.addEventListener("visibilitychange", onHide);
      window.addEventListener("pagehide", onHide);
      window.location.href = `whatsapp://send?phone=${digits}${textParam}`;
      window.setTimeout(() => {
        document.removeEventListener("visibilitychange", onHide);
        window.removeEventListener("pagehide", onHide);
        if (!appOpened && !document.hidden) window.location.href = waMe;
      }, 1500);
      return;
    }
    case "inapp": {
      window.location.href = waMe;
      return;
    }
    default: {
      const webUrl = `https://web.whatsapp.com/send?phone=${digits}${textParam}`;
      const win = window.open(webUrl, "_blank", "noopener,noreferrer");
      if (!win) window.location.href = webUrl; // popup blocked → same tab
    }
  }
}

/** Parses a wa.me / api.whatsapp.com URL. Returns null if it isn't a WhatsApp chat link. */
export function parseWhatsAppUrl(
  href: string,
): { phone: string; message?: string } | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  let phone = "";
  if (host === "wa.me") {
    phone = url.pathname.replace(/\D/g, "");
  } else if (host === "api.whatsapp.com" && url.pathname.startsWith("/send")) {
    phone = (url.searchParams.get("phone") || "").replace(/\D/g, "");
  } else {
    return null;
  }
  const message = url.searchParams.get("text") || undefined;
  return { phone: phone || WHATSAPP_NUMBER, message };
}
