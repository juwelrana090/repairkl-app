import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import OtpContent from "./OtpContent";

export const metadata: Metadata = buildPageMetadata("auth.otp");

export default function OtpPage() {
  return <OtpContent />;
}
