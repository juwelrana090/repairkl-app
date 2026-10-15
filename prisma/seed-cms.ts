/**
 * CMS seed (SEO plan Step 15) — populates the CMS tables from the code
 * single-sources so the database starts equal to what the hardcoded pages
 * render today:
 *
 *   SiteSetting  ← src/lib/seo/site.ts + whatsapp.ts + social.ts (+ envs)
 *   SeoMeta      ← PAGE_META registry + serviceContent.ts
 *   Page/Section ← every marketing page, section by section
 *   Navigation   ← src/lib/navigation.ts
 *   MediaAsset   ← the marketing images already in use (with real alt text)
 *
 * Idempotent AND non-destructive: every upsert carries an empty `update`,
 * and PageSections are only written when the page has none yet — re-running
 * never clobbers edits made through the admin CMS (Step 16+).
 *
 * Usage: pnpm db:seed:cms
 */
import { Prisma, PrismaClient, SectionType } from "@prisma/client";
import {
  SITE,
  DEFAULT_OG_IMAGE,
  GSC_VERIFICATION,
  GBP_URL,
  GBP_REVIEW_URL,
  GBP_PLACE_ID,
  TWITTER_HANDLE,
} from "../src/lib/seo/site";
import { PAGE_META } from "../src/lib/seo/pageMeta";
import {
  SERVICES,
  SERVICE_AREAS,
  type ServiceContent,
} from "../src/lib/serviceContent";
import { SERVICE_ASSETS } from "../src/lib/brandAssets";
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from "../src/lib/whatsapp";
import { SOCIAL_LINKS } from "../src/lib/social";
import {
  PUBLIC_NAV_LINKS,
  FOOTER_SERVICE_LINKS,
  FOOTER_QUICK_LINKS,
  FOOTER_LEGAL_LINKS,
} from "../src/lib/navigation";

const prisma = new PrismaClient();

// Section props are plain JSON — typed loosely here, validated per type by
// the Zod schemas in src/lib/sections/schemas.ts (Step 17).
type SectionSeed = { type: string; props: Record<string, unknown> };

// ─── SiteSetting ───────────────────────────────────────────────────────────────

async function seedSiteSetting() {
  const existing = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  if (existing) return false; // admin owns it after first seed

  await prisma.siteSetting.create({
    data: {
      id: 1,
      siteName: SITE.name,
      tagline: SITE.tagline,
      phone: `+${WHATSAPP_NUMBER}`,
      phoneDisplay: PHONE_DISPLAY,
      email: SITE.email,
      city: SITE.address.locality,
      region: SITE.address.region,
      postalCode: SITE.address.postalCode,
      countryCode: SITE.address.country,
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
      openingHours: SITE.openingHours,
      socialProfiles: SOCIAL_LINKS.map((s) => ({
        platform: s.name,
        url: s.href,
      })),
      gaMeasurementId: process.env.NEXT_PUBLIC_GA_ID || null,
      gscVerification: GSC_VERIFICATION,
      gbpUrl: GBP_URL,
      gbpReviewUrl: GBP_REVIEW_URL,
      gbpPlaceId: GBP_PLACE_ID,
      twitterHandle: TWITTER_HANDLE,
      defaultOgImage: DEFAULT_OG_IMAGE,
    },
  });
  return true;
}

// ─── SeoMeta ───────────────────────────────────────────────────────────────────

const MARKETING_META_KEYS = [
  "home",
  "our-services",
  "about",
  "faq",
  "contact",
  "privacy",
  "terms",
] as const;

