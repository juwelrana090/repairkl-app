import Script from "next/script";
import { GA_ID } from "@/lib/analytics/gtag";

/**
 * GA4 script pair (SEO plan Step 10). Renders nothing unless
 * NEXT_PUBLIC_GA_ID is set AND this is a production build — dev traffic
 * never reaches GA. Consent Mode v2 defaults to DENIED, so no cookies are
 * stored until grantAnalyticsConsent() is called (cookie banner, later).
 */
export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
