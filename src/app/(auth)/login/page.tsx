import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import LoginForm from "./LoginForm";

export const metadata: Metadata = buildPageMetadata("auth.login");

export default function LoginPage() {
  return <LoginForm />;
}