const BREADCRUMB_TITLES: Record<string, string> = {
  home: "Home",
  "our-services": "Our Services",
  about: "About Us",
  faq: "FAQ",
  contact: "Contact",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

async function seedSeoMeta() {
  let count = 0;

  for (const key of MARKETING_META_KEYS) {
    const m = PAGE_META[key];
    const existing = await prisma.seoMeta.findUnique({
      where: { pageKey: key },
    });
    if (existing) continue;
    await prisma.seoMeta.create({
      data: {
        pageKey: key,
        title: m.title!,
        description: m.description ?? null,
        canonical: m.canonical ?? null,
        ...(m.keywords ? { keywords: m.keywords } : {}),
        robots: m.noIndex
          ? { index: false, follow: false }
          : { index: true, follow: true },
        breadcrumbTitle: BREADCRUMB_TITLES[key] ?? null,
      },
    });
    count++;
  }

  // Service detail pages — titles/keywords straight from serviceContent.ts
  for (const s of SERVICES) {
    const pageKey = `our-services/${s.slug}`;
    const existing = await prisma.seoMeta.findUnique({
      where: { pageKey },
    });
    if (existing) continue;
    await prisma.seoMeta.create({
      data: {
        pageKey,
        title: s.metaTitle,
        description: s.metaDescription,
        canonical: `/${pageKey}`,
        keywords: s.keywords,
        breadcrumbTitle: s.name,
      },
    });
    count++;
  }

  return count;
}

// ─── Pages + sections ──────────────────────────────────────────────────────────

/**
 * Home page sections — a verbatim transcription of the hardcoded
 * MarketingHome.tsx markup as it rendered before Step 17 made the page
 * DB-driven. Keep the strings identical to the render baselines
 * (`pnpm render:check` diffs the served HTML byte for byte); the section
 * components in src/components/sections render these props through the Zod
 * schemas in src/lib/sections/schemas.ts.
 */
function homeSections(): SectionSeed[] {
  const services = [
    {
      name: "Fridge Repair",
      desc: "Not cooling, leaking or a noisy compressor. Single-door, two-door and side-by-side models.",
      issues: ["Not cooling", "Water leak", "Ice build-up"],
      href: "/our-services/fridge-repair",
    },
    {
      name: "Washing Machine Repair",
      desc: "Front and top loaders that won't spin, won't drain or show an error code.",
      issues: ["Not spinning", "Not draining", "Error codes"],
      href: "/our-services/washing-machine-repair",
    },
    {
      name: "Dryer Repair",
      desc: "Dryers that don't heat, overheat or trip the breaker. Same-day slots in most areas.",
      issues: ["No heat", "Overheating", "Tripping"],
      href: "/our-services/dryer-repair",
    },
    {
      name: "Aircond Service",
      desc: "Filter cleaning, chemical wash and gas top-up for wall-mounted and cassette units.",
      issues: ["Chemical wash", "Gas top-up", "Water drip"],
      href: "/our-services/aircond-service",
    },
    {
      name: "Aircond Installation",
      desc: "Complete installation with piping, wiring and a full test run. 1.0 HP to 2.5 HP.",
      issues: ["New unit", "Relocation", "Piping"],
      href: "/our-services/aircond-installation",
    },
  ];

  return [
    {
      type: "HERO",
      props: {
        slides: [
          {
            src: "/images/hero/fridge-repairbg.jpg",
            alt: "Fridge repair technician in Kuala Lumpur",
            position: "center right",
          },
          {
            src: "/images/hero/washing-machine-repair.jpg",
            alt: "Washing machine repair service in Kuala Lumpur",
            position: "center right",
          },
          {
            src: "/images/hero/dryer-repair.jpg",
            alt: "Dryer repair technician at work",
            position: "center right",
          },
          {
            src: "/images/hero/air-conditioner-service.jpg",
            alt: "Air conditioner service in Kuala Lumpur",
            position: "center right",
          },
          {
            src: "/images/hero/ac-installation.jpg",
            alt: "Air conditioner installation in Kuala Lumpur",
            position: "center right",
          },
        ],
        interval: 6000,
        badge: "Serving Kuala Lumpur & Selangor",
        heading:
          "Appliance repair in Kuala Lumpur, done right the first time.",
        subheading:
          "Certified technicians for fridges, washing machines, dryers and airconds. You get a clear quote before any work starts, and every repair is covered by a labour warranty.",
        primaryCta: { label: "Book a repair", kind: "booking" },
        secondaryCta: { label: PHONE_DISPLAY, kind: "whatsapp" },
        rating: { value: "4.9", label: "average rating" },
        trustItems: [
          { icon: "shield", text: "Warranty on every repair" },
          { icon: "clock", text: "Same-day slots" },
        ],
        quickPicker: {
          title: "What needs fixing?",
          subtitle: "Pick an appliance to see common faults and book a slot.",
          items: services.map((s) => ({ name: s.name, href: s.href })),
          footerLabel: "Not sure? Describe the problem",
          footerHighlight: "WhatsApp us",
        },
        brands: {
          label: "We repair all major brands",
          items: [
            { name: "Samsung", logo: "/images/brands/samsung.webp", width: 589 },
            { name: "LG", logo: "/images/brands/lg.webp", width: 218, tall: true },
            { name: "Panasonic", logo: "/images/brands/panasonic.webp", width: 618 },
            { name: "Sharp", logo: "/images/brands/sharp.webp", width: 654 },
            { name: "Daikin", logo: "/images/brands/daikin.webp", width: 438 },
            { name: "Mitsubishi", logo: "/images/brands/mitsubishi.webp", width: 582 },
            { name: "Hitachi", logo: "/images/brands/hitachi.webp", width: 543 },
            { name: "Toshiba", logo: "/images/brands/toshiba.webp", width: 568 },
          ],
        },
      },
    },
    {
      type: "SERVICE_GRID",
      props: {
        anchorId: "services",
        heading: "Five services, one standard of work.",
        subheading:
          "Every job starts with a diagnosis and a written quote. Nothing is replaced without your approval.",
        viewAll: { label: "View all services", href: "/our-services" },
        services,
      },
    },
    {
      type: "IMAGE_TEXT",
      props: {
        image: "/images/about-technician.jpg",
        imageCaption: {
          kicker: "Serving the Klang Valley since 2021",
          heading: "Technicians who treat your home like their own.",
        },
        badgeCard: {
          icon: "shield",
          title: "Insured & verified",
          subtitle: "Every technician, every job",
        },
        heading: "A repair service you can actually rely on.",
        paragraphs: [
          "RepairKL started with one goal: make it simple for families in Malaysia to get appliances fixed properly, by people they can trust, at a price agreed upfront.",
          "We handle scheduling, payment and quality checks, so you only need to be home when the technician arrives.",
        ],
        checklist: [
          "Trained, verified and insured technicians",
          "Track your job from booking to completion",
          "Written quote before any work begins",
          "Labour warranty on every repair",
        ],
        cta: { label: "Read our story", href: "/about", kind: "link" },
      },
    },
    {
      type: "STATS",
      props: {
        image: "/images/services/stats-bg.jpg",
        stats: [
          { value: "10K+", label: "Repairs completed", live: "bookings" },
          { value: "50+", label: "Verified technicians", live: "workers" },
          { value: "4.9", label: "Average customer rating" },
          { value: "1 month", label: "Minimum labour warranty" },
        ],
      },
    },
    {
      type: "TIMELINE",
      props: {
        variant: "steps",
        heading: "From booking to fixed in three steps.",
        subheading: "No phone tag, no guessing when someone will turn up.",
        steps: [
          {
            icon: "calendar",
            title: "Book a time slot",
            desc: "Choose your appliance, describe the problem and pick a slot. It takes about two minutes.",
          },
          {
            icon: "userCheck",
            title: "A technician visits",
            desc: "A verified technician arrives on time with tools and common parts, then quotes before starting.",
          },
          {
            icon: "shield",
            title: "Fixed, with warranty",
            desc: "The repair is tested in front of you and covered by a labour warranty. Pay when it's done.",
          },
        ],
      },
    },
    {
      type: "VALUES",
      props: {
        heading: "Why households in KL choose RepairKL.",
        subheading:
          "From the first booking to after-service support, every step is built to be clear and predictable.",
        quote: {
          text: "I used to dread calling repair shops. Now I book, get a quote, and it's fixed. The technicians are professional and the prices are fair.",
          author: "Sarah Tan",
          role: "Homeowner, Cheras",
        },
        features: [
          {
            icon: "userCheck",
            title: "Verified technicians",
            desc: "Every technician is background-checked, trained and insured before their first job.",
          },
          {
            icon: "tag",
            title: "Quote before work starts",
            desc: "You approve the full price after diagnosis. No hidden charges added at the end.",
          },
          {
            icon: "shield",
            title: "Labour warranty",
            desc: "If the same fault returns within the warranty period, we fix it again at no cost.",
          },
          {
            icon: "phone",
            title: "Support that answers",
            desc: "Reach our team by chat, phone or email while your job is in progress.",
          },
          {
            icon: "zap",
            title: "Same-day slots",
            desc: "Book before 12pm for same-day service in most parts of the Klang Valley.",
          },
          {
            icon: "card",
            title: "Pay your way",
            desc: "FPX online banking, Touch 'n Go eWallet, credit or debit card, or cash.",
          },
        ],
      },
    },
    {
      type: "TESTIMONIALS",
      props: {
        heading: "What our customers say.",
        ratingText: "4.9 out of 5",
        testimonials: [
          {
            name: "Aisyah Rahman",
            role: "Mont Kiara",
            text: "Our fridge stopped cooling on a Friday night. The technician came the next morning, replaced the thermostat and it was cold again within an hour.",
            service: "Fridge Repair",
          },
          {
            name: "Daniel Lim",
            role: "Petaling Jaya",
            text: "Clear quote before any work, tidy job, and he explained what went wrong with the drain pump. The washer has run perfectly since.",
            service: "Washing Machine Repair",
          },
          {
            name: "Priya Nair",
            role: "Bangsar",
            text: "Booked a chemical wash for three aircond units. They were on time, covered the furniture and the rooms are noticeably cooler now.",
            service: "Aircond Service",
          },
        ],
      },
    },
    {
      type: "FAQ",
      props: {
        heading: "Common questions",
        intro:
          "Can't find your answer? Our team replies within minutes during business hours.",
        more: { label: "See all FAQs", href: "/faq" },
        faqs: [
          {
            q: "What brands do you service?",
            a: "We service all major brands including Samsung, LG, Panasonic, Sharp, Daikin, Mitsubishi, and more.",
          },
          {
            q: "How is the repair cost decided?",
            a: "Every job starts with a diagnosis. Your technician explains the fault and gives you a full quote to approve before any work begins. Message us on WhatsApp for an estimate.",
          },
          {
            q: "Do you offer a warranty?",
            a: "Yes. All repairs come with a minimum 1-month warranty on labour. Parts carry their own manufacturer warranty.",
          },
          {
            q: "Is same-day service available?",
            a: "Yes, for most areas in Kuala Lumpur. Book before 12pm for same-day slots.",
          },
          {
            q: "What payment methods do you accept?",
            a: "Cash, online banking (FPX), Touch 'n Go eWallet, and credit/debit cards.",
          },
        ],
      },
    },
    {
      type: "CTA",
      props: {
        image: "/images/services/cta-bg.jpg",
        heading: "Something broken? Get it fixed this week.",
        body: "Send us a WhatsApp message with your appliance and the problem, and we'll book a technician for you.",
        primaryCta: { label: "Book a repair", kind: "booking" },
      },
    },
  ];
}

function aboutSections(): SectionSeed[] {
  return [
    {
      type: "HERO",
      props: {
        image: "/images/services/ac-installation.jpg",
        imageAlt:
          "RepairKL technician installing an air conditioner in Kuala Lumpur",
        heading: "We're on a Mission to Make Appliance Repair Simple",
        headingHighlight: "Make Appliance Repair Simple",
        subheading:
          "Since 2021, we've helped households across Kuala Lumpur and Selangor get fridges, washing machines, dryers and airconds fixed properly — by verified technicians, with a clear quote first.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "About Us" },
        ],
        centered: true,
      },
    },
    {
      type: "IMAGE_TEXT",
      props: {
        variant: "story-stats",
        eyebrow: "Our Story",
        heading: "Born Out of Frustration, Built with Purpose",
        paragraphs: [
          "RepairKL was born in 2021 when our founders spent weeks trying to get a broken washing machine fixed in Kuala Lumpur — calling dozens of repair shops, getting different prices every time, and waiting days for technicians who never showed up.",
          "We realised the problem wasn't a lack of skilled workers. Malaysia has hundreds of thousands of capable professionals. The problem was that there was no trusted platform connecting them with customers in a transparent, fair way.",
          "So we built one. Starting with washing machine and fridge repair, we added dryer repair, aircond servicing and aircond installation. Today, thousands of households across the Klang Valley trust RepairKL with their home appliances.",
        ],
        stats: [
          { n: "50K+", l: "Happy Customers", color: "#034795", bg: "#eaf0f8" },
          { n: "500+", l: "Verified Technicians", color: "#1a8f5c", bg: "#e6f5ee" },
          { n: "1,200+", l: "Bookings/Month", color: "#fb6f27", bg: "#fff1e9" },
          { n: "4.9/5", l: "Average Rating", color: "#e0972f", bg: "#fdf5e8" },
        ],
      },
    },
    {
      type: "VALUES",
      props: {
        eyebrow: "What We Stand For",
        heading: "Our Core Values",
        values: [
          {
            icon: "trophy",
            title: "Quality First",
            desc: "We never compromise on the skill of our technicians or the quality of every repair.",
          },
          {
            icon: "handshake",
            title: "Trust & Transparency",
            desc: "Upfront pricing, no hidden fees, honest timelines. Always.",
          },
          {
            icon: "heart",
            title: "Community Impact",
            desc: "We create steady, fairly paid work for skilled appliance technicians across Malaysia.",
          },
          {
            icon: "rocket",
            title: "Continuous Innovation",
            desc: "We keep improving our service based on feedback from customers and technicians alike.",
          },
        ],
      },
    },
    {
      type: "TIMELINE",
      props: {
        eyebrow: "Our Journey",
        heading: "How We Got Here",
        items: [
          {
            year: "2021",
            title: "Founded in Kuala Lumpur",
            desc: "RepairKL launched with a small team of appliance technicians and a simple goal: make appliance repair in KL honest and easy to book.",
          },
          {
            year: "2022",
            title: "1,000 Repairs Completed",
            desc: "We crossed our first major milestone and added aircond servicing and installation to our fridge, washer and dryer repairs.",
          },
          {
            year: "2023",
            title: "Klang Valley Coverage",
            desc: "Expanded from Kuala Lumpur across Selangor with 100+ verified technicians.",
          },
          {
            year: "2024",
            title: "Mobile App Launch",
            desc: "Our React Native app launched on iOS and Android, bringing bookings under 2 minutes.",
          },
          {
            year: "2025",
            title: "50K+ Customers",
            desc: "Reached 50,000 happy customers with a consistent 4.9-star satisfaction rating.",
          },
        ],
      },
    },
    {
      type: "VALUES",
      props: {
        variant: "team",
        eyebrow: "Our People",
        heading: "Meet the Team",
        members: [
          {
            name: "Ahmed Kamal",
            role: "Co-Founder & CEO",
            avatar: "A",
            bg: "#034795",
            bio: "Serial entrepreneur with 10+ years in PropTech and marketplace businesses.",
          },
          {
            name: "Nadia Rahman",
            role: "Co-Founder & COO",
            avatar: "N",
            bg: "#1a8f5c",
            bio: "Operations expert who built RepairKL's worker vetting and quality systems from scratch.",
          },
          {
            name: "Rakib Hassan",
            role: "CTO",
            avatar: "R",
            bg: "#fb6f27",
            bio: "Full-stack engineer and architect of the RepairKL platform and mobile application.",
          },
          {
            name: "Sabina Akter",
            role: "Head of Customer Experience",
            avatar: "S",
            bg: "#001353",
            bio: "Passionate about building systems that make customers feel genuinely cared for.",
          },
        ],
      },
    },
    {
      type: "CTA",
      props: {
        heading: "Ready to Experience the RepairKL Difference?",
        subheading:
          "Book a verified technician for your fridge, washing machine, dryer or aircond on WhatsApp.",
        primaryCta: { label: "Book on WhatsApp", whatsapp: true },
        secondaryCta: { label: "Contact Us", href: "/contact" },
      },
    },
  ];
}

