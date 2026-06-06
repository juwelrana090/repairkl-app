import type { Metadata } from "next";
import Link from "next/link";
import { generateMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Terms of Service – RepairKL",
    description: "RepairKL's Terms of Service. Read our terms and conditions for using the platform as a customer or worker.",
    path: "/terms",
  }),
};

export default function TermsPage() {
  const lastUpdated = "June 1, 2025";
  return (
    <>
      <section className="bg-[#1b1d21] pt-36 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black text-white tracking-[-1px] mb-3">Terms of Service</h1>
          <p className="text-white/50 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-[#1b1d21]">
            {[
              { title: "1. Acceptance of Terms", body: "By creating a RepairKL account or using our services, you agree to these Terms of Service and our Privacy Policy. These terms govern your use of the RepairKL platform, mobile app, and all associated services." },
              { title: "2. Eligibility", body: "You must be at least 18 years old and a resident of Malaysia to use RepairKL. By using the platform, you confirm you meet these requirements and have the legal capacity to enter into binding agreements." },
              { title: "3. Booking & Service Delivery", body: "When you book a service, you enter into a service agreement with RepairKL. We assign a verified professional to complete your service. Services must be accessed and completed in good faith by both parties." },
              { title: "4. Pricing & Payment", body: "All prices displayed are final and inclusive of applicable taxes. Payment is processed after service completion. We reserve the right to adjust pricing with 7 days notice. Disputed charges must be raised within 48 hours of service." },
              { title: "5. Cancellation Policy", body: "Cancellations made 24+ hours before scheduled service are free. Cancellations within 24 hours incur a cancellation fee of up to 25% of the service value. No-shows forfeit 100% of payment." },
              { title: "6. Intellectual Property", body: "All content on the RepairKL platform (logos, text, images, software) is owned by RepairKL and protected by copyright. You may not copy, reproduce or distribute any content without express written permission." },
              { title: "7. Limitation of Liability", body: "While we verify all workers and maintain insurance coverage, RepairKL is not liable for indirect, consequential, or incidental damages arising from service delivery. Our liability is limited to the value of the specific booking." },
              { title: "8. Governing Law", body: "These terms are governed by the laws of Malaysia. Any disputes will be subject to the exclusive jurisdiction of the courts of Kuala Lumpur." },
            ].map((section) => (
              <div key={section.title} className="border-b border-[#e8e6ea] pb-8 last:border-0">
                <h2 className="text-xl font-black text-[#1b1d21] mb-3">{section.title}</h2>
                <p className="text-[#8f92a1] leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/contact" className="text-[#fd6b22] font-bold hover:underline">Questions? Contact our team →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
