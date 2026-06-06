import type { Metadata } from "next";
import Link from "next/link";
import { generateMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Privacy Policy – RepairKL",
    description: "RepairKL's privacy policy. Learn how we collect, use and protect your personal data.",
    path: "/privacy",
    noIndex: false,
  }),
};

export default function PrivacyPage() {
  const lastUpdated = "June 1, 2025";
  return (
    <>
      <section className="bg-[#1b1d21] pt-36 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black text-white tracking-[-1px] mb-3">Privacy Policy</h1>
          <p className="text-white/50 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <div className="space-y-10 text-[#1b1d21]">
            {[
              { title: "1. Information We Collect", body: "We collect information you provide directly (name, email, phone, address), information generated through your use of our services (booking history, location during service), and information from third parties (payment processors, identity verification services)." },
              { title: "2. How We Use Your Information", body: "We use your data to provide and improve our services, process bookings and payments, connect you with service workers, send service confirmations and updates, and comply with legal obligations. We never sell your personal data to third parties." },
              { title: "3. Data Sharing", body: "We share your information only with service workers assigned to your booking (name, phone, address), payment processors to complete transactions, and regulatory authorities when required by law. All third parties are contractually bound to protect your data." },
              { title: "4. Data Security", body: "We use industry-standard encryption (TLS 1.3) for all data in transit and AES-256 for data at rest. Access to personal data is restricted to authorised personnel only. We conduct regular security audits." },
              { title: "5. Cookies", body: "We use cookies for session management, analytics, and improving your experience. You can control cookie preferences in your browser settings. Disabling cookies may affect some platform functionality." },
              { title: "6. Your Rights", body: "You have the right to access, correct, or delete your personal data at any time. You can export your data or close your account from the app settings. For requests, contact privacy@repairkl.com." },
              { title: "7. Data Retention", body: "We retain your data for as long as your account is active or as needed to provide services. Booking records are kept for 7 years to comply with financial regulations. You may request deletion of non-essential data at any time." },
              { title: "8. Contact", body: "For privacy concerns, email privacy@repairkl.com or write to: RepairKL Data Protection Officer, 45 Kuala Lumpur, Kuala Lumpur 1212, Malaysia." },
            ].map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-black text-[#1b1d21] mb-3">{section.title}</h2>
                <p className="text-[#8f92a1] leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-[#e8e6ea]">
            <Link href="/contact" className="text-[#fd6b22] font-bold hover:underline">Questions? Contact our team →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
