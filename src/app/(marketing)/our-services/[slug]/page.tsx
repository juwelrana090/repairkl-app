import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  generateMeta,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
  SITE_URL,
} from "@/lib/seo";
import {
  SERVICES,
  SERVICE_AREAS,
  getServiceContent,
} from "@/lib/serviceContent";
import { bookingLink, whatsappLink, PHONE_DISPLAY } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceContent(slug);
  if (!service) return {};
  return generateMeta({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/our-services/${service.slug}`,
    image: `${SITE_URL}${service.asset.image}`,
    keywords: service.keywords,
  });
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceContent(slug);
  if (!service) notFound();

  const url = `${SITE_URL}/our-services/${service.slug}`;
  const related = SERVICES.filter((s) => s.slug !== service.slug);

  const schemas = [
    serviceSchema({
      name: service.name,
      description: service.metaDescription,
      url,
      image: `${SITE_URL}${service.asset.image}`,
      areaServed: SERVICE_AREAS,
    }),
    faqSchema(service.faqs.map((f) => ({ question: f.q, answer: f.a }))),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Our Services", url: "/our-services" },
      { name: service.name, url: `/our-services/${service.slug}` },
    ]),
  ];

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

      {/* ─── HERO ── */}
      <section className="relative pt-36 pb-20 overflow-hidden text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" />
          <Image
            src={service.asset.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001353]/95 via-[#001353]/85 to-[#001353]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-white/60 mb-6"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/our-services"
              className="hover:text-white transition-colors"
            >
              Our Services
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/90">{service.name}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <Image
                  src={service.asset.icon}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </span>
              <span className="text-sm font-semibold text-white/80">
                Kuala Lumpur &amp; Selangor
              </span>
            </div>
            <h1 className="text-[2.4rem] sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.06] mb-6">
              {service.h1}
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-[62ch] mb-9">
              {service.intro}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={bookingLink(service.name.toLowerCase())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold px-7 py-4 rounded-xl shadow-[0_10px_30px_-8px_rgba(3,71,149,0.7)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Book {service.name}
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-bold px-7 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25d366]" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMON PROBLEMS ── */}
      <section
        className="py-12 bg-[#f5f5fa] border-b border-[#ddddee]"
        aria-labelledby="problems-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="problems-heading"
            className="text-xl font-bold text-[#001353] mb-5"
          >
            Common {service.name.toLowerCase()} problems we fix
          </h2>
          <ul className="flex flex-wrap gap-2.5">
            {service.problems.map((p) => (
              <li
                key={p}
                className="inline-flex items-center gap-2 bg-white border border-[#ddddee] rounded-full px-4 py-2 text-sm font-medium text-[#001353]"
              >
                <span className="w-4 h-4 rounded-full bg-[#1a8f5c] text-white flex items-center justify-center shrink-0">
                  <CheckIcon />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── SERVICE SECTIONS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {service.sections.map((section) => (
            <div key={section.title}>
              <div className="max-w-2xl mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#001353] tracking-[-0.025em] leading-[1.15] mb-3">
                  {section.title}
                </h2>
                <p className="text-[#4d5672] text-lg leading-relaxed">
                  {section.intro}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#ddddee] p-6 bg-white"
                  >
                    <h3 className="font-bold text-[#001353] text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[#4d5672] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PROCESS ── */}
      <section className="py-20 bg-[#f5f5fa]" aria-labelledby="process-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="process-heading"
            className="text-3xl sm:text-4xl font-bold text-[#001353] tracking-[-0.025em] leading-[1.15] mb-10 max-w-2xl"
          >
            How our {service.name.toLowerCase()} process works
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {service.process.map((step, i) => (
              <li
                key={step.title}
                className="bg-white rounded-2xl border border-[#ddddee] p-7"
              >
                <span className="inline-flex w-10 h-10 rounded-xl bg-[#034795] text-white font-bold items-center justify-center mb-5">
                  {i + 1}
                </span>
                <h3 className="font-bold text-[#001353] text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-[#4d5672] leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── BRANDS + AREAS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-[#001353] mb-4">
              Brands we repair
            </h2>
            <p className="text-[#4d5672] mb-5">
              Our technicians work on all major brands sold in Malaysia,
              including:
            </p>
            <ul className="flex flex-wrap gap-2">
              {service.brands.map((b) => (
                <li
                  key={b}
                  className="text-sm font-semibold text-[#001353] bg-[#eeeef6] rounded-full px-3.5 py-1.5"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#001353] mb-4">
              Areas we serve
            </h2>
            <p className="text-[#4d5672] mb-5">
              {service.name} across Kuala Lumpur and the Klang Valley,
              including:
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {SERVICE_AREAS.map((a) => (
                <li
                  key={a}
                  className="flex items-center gap-2 text-[#001353] text-sm"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#034795] shrink-0"
                    aria-hidden="true"
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── FAQ ── */}
      <section className="py-20 bg-[#f5f5fa]" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-bold text-[#001353] tracking-[-0.025em] leading-[1.15] mb-8"
          >
            {service.name} FAQs
          </h2>
          <div className="divide-y divide-[#ddddee] border-y border-[#ddddee] bg-white rounded-2xl px-6">
            {service.faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="font-bold text-[#001353] text-lg">{f.q}</h3>
                  <span className="w-8 h-8 rounded-full border border-[#ddddee] text-[#001353] group-open:bg-[#034795] group-open:border-[#034795] group-open:text-white flex items-center justify-center shrink-0 transition-colors text-lg leading-none">
                    <span className="transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="text-[#4d5672] leading-relaxed pb-6 pr-10 max-w-[65ch]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RELATED SERVICES ── */}
      <section className="py-20 bg-white" aria-labelledby="related-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="related-heading"
            className="text-2xl font-bold text-[#001353] mb-6"
          >
            Other services
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/our-services/${r.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#ddddee] hover:border-[#034795] p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]"
                >
                  <Image
                    src={r.asset.icon}
                    alt=""
                    width={36}
                    height={36}
                    className="w-9 h-9 object-contain"
                  />
                  <span className="font-semibold text-[#001353]">{r.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── CTA ── */}
      <section className="py-20 bg-[#001353] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] mb-4">
            Need {service.name.toLowerCase()} today?
          </h2>
          <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
            Message us on WhatsApp with your appliance, the problem and your
            area. We&apos;ll confirm a time slot and send a verified technician.
          </p>
          <a
            href={bookingLink(service.name.toLowerCase())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold px-8 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Book on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