function faqSections(): SectionSeed[] {
  return [
    {
      type: "HERO",
      props: {
        image: "/images/hero/fridge-repairbg.jpg",
        imageAlt: "Fridge repair technician working on a refrigerator",
        heading: "Frequently Asked Questions",
        headingHighlight: "Questions",
        subheading:
          "Everything you need to know about booking fridge, washing machine, dryer and aircond repair with RepairKL.",
        breadcrumbs: [{ label: "Home", href: "/" }, { label: "FAQ" }],
        centered: true,
      },
    },
    {
      type: "FAQ",
      props: {
        variant: "categorized",
        categories: [
          {
            category: "Booking",
            emoji: "calendar",
            faqs: [
              {
                q: "How do I book an appliance repair?",
                a: "Send us a WhatsApp message at +60 11-5580 4809 with your appliance, the problem and your area. We'll confirm a time slot and assign a verified technician. It usually takes just a few minutes.",
              },
              {
                q: "Do you offer same-day appliance repair?",
                a: "Yes, for most areas in Kuala Lumpur and Selangor. Book before 12pm for the best chance of a same-day slot.",
              },
              {
                q: "What details should I send when booking?",
                a: "Tell us the appliance type and brand, the model number if you have it, what the problem is (for example an error code, noise or leak), your area, and your preferred time. A photo or short video helps the technician prepare.",
              },
              {
                q: "Can I reschedule or cancel my booking?",
                a: "Yes. Just message us on WhatsApp as early as possible and we'll move or cancel your appointment.",
              },
            ],
          },
          {
            category: "Repairs & Parts",
            emoji: "wrench",
            faqs: [
              {
                q: "Which appliances do you repair?",
                a: "We repair fridges and freezers, front-load and top-load washing machines, tumble dryers and washer-dryers, and we service, repair and install air-conditioners.",
              },
              {
                q: "Which brands do you repair?",
                a: "All major brands sold in Malaysia, including Samsung, LG, Panasonic, Sharp, Hitachi, Toshiba, Electrolux, Bosch, Daikin, Mitsubishi Electric, York, Midea and more.",
              },
              {
                q: "Do you use genuine parts?",
                a: "We use genuine or quality-compatible replacement parts, and the technician tells you which option is being used before fitting it.",
              },
              {
                q: "How long does a repair take?",
                a: "Many repairs are completed in a single visit, often within one to two hours. If a special part must be ordered, we'll tell you the expected time before we proceed.",
              },
              {
                q: "Is it worth repairing my appliance or should I replace it?",
                a: "After diagnosis, the technician will give you an honest recommendation based on the appliance's age, condition and the repair needed.",
              },
            ],
          },
          {
            category: "Cost & Payment",
            emoji: "creditCard",
            faqs: [
              {
                q: "How is the repair cost decided?",
                a: "Every job starts with a diagnosis. Your technician explains the fault and gives you a full quote to approve before any work begins, so there are no surprise charges.",
              },
              {
                q: "What payment methods do you accept?",
                a: "Cash, online banking (FPX), Touch 'n Go eWallet, and credit or debit cards.",
              },
              {
                q: "When do I pay?",
                a: "You pay after the repair is completed and tested in front of you.",
              },
            ],
          },
          {
            category: "Technicians & Warranty",
            emoji: "shield",
            faqs: [
              {
                q: "Are your technicians verified?",
                a: "Yes. Every technician is background-checked, trained and insured before their first job with RepairKL.",
              },
              {
                q: "Do you offer a warranty on repairs?",
                a: "Yes. All repairs come with a minimum 1-month warranty on labour. Replacement parts carry their own manufacturer warranty.",
              },
              {
                q: "What if the same problem comes back?",
                a: "If the same fault returns within the warranty period, contact us on WhatsApp and we'll send a technician to fix it again at no labour cost.",
              },
              {
                q: "What if something is damaged during the repair?",
                a: "Our technicians are insured. Report any issue to us within 24 hours and we'll resolve it.",
              },
            ],
          },
          {
            category: "Coverage",
            emoji: "pin",
            faqs: [
              {
                q: "Which areas do you cover?",
                a: "We cover Kuala Lumpur and the Klang Valley, including KLCC, Mont Kiara, Bangsar, Cheras, Setapak, Kepong, Ampang, Petaling Jaya, Subang Jaya, Puchong, Shah Alam and Cyberjaya. Message us to confirm your exact location.",
              },
              {
                q: "Are you available on weekends and public holidays?",
                a: "We're open Saturday to Thursday, 8AM to 10PM. Availability on public holidays may be limited, so book early.",
              },
            ],
          },
        ],
      },
    },
    {
      type: "CTA",
      props: {
        icon: "handshake",
        heading: "Still Have Questions?",
        subheading:
          "Our support team is available Sat–Thu 8AM–10PM and can answer any question in minutes.",
        primaryCta: { label: "Contact Support", href: "/contact" },
        secondaryCta: {
          label: "WhatsApp Us",
          whatsapp: "Hi RepairKL, I have a question.",
        },
      },
    },
  ];
}

