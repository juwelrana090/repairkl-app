import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import OnboardingCarousel from "./OnboardingCarousel";

export const metadata: Metadata = buildPageMetadata("onboarding");

export default function OnboardingPage() {
  return <OnboardingCarousel />;
}
