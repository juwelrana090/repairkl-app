"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { gtag } from "@/lib/analytics/gtag";

/**
 * App Router doesn't send GA4 page_view on client-side navigation — this
 * fires one whenever the path or query changes. The first render is skipped:
 * gtag.js already sends the automatic initial page_view.
 */
function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const query = searchParams.toString();
    gtag("event", "page_view", {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

/** useSearchParams needs a Suspense boundary so static/ISR pages stay cacheable. */
export default function AnalyticsRouteTracker() {
  return (
    <Suspense fallback={null}>
      <RouteTracker />
    </Suspense>
  );
}