function contactSections(): SectionSeed[] {
  return [
    {
      type: "HERO",
      props: {
        image: "/images/services/air-conditioner-service.jpg",
        imageAlt: "Air conditioner service technician in Kuala Lumpur",
        heading: "We'd Love to Hear from You",
        headingHighlight: "Hear from You",
        subheading:
          "Questions, feedback, partnership enquiries, or just need help booking — our team is always here.",
        breadcrumbs: [{ label: "Home", href: "/" }, { label: "Contact" }],
        centered: true,
      },
    },
    {
      type: "CONTACT_INFO",
      props: {
        cards: [
          {
            icon: "/images/icons/message.png",
            title: "Email Us",
            value: "hello@repairkl.com",
            subtitle: "We reply within 2 business hours",
            href: "mailto:hello@repairkl.com",
            color: "#034795",
            bg: "#eaf0f8",
          },
          {
            icon: "/images/icons/mobile.png",
            title: "Call Us",
            value: "+60 11-5580 4809",
            subtitle: "Sat–Thu, 8AM–10PM",
            href: "tel:+601155804809",
            color: "#1a8f5c",
            bg: "#e6f5ee",
          },
          {
            icon: "/images/icons/whatsapp.png",
            title: "WhatsApp",
            value: "+60 11-5580 4809",
            subtitle: "Instant replies 8AM–10PM",
            href: "https://wa.me/601155804809",
            color: "#25d366",
            bg: "#e6f5ee",
          },
          {
            icon: "/images/icons/pin.png",
            title: "Visit Us",
            value: "45 Kuala Lumpur, Kuala Lumpur 1212",
            subtitle: "By appointment only",
            href: "https://maps.google.com",
            color: "#fb6f27",
            bg: "#fff1e9",
          },
        ],
      },
    },
    {
      type: "CONTACT_INFO",
      props: {
        variant: "form-map",
        heading: "Send a Message",
        subheading: "We typically respond within 2 business hours.",
        showForm: true,
        showMap: true,
        mapPlaceholder: {
          city: "Kuala Lumpur, Malaysia",
          address: "45 Kuala Lumpur, Kuala Lumpur 1212",
        },
        officeHours: [
          { day: "Saturday – Thursday", hours: "8:00 AM – 10:00 PM" },
          { day: "Friday", hours: "10:00 AM – 6:00 PM" },
          { day: "Emergency Support", hours: "24/7 via app" },
        ],
      },
    },
    {
      type: "CTA",
      props: {
        heading: "Looking for quick help?",
        subheading:
          "Check our FAQ or download the RepairKL app for instant support.",
        primaryCta: { label: "Browse FAQ", href: "/faq", outline: true },
        secondaryCta: { label: "Book on WhatsApp", whatsapp: true },
      },
    },
  ];
}

