import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { Toaster } from "@/components/ui/Toaster";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com"),
  openGraph: {
    type: "website",
    locale: "en_MY",
    siteName: "RepairKL",
    title: "RepairKL – Trusted Home Appliance Repair in KL",
    description: "Book professional appliance repair services instantly",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RepairKL – Appliance Repair",
    description: "Book professional appliance repair services instantly",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <body
        className="min-h-screen bg-white font-[family-name:var(--font-dm-sans)] antialiased"
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
