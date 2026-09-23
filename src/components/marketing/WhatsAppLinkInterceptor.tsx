"use client";

import { useEffect } from "react";
import { openWhatsApp, parseWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Mounted once on every public page (inside PublicFooter).
 * Intercepts clicks on any <a href="https://wa.me/..."> anywhere on the page
 * and opens WhatsApp directly instead of going through the wa.me landing page.
 * The original href stays in the HTML for SEO and as the no-JS fallback.
 */
export default function WhatsAppLinkInterceptor() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const parsed = parseWhatsAppUrl(anchor.href);
      if (!parsed) return;

      e.preventDefault();
      openWhatsApp(parsed.message, parsed.phone);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
