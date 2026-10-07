import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = buildPageMetadata("auth.forgot-password");

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
