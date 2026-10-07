import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import ResetPasswordContent from "./ResetPasswordContent";

export const metadata: Metadata = buildPageMetadata("auth.reset-password");

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