function ourServicesSections(): SectionSeed[] {
  return [
    {
      type: "HERO",
      props: {
        image: "/images/hero/our-services.webp",
        imageAlt:
          "Home appliance repair services in Kuala Lumpur — fridge, washing machine, dryer and aircond",
        heading: "Five specialist repair services in Kuala Lumpur.",
        subheading:
          "Professional repair for fridges, washing machines, dryers and airconds. All brands, with same-day service available.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Our Services" },
        ],
        centered: true,
        quickNavChips: true,
      },
    },
    {
      type: "VALUES",
      props: {
        variant: "feature-strip",
        features: [
          {
            icon: "/images/icons/verified.png",
            title: "Verified technicians",
            desc: "Every technician is background-checked",
          },
          {
            icon: "/images/icons/wallet.png",
            title: "Quote before work",
            desc: "You approve the quote before work starts",
          },
          {
            icon: "/images/icons/secured.png",
            title: "Fully insured",
            desc: "Covered if anything goes wrong",
          },
          {
            icon: "/images/icons/booking.png",
            title: "Same-day booking",
            desc: "Slots available as soon as today",
          },
        ],
      },
    },
    {
      type: "SERVICE_GRID",
      props: {
        variant: "detailed",
        liveRatings: true,
        categories: [
          {
            slug: "fridge-repair",
            name: "Fridge Repair",
            tagline: "All brands and models",
            desc: "Our certified technicians diagnose and repair all fridge and freezer problems: not cooling, water leaking, ice maker faults and noisy compressors.",
            features: [
              "All brands: Samsung, LG, Panasonic, Sharp, Hisense",
              "Same-day service available",
              "Free diagnosis with repair",
              "1–3 month warranty on repairs",
              "Original and compatible parts available",
            ],
          },
          {
            slug: "washing-machine-repair",
            name: "Washing Machine Repair",
            tagline: "Top load and front load",
            desc: "We fix all washing machine faults, including machines that won't spin or drain, error codes, drum bearing failure and pump replacement.",
            features: [
              "Top load and front load machines",
              "Error code diagnosis",
              "Motor, pump and belt replacement",
              "Same-day slots available",
              "1 month labour warranty",
            ],
          },
          {
            slug: "dryer-repair",
            name: "Dryer Repair",
            tagline: "Fast turnaround",
            desc: "Dryer not heating, not tumbling, overheating or tripping the breaker? Our technicians carry common parts so most repairs are done in one visit.",
            features: [
              "Vented and condenser dryers",
              "Heating element replacement",
              "Thermostat and sensor checks",
              "Belt and drum repair",
              "1 month labour warranty",
            ],
          },
          {
            slug: "aircond-service",
            name: "Air-Conditioner Service",
            tagline: "Chemical wash specialists",
            desc: "Keep your aircond running efficiently with regular servicing: filter cleaning, chemical wash, coil rinse, drain flush and gas top-up for all brands.",
            features: [
              "All brands: Daikin, Mitsubishi, Panasonic, York, Midea",
              "Basic service, chemical wash, chemical overhaul",
              "Gas top-up (R32, R410A, R22)",
              "Condensate drain flush",
              "Genuine parts available",
            ],
          },
          {
            slug: "aircond-installation",
            name: "AC Installation",
            tagline: "Full setup included",
            desc: "Complete air-conditioner installation including wall mounting, copper piping, electrical wiring, drain pipe and a full test run.",
            features: [
              "1HP to 3HP units",
              "Up to 25ft piping included in premium",
              "Electrical wiring and MCB",
              "Drainage and condensate piping",
              "Post-installation test and handover",
            ],
          },
        ],
      },
    },
    {
      type: "CTA",
      props: {
        icon: "/images/icons/booking.png",
        heading: "Not sure which service you need?",
        subheading:
          "Tell us what's wrong with your appliance and we'll match you with the right technician.",
        primaryCta: { label: "Book on WhatsApp", whatsapp: true },
        secondaryCta: { label: "Contact us", href: "/contact" },
      },
    },
  ];
}

