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
    default: "Shifty – Your Trusted Home Service App",
    template: "%s | Shifty",
  },
  description:
    "Book professional house shifting, cleaning, plumbing, electrical and more services at your doorstep. Fast, reliable and affordable home services.",
  keywords: [
    "house shifting",
    "home cleaning",
    "plumbing",
    "electrical",
    "home services",
    "shifty",
  ],
  authors: [{ name: "Shifty Inc." }],
  creator: "Shifty Inc.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://shifty.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Shifty",
    title: "Shifty – Your Trusted Home Service App",
    description: "Book trusted home services instantly",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shifty – Home Services",
    description: "Book trusted home services instantly",
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
