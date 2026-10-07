import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { Toaster } from "@/components/ui/Toaster";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AnalyticsRouteTracker from "@/components/analytics/AnalyticsRouteTracker";
import { GSC_VERIFICATION, TWITTER_HANDLE } from "@/lib/seo/site";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RepairKL – Trusted Home Appliance Repair in KL",
    template: "%s | RepairKL",
  },
  description:
    "Book professional fridge, washing machine, dryer and air-conditioner repair in Kuala Lumpur. Fast, reliable, affordable.",
  keywords: [
    "appliance repair",
    "fridge repair",
    "washing machine repair",
    "dryer repair",
    "air conditioner service",
    "AC repair",
    "Kuala Lumpur",
    "Malaysia",
    "repairkl",
  ],
  authors: [{ name: "RepairKL" }],
  creator: "RepairKL",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_MY",
    siteName: "RepairKL",
    title: "RepairKL – Trusted Home Appliance Repair in KL",
    description:
      "Fridge, washing machine, dryer and aircond repair in Kuala Lumpur and Selangor by verified technicians.",
    // Default social card: the dynamic image served by the file-convention
    // route in src/app/opengraph-image.tsx
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RepairKL – Appliance Repair in Kuala Lumpur",
    description:
      "Fridge, washing machine, dryer and aircond repair in Kuala Lumpur and Selangor by verified technicians.",
    images: ["/opengraph-image"],
    // Only set when NEXT_PUBLIC_TWITTER_HANDLE is configured
    ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE } : {}),
  },
  robots: { index: true, follow: true },
  // GSC HTML-tag verification — only emitted when the token env is set
  ...(GSC_VERIFICATION ? { verification: { google: GSC_VERIFICATION } } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-MY" className={`${dmSans.variable}`}>
      <body
        className="min-h-screen bg-white font-[family-name:var(--font-dm-sans)] antialiased"
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
        {/* GA4 — renders nothing in dev or without NEXT_PUBLIC_GA_ID */}
        <GoogleAnalytics />
        <AnalyticsRouteTracker />
      </body>
    </html>
  );
}