function serviceDetailSections(s: ServiceContent): SectionSeed[] {
  const name = s.name;
  const nameLower = name.toLowerCase();
  const sections: SectionSeed[] = [
    {
      type: "HERO",
      props: {
        serviceSlug: s.slug,
        image: s.asset.image,
        imageAlt: s.asset.alt,
        icon: s.asset.icon,
        locationLabel: "Kuala Lumpur & Selangor",
        heading: s.h1,
        subheading: s.intro,
        primaryCta: { label: `Book ${name}`, whatsapp: nameLower },
        secondaryCta: { label: "phone", phone: true },
      },
    },
    {
      type: "RICH_TEXT",
      props: {
        variant: "chips",
        heading: `Common ${nameLower} problems we fix`,
        chips: s.problems,
      },
    },
  ];

  // Content sections — card grids
  for (const section of s.sections) {
    sections.push({
      type: "VALUES",
      props: {
        variant: "cards",
        heading: section.title,
        subheading: section.intro,
        cards: section.items,
      },
    });
  }

  sections.push(
    {
      type: "TIMELINE",
      props: {
        variant: "steps",
        heading: `How our ${nameLower} process works`,
        steps: s.process,
      },
    },
    {
      type: "RICH_TEXT",
      props: {
        variant: "brands-areas",
        brands: {
          heading: "Brands we repair",
          intro: "Our technicians work on all major brands sold in Malaysia, including:",
          items: s.brands,
        },
        areas: {
          heading: "Areas we serve",
          intro: `${name} across Kuala Lumpur and the Klang Valley, including:`,
          items: SERVICE_AREAS,
        },
      },
    },
    {
      type: "FAQ",
      props: {
        heading: `${name} FAQs`,
        faqs: s.faqs,
      },
    },
    {
      type: "SERVICE_GRID",
      props: {
        variant: "related",
        heading: "Other services",
        serviceSlugs: SERVICES.filter((o) => o.slug !== s.slug).map(
          (o) => o.slug,
        ),
      },
    },
    {
      type: "CTA",
      props: {
        heading: `Need ${nameLower} today?`,
        subheading:
          "Message us on WhatsApp with your appliance, the problem and your area. We'll confirm a time slot and send a verified technician.",
        primaryCta: { label: "Book on WhatsApp", whatsapp: nameLower },
      },
    },
  );

  return sections;
}

