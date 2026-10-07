import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = buildPageMetadata("auth.register");

export default function RegisterPage() {
  return <RegisterForm />;
}