function privacySections(): SectionSeed[] {
  return [
    {
      type: "HERO",
      props: {
        variant: "compact",
        heading: "Privacy Policy",
        lastUpdated: "June 1, 2025",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ],
      },
    },
    {
      type: "RICH_TEXT",
      props: {
        variant: "legal",
        sections: [
          {
            title: "1. Information We Collect",
            body: "We collect information you provide directly (name, email, phone, address), information generated through your use of our services (booking history, location during service), and information from third parties (payment processors, identity verification services).",
          },
          {
            title: "2. How We Use Your Information",
            body: "We use your data to provide and improve our services, process bookings and payments, connect you with service workers, send service confirmations and updates, and comply with legal obligations. We never sell your personal data to third parties.",
          },
          {
            title: "3. Data Sharing",
            body: "We share your information only with service workers assigned to your booking (name, phone, address), payment processors to complete transactions, and regulatory authorities when required by law. All third parties are contractually bound to protect your data.",
          },
          {
            title: "4. Data Security",
            body: "We use industry-standard encryption (TLS 1.3) for all data in transit and AES-256 for data at rest. Access to personal data is restricted to authorised personnel only. We conduct regular security audits.",
          },
          {
            title: "5. Cookies",
            body: "We use cookies for session management, analytics, and improving your experience. You can control cookie preferences in your browser settings. Disabling cookies may affect some platform functionality.",
          },
          {
            title: "6. Your Rights",
            body: "You have the right to access, correct, or delete your personal data at any time. You can export your data or close your account from the app settings. For requests, contact privacy@repairkl.com.",
          },
          {
            title: "7. Data Retention",
            body: "We retain your data for as long as your account is active or as needed to provide services. Booking records are kept for 7 years to comply with financial regulations. You may request deletion of non-essential data at any time.",
          },
          {
            title: "8. Contact",
            body: "For privacy concerns, email privacy@repairkl.com or write to: RepairKL Data Protection Officer, 45 Kuala Lumpur, Kuala Lumpur 1212, Malaysia.",
          },
        ],
        footerLink: {
          label: "Questions? Contact our team →",
          href: "/contact",
        },
      },
    },
  ];
}

function termsSections(): SectionSeed[] {
  return [
    {
      type: "HERO",
      props: {
        variant: "compact",
        heading: "Terms of Service",
        lastUpdated: "June 1, 2025",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Terms of Service" },
        ],
      },
    },
    {
      type: "RICH_TEXT",
      props: {
        variant: "legal",
        sections: [
          {
            title: "1. Acceptance of Terms",
            body: "By creating a RepairKL account or using our services, you agree to these Terms of Service and our Privacy Policy. These terms govern your use of the RepairKL platform, mobile app, and all associated services.",
          },
          {
            title: "2. Eligibility",
            body: "You must be at least 18 years old and a resident of Malaysia to use RepairKL. By using the platform, you confirm you meet these requirements and have the legal capacity to enter into binding agreements.",
          },
          {
            title: "3. Booking & Service Delivery",
            body: "When you book a service, you enter into a service agreement with RepairKL. We assign a verified professional to complete your service. Services must be accessed and completed in good faith by both parties.",
          },
          {
            title: "4. Pricing & Payment",
            body: "All prices displayed are final and inclusive of applicable taxes. Payment is processed after service completion. We reserve the right to adjust pricing with 7 days notice. Disputed charges must be raised within 48 hours of service.",
          },
          {
            title: "5. Cancellation Policy",
            body: "Cancellations made 24+ hours before scheduled service are free. Cancellations within 24 hours incur a cancellation fee of up to 25% of the service value. No-shows forfeit 100% of payment.",
          },
          {
            title: "6. Intellectual Property",
            body: "All content on the RepairKL platform (logos, text, images, software) is owned by RepairKL and protected by copyright. You may not copy, reproduce or distribute any content without express written permission.",
          },
          {
            title: "7. Limitation of Liability",
            body: "While we verify all workers and maintain insurance coverage, RepairKL is not liable for indirect, consequential, or incidental damages arising from service delivery. Our liability is limited to the value of the specific booking.",
          },
          {
            title: "8. Governing Law",
            body: "These terms are governed by the laws of Malaysia. Any disputes will be subject to the exclusive jurisdiction of the courts of Kuala Lumpur.",
          },
        ],
        footerLink: {
          label: "Questions? Contact our team →",
          href: "/contact",
        },
      },
    },
  ];
}

async function seedPages() {
  type PageSeed = {
    slug: string;
    title: string;
    isProtected?: boolean;
    template?: string;
    sections: SectionSeed[];
  };

  const pages: PageSeed[] = [
    { slug: "home", title: "Home", template: "home", sections: homeSections() },
    {
      slug: "about",
      title: "About Us",
      template: "about",
      sections: aboutSections(),
    },
    { slug: "faq", title: "FAQ", template: "faq", sections: faqSections() },
    {
      slug: "contact",
      title: "Contact",
      template: "contact",
      sections: contactSections(),
    },
    {
      slug: "our-services",
      title: "Our Services",
      template: "services-index",
      sections: ourServicesSections(),
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      isProtected: true,
      template: "legal",
      sections: privacySections(),
    },
    {
      slug: "terms",
      title: "Terms of Service",
      isProtected: true,
      template: "legal",
      sections: termsSections(),
    },
    ...SERVICES.map(
      (s) =>
        ({
          slug: `our-services/${s.slug}`,
          title: s.name,
          template: "service-detail",
          sections: serviceDetailSections(s),
        }) satisfies PageSeed,
    ),
  ];

  const buildSections = (p: PageSeed) =>
    p.sections.map((sec, i) => ({
      order: (i + 1) * 10, // gaps make manual reordering sane
      type: sec.type as SectionType,
      props: sec.props as Prisma.InputJsonObject,
      isVisible: true,
    }));

  let created = 0;
  let refreshed = 0;
  for (const p of pages) {
    // pageKey for the linked SeoMeta row (same identifier space)
    const seoMeta = await prisma.seoMeta.findUnique({
      where: { pageKey: p.slug },
    });

    const existing = await prisma.page.findUnique({ where: { slug: p.slug } });
    if (existing) {
      // The Step 15 seed wrote approximation props for the home page
      // (marked with `quickPicker: true` / `source: "code:SERVICES"`).
      // Step 17 replaced them with the verbatim props above — refresh
      // those rows once, then leave the page alone so admin edits stick.
      if (p.slug === "home" && (await homeNeedsRefresh(existing.id))) {
        await prisma.pageSection.deleteMany({ where: { pageId: existing.id } });
        await prisma.pageSection.createMany({
          data: buildSections(p).map((sec) => ({
            ...sec,
            pageId: existing.id,
          })),
        });
        refreshed++;
        console.log("  home: approximation sections replaced (Step 17)");
      }
      continue; // admin owns it after first seed
    }

    await prisma.page.create({
      data: {
        slug: p.slug,
        title: p.title,
        status: "PUBLISHED",
        template: p.template ?? null,
        isProtected: p.isProtected ?? false,
        publishedAt: new Date(),
        ...(seoMeta ? { seoMetaId: seoMeta.id } : {}),
        sections: { create: buildSections(p) },
      },
    });
    created++;
  }
  return { created, refreshed };
}

/**
 * Detect the Step 15 approximation home sections by their marker props.
 * Any later edit made through the admin CMS removes the markers, so this
 * flips false and the seed stops touching the page.
 */
async function homeNeedsRefresh(pageId: string): Promise<boolean> {
  const sections = await prisma.pageSection.findMany({
    where: { pageId },
    select: { props: true },
  });
  return sections.some((s) => {
    const props = s.props as Record<string, unknown> | null;
    return (
      !!props &&
      (props.quickPicker === true || props.source === "code:SERVICES")
    );
  });
}

// ─── Navigation ────────────────────────────────────────────────────────────────

async function seedNavigation() {
  let count = 0;
  const rows = [
    { location: "HEADER" as const, items: PUBLIC_NAV_LINKS },
    {
      location: "FOOTER" as const,
      items: {
        services: FOOTER_SERVICE_LINKS,
        quick: FOOTER_QUICK_LINKS,
        legal: FOOTER_LEGAL_LINKS,
      },
    },
  ];

  for (const row of rows) {
    const existing = await prisma.navigation.findUnique({
      where: { location: row.location },
    });
    if (existing) continue;
    await prisma.navigation.create({
      data: { location: row.location, items: row.items as unknown as Prisma.InputJsonValue },
    });
    count++;
  }
  return count;
}

// ─── MediaAsset ────────────────────────────────────────────────────────────────

/** Marketing images already referenced by the pages, with their real alt text. */
async function seedMedia() {
  const assets = [
    {
      url: SERVICE_ASSETS.fridge.image,
      alt: SERVICE_ASSETS.fridge.alt,
      focusKeyword: "fridge repair Kuala Lumpur",
    },
    {
      url: SERVICE_ASSETS.washer.image,
      alt: SERVICE_ASSETS.washer.alt,
      focusKeyword: "washing machine repair Kuala Lumpur",
    },
    {
      url: SERVICE_ASSETS.dryer.image,
      alt: SERVICE_ASSETS.dryer.alt,
      focusKeyword: "dryer repair Kuala Lumpur",
    },
    {
      url: SERVICE_ASSETS.acService.image,
      alt: SERVICE_ASSETS.acService.alt,
      focusKeyword: "aircond service Kuala Lumpur",
    },
    {
      url: SERVICE_ASSETS.acInstall.image,
      alt: SERVICE_ASSETS.acInstall.alt,
      focusKeyword: "aircond installation Kuala Lumpur",
    },
    {
      url: "/images/hero/our-services.webp",
      alt: "Home appliance repair services in Kuala Lumpur — fridge, washing machine, dryer and aircond",
      focusKeyword: "appliance repair services Kuala Lumpur",
    },
    {
      url: "/images/hero/fridge-repairbg.jpg",
      alt: "Fridge repair technician working on a refrigerator",
      focusKeyword: "fridge repair Kuala Lumpur",
    },
    {
      url: "/images/about-technician.jpg",
      alt: "RepairKL technician repairing an appliance",
      focusKeyword: "appliance repair technician Kuala Lumpur",
    },
    {
      url: "/images/services/stats-bg.jpg",
      alt: "RepairKL repair statistics",
      focusKeyword: null,
    },
    {
      url: "/images/services/cta-bg.jpg",
      alt: "Book an appliance repair with RepairKL",
      focusKeyword: "book appliance repair Kuala Lumpur",
    },
  ];

  let count = 0;
  for (const a of assets) {
    const existing = await prisma.mediaAsset.findUnique({
      where: { url: a.url },
    });
    if (existing) continue;
    await prisma.mediaAsset.create({
      data: { url: a.url, alt: a.alt, focusKeyword: a.focusKeyword },
    });
    count++;
  }
  return count;
}

// ─── main ──────────────────────────────────────────────────────────────────────

main()
  .then(async (summary) => {
    await prisma.$disconnect();
    for (const [name, n] of Object.entries(summary)) {
      console.log(`  ${name}: ${n}`);
    }
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function main() {
  console.log("Seeding CMS tables (Step 15)…");
  const siteSetting = await seedSiteSetting();
  const seoMeta = await seedSeoMeta();
  const pages = await seedPages();
  const navigation = await seedNavigation();
  const media = await seedMedia();

  return {
    "SiteSetting created": siteSetting ? 1 : 0,
    "SeoMeta created": seoMeta,
    "Pages created": pages.created,
    "Home sections refreshed": pages.refreshed,
    "Navigation created": navigation,
    "MediaAssets created": media,
  };
}
