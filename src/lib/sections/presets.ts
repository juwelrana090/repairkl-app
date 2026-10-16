// Section + page presets (page-builder §4.8, roadmap VB9) — pure data, so it
// is safe in client bundles AND in `tsx --test` (scripts/section-presets.test.ts
// re-validates every props object against the same zod schemas the save and
// publish endpoints use — a preset that drifts from its schema fails CI, not
// the editor). Never import registry.ts here; types are plain strings like in
// store.ts.
//
// Presets are shared objects: applying one clones its props with
// structuredClone in BuilderClient, so editing an inserted section can never
// leak back into the preset definitions.

/** One section in a page preset / one section preset's payload. */
export type PresetSection = {
  type: string;
  props: Record<string, unknown>;
};

/** A ready-made variant of a single section type (§4.8: 2-3 per type). */
export type SectionPreset = {
  id: string;
  type: string;
  name: string;
  description: string;
  props: Record<string, unknown>;
};

/** A whole-page starting layout (§4.8: blank, home, service, about, faq, contact). */
export type PagePreset = {
  id: string;
  name: string;
  description: string;
  sections: PresetSection[];
};

// ── Section building blocks ────────────────────────────────────────────────
// Named so PAGE_PRESETS can reuse the exact same props objects — the home
// preset mirrors the seeded home page (prisma/seed-cms.ts) at a smaller scale.

const SERVICE_LINKS = [
  { name: "Fridge Repair", href: "/our-services/fridge-repair" },
  { name: "Washing Machine", href: "/our-services/washing-machine-repair" },
  { name: "Dryer Repair", href: "/our-services/dryer-repair" },
  { name: "Aircond Service", href: "/our-services/aircond-service" },
  { name: "Aircond Installation", href: "/our-services/aircond-installation" },
];

const heroShowcase: PresetSection = {
  type: "HERO",
  props: {
    badge: "Serving Kuala Lumpur & Selangor",
    heading: "Appliance repair in Kuala Lumpur, done right the first time.",
    subheading:
      "Certified technicians for fridges, washing machines, dryers and airconds. Clear quote before any work starts, and every repair carries a labour warranty.",
    slides: [
      { src: "/images/hero/fridge-repairbg.jpg", alt: "Fridge repair technician in Kuala Lumpur", position: "center right" },
      { src: "/images/hero/air-conditioner-service.jpg", alt: "Air conditioner service in Kuala Lumpur", position: "center right" },
    ],
    interval: 6000,
    rating: { value: "4.9", label: "average rating" },
    trustItems: [
      { icon: "shield", text: "Warranty on every repair" },
      { icon: "clock", text: "Same-day slots" },
    ],
    primaryCta: { label: "Book a repair", kind: "booking" },
    secondaryCta: { label: "Chat on WhatsApp", kind: "whatsapp" },
  },
};

const heroPlain: PresetSection = {
  type: "HERO",
  props: {
    heading: "A clear headline for the page.",
    subheading: "One or two supporting sentences that tell the visitor what to do next.",
    primaryCta: { label: "Book a repair", kind: "booking" },
  },
};

const heroPicker: PresetSection = {
  type: "HERO",
  props: {
    heading: "What needs fixing today?",
    subheading: "Pick a service and book a technician in under two minutes.",
    quickPicker: {
      title: "Book a repair",
      subtitle: "Choose your appliance",
      items: SERVICE_LINKS,
      footerLabel: "Not sure what is wrong?",
      footerHighlight: "Send us a photo on WhatsApp",
    },
    primaryCta: { label: "Book a repair", kind: "booking" },
  },
};

const servicesAll: PresetSection = {
  type: "SERVICE_GRID",
  props: {
    heading: "Five services, one standard of work.",
    subheading: "Every job starts with a diagnosis and a written quote before any work begins.",
    viewAll: { label: "View all services", href: "/our-services" },
    services: [
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
    ],
  },
};

const servicesPair: PresetSection = {
  type: "SERVICE_GRID",
  props: {
    heading: "Popular this week",
    subheading: "The two jobs we are asked for most.",
    services: [
      {
        name: "Aircond Service",
        desc: "Full chemical wash and gas top-up for wall units.",
        issues: ["Water drip", "Not cold"],
        href: "/our-services/aircond-service",
      },
      {
        name: "Fridge Repair",
        desc: "Same-day diagnosis for fridges that won't cool.",
        issues: ["Not cooling", "Ice build-up"],
        href: "/our-services/fridge-repair",
      },
    ],
  },
};

const statsLive: PresetSection = {
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
};

const statsStatic: PresetSection = {
  type: "STATS",
  props: {
    image: "/images/services/stats-bg.jpg",
    stats: [
      { value: "90%", label: "First-visit fix rate" },
      { value: "2 min", label: "Average booking time" },
      { value: "7 days", label: "Open every week" },
    ],
  },
};

const stepsThree: PresetSection = {
  type: "TIMELINE",
  props: {
    heading: "From booking to fixed in three steps.",
    subheading: "No phone tag, no guessing when someone will turn up.",
    steps: [
      { icon: "calendar", title: "Book online", desc: "Pick a service and a slot that suits you. You get a confirmation right away." },
      { icon: "userCheck", title: "Technician arrives", desc: "A verified technician diagnoses the fault and quotes before any work starts." },
      { icon: "shield", title: "Fixed and warranted", desc: "The repair is done on the spot and covered by a labour warranty." },
    ],
  },
};

const stepsFour: PresetSection = {
  type: "TIMELINE",
  props: {
    heading: "How a repair works",
    steps: [
      { icon: "calendar", title: "Book", desc: "Choose a service and time slot online." },
      { icon: "userCheck", title: "Diagnose", desc: "The technician inspects and quotes on the spot." },
      { icon: "wrench", title: "Repair", desc: "Fixed the same visit whenever parts allow." },
      { icon: "card", title: "Pay and relax", desc: "Pay after the job is done, warranty included." },
    ],
  },
};

const ctaImage: PresetSection = {
  type: "CTA",
  props: {
    image: "/images/services/cta-bg.jpg",
    heading: "Something broken? Get it fixed this week.",
    body: "Send us a WhatsApp message and we will book a technician for you.",
    primaryCta: { label: "Book a repair", kind: "booking" },
  },
};

const ctaGradient: PresetSection = {
  type: "CTA",
  props: {
    heading: "Ready when you are.",
    body: "No photo, no problem — describe the fault in a message and we will take it from there.",
    primaryCta: { label: "Chat on WhatsApp", kind: "whatsapp" },
  },
};

const ctaDouble: PresetSection = {
  type: "CTA",
  props: {
    image: "/images/services/cta-bg.jpg",
    heading: "Get a technician out this week.",
    body: "Book online in two minutes, or message us if you are not sure what is wrong.",
    primaryCta: { label: "Book a repair", kind: "booking" },
    secondaryCta: { label: "Chat on WhatsApp", kind: "whatsapp" },
  },
};

const faqBooking: PresetSection = {
  type: "FAQ",
  props: {
    heading: "Common questions",
    intro: "The things customers ask before their first booking.",
    more: { label: "See all FAQs", href: "/faq" },
    faqs: [
      { q: "How fast can a technician come?", a: "Same-day slots are available in most KL areas when you book before 2pm." },
      { q: "Do you quote before repairing?", a: "Yes. The technician diagnoses first and you approve a written quote before any work starts." },
      { q: "Is there a warranty?", a: "Every repair carries a minimum one-month labour warranty." },
      { q: "Which areas do you cover?", a: "Kuala Lumpur and the surrounding Selangor neighborhoods." },
    ],
  },
};

const faqShort: PresetSection = {
  type: "FAQ",
  props: {
    heading: "Quick answers",
    faqs: [
      { q: "Do you bring spare parts?", a: "Technicians stock common parts; anything rare is ordered with a fixed ETA." },
      { q: "How do I pay?", a: "Cash, card or online transfer after the job is done." },
      { q: "Can I reschedule?", a: "Yes, free of charge, up to three hours before the slot." },
    ],
  },
};

const testimonialsThree: PresetSection = {
  type: "TESTIMONIALS",
  props: {
    heading: "What our customers say.",
    ratingText: "4.9 out of 5",
    testimonials: [
      { name: "Aisyah Rahman", role: "Washing machine repair", text: "Booked at 9am, technician arrived by noon and the machine was spinning again the same day.", initial: "AR" },
      { name: "Daniel Lim", role: "Aircond service", text: "Honest quote, tidy work, and they cleaned up after the chemical wash. Rare these days.", initial: "DL" },
      { name: "Priya Nair", role: "Fridge repair", text: "The compressor issue two other shops missed was found and fixed in one visit.", initial: "PN" },
    ],
  },
};

const testimonialsTwo: PresetSection = {
  type: "TESTIMONIALS",
  props: {
    heading: "Trusted by households across KL",
    testimonials: [
      { name: "Farid A.", role: "Dryer repair", text: "Clear pricing and a same-day fix. Will call again." },
      { name: "Mei W.", role: "Aircond installation", text: "Neat piping work and a full test run before they left." },
    ],
  },
};

const contactMap: PresetSection = {
  type: "CONTACT_INFO",
  props: {
    heading: "Get in touch",
    subheading: "We reply within minutes during business hours.",
    showMap: true,
  },
};

const contactPlain: PresetSection = {
  type: "CONTACT_INFO",
  props: {
    heading: "Talk to us",
    subheading: "Phone, WhatsApp or email — whatever suits you.",
    showMap: false,
  },
};

const valuesSix: PresetSection = {
  type: "VALUES",
  props: {
    heading: "Why households in KL choose us.",
    subheading: "Six reasons customers keep our number saved.",
    features: [
      { icon: "userCheck", title: "Verified technicians", desc: "Background-checked, trained and rated after every job." },
      { icon: "tag", title: "Upfront pricing", desc: "A written quote before any work starts. No surprises." },
      { icon: "shield", title: "Labour warranty", desc: "Every repair is covered for at least one month." },
      { icon: "phone", title: "Fast response", desc: "Replies within minutes during business hours." },
      { icon: "zap", title: "Same-day slots", desc: "Most repairs are done on the first visit." },
      { icon: "card", title: "Pay after the fix", desc: "You only pay once the job is done and tested." },
    ],
  },
};

const valuesPillars: PresetSection = {
  type: "VALUES",
  props: {
    heading: "What we stand for",
    subheading: "Three promises we make on every job.",
    features: [
      { icon: "handshake", title: "Honest advice", desc: "If a repair is not worth it, we say so." },
      { icon: "clock", title: "On time", desc: "You get a slot, not a vague window." },
      { icon: "heart", title: "Care at home", desc: "Shoes off, mess cleared, appliance tested." },
    ],
    quote: {
      text: "We treat every home like it belongs to our own family.",
      author: "The RepairKL team",
      role: "",
    },
  },
};

const richTextAbout: PresetSection = {
  type: "RICH_TEXT",
  props: {
    heading: "About this page",
    lead: "A short introduction that frames everything below.",
    html: "<p>Open with the one sentence that matters most to the reader.</p><p>Then add the detail: who this is for, what they get, and what to do next.</p>",
  },
};

const richTextPlain: PresetSection = {
  type: "RICH_TEXT",
  props: {
    heading: "Section heading",
    html: "<p>Write your copy here. Use the toolbar for headings and lists.</p>",
  },
};

const imageTextStory: PresetSection = {
  type: "IMAGE_TEXT",
  props: {
    ariaLabel: "About RepairKL",
    image: "/images/about-technician.jpg",
    heading: "Technicians who treat your home like their own.",
    paragraphs: [
      "RepairKL sends verified, background-checked technicians to homes across Kuala Lumpur and Selangor.",
      "You get a written quote before any work starts, and every repair is backed by a labour warranty.",
    ],
    checklist: [
      "Verified, background-checked technicians",
      "Written quote before work starts",
      "Minimum one-month labour warranty",
    ],
    badgeCard: { icon: "shield", title: "Trusted since day one", subtitle: "10,000+ repairs and counting" },
    cta: { label: "Read our story", kind: "link", href: "/about" },
  },
};

const imageTextSimple: PresetSection = {
  type: "IMAGE_TEXT",
  props: {
    image: "/images/services/ac-installation.jpg",
    heading: "Show the work, tell the story",
    paragraphs: [
      "One strong image beside two or three short paragraphs outperforms a wall of text.",
      "Replace the photo with one of your own jobs to build instant trust.",
    ],
  },
};

/** All section presets (§4.8: 2-3 variants per type, in palette order). */
export const SECTION_PRESETS: SectionPreset[] = [
  { id: "hero-showcase", type: heroShowcase.type, name: "Full hero", description: "Photo slides, rating, trust badges and two buttons.", props: heroShowcase.props },
  { id: "hero-plain", type: heroPlain.type, name: "Plain hero", description: "Just a headline, a subheading and one button.", props: heroPlain.props },
  { id: "hero-picker", type: heroPicker.type, name: "Hero with service picker", description: "Quick service picker card over a simpler hero.", props: heroPicker.props },
  { id: "services-all", type: servicesAll.type, name: "All five services", description: "The full service grid with links and common issues.", props: servicesAll.props },
  { id: "services-pair", type: servicesPair.type, name: "Two-service spotlight", description: "A compact grid highlighting two services.", props: servicesPair.props },
  { id: "stats-live", type: statsLive.type, name: "Live counters", description: "Photo band with live booking and technician counters.", props: statsLive.props },
  { id: "stats-static", type: statsStatic.type, name: "Three quick stats", description: "Three static numbers on a photo background.", props: statsStatic.props },
  { id: "steps-three", type: stepsThree.type, name: "3-step process", description: "Book, diagnose, fix - the classic how-it-works.", props: stepsThree.props },
  { id: "steps-four", type: stepsFour.type, name: "4-step process", description: "Adds a final pay-and-relax step.", props: stepsFour.props },
  { id: "cta-image", type: ctaImage.type, name: "Photo CTA banner", description: "Background photo with a booking button.", props: ctaImage.props },
  { id: "cta-gradient", type: ctaGradient.type, name: "Gradient CTA", description: "No photo - a clean gradient banner with one button.", props: ctaGradient.props },
  { id: "cta-double", type: ctaDouble.type, name: "Two-button CTA", description: "Photo banner with booking and WhatsApp buttons.", props: ctaDouble.props },
  { id: "faq-booking", type: faqBooking.type, name: "Booking questions", description: "Four common booking questions with a link to all FAQs.", props: faqBooking.props },
  { id: "faq-short", type: faqShort.type, name: "Quick answers", description: "Three short questions, no extra link.", props: faqShort.props },
  { id: "testimonials-three", type: testimonialsThree.type, name: "Three reviews", description: "Three customer quotes with initials and a rating.", props: testimonialsThree.props },
  { id: "testimonials-two", type: testimonialsTwo.type, name: "Two short reviews", description: "A lighter testimonial row.", props: testimonialsTwo.props },
  { id: "contact-map", type: contactMap.type, name: "Contact with map", description: "Phone, email, hours and the office map.", props: contactMap.props },
  { id: "contact-plain", type: contactPlain.type, name: "Contact details only", description: "The same block without the map.", props: contactPlain.props },
  { id: "values-six", type: valuesSix.type, name: "Six value pillars", description: "The full why-choose-us grid.", props: valuesSix.props },
  { id: "values-pillars", type: valuesPillars.type, name: "Three pillars + quote", description: "Three promises with a team quote.", props: valuesPillars.props },
  { id: "richtext-about", type: richTextAbout.type, name: "About block", description: "Heading, lead and two opening paragraphs.", props: richTextAbout.props },
  { id: "richtext-plain", type: richTextPlain.type, name: "Simple text block", description: "A heading and one editable paragraph.", props: richTextPlain.props },
  { id: "image-text-story", type: imageTextStory.type, name: "Story with checklist", description: "Photo, caption card, checklist and button.", props: imageTextStory.props },
  { id: "image-text-simple", type: imageTextSimple.type, name: "Image beside text", description: "One photo and two paragraphs.", props: imageTextSimple.props },
];

// ── Page presets ───────────────────────────────────────────────────────────
// Extra page-specific compositions reuse the same building-block style.

const serviceHero: PresetSection = {
  type: "HERO",
  props: {
    badge: "From RM60 · Labour warranty included",
    heading: "Fridge repair in Kuala Lumpur, done right.",
    subheading: "Not cooling, leaking or making noise? A verified technician diagnoses it today and quotes before any work starts.",
    slides: [{ src: "/images/hero/fridge-repairbg.jpg", alt: "Fridge repair technician in Kuala Lumpur", position: "center right" }],
    primaryCta: { label: "Book a repair", kind: "booking" },
    secondaryCta: { label: "Chat on WhatsApp", kind: "whatsapp" },
  },
};

const serviceIssues: PresetSection = {
  type: "IMAGE_TEXT",
  props: {
    image: "/images/hero/fridge-repairbg.jpg",
    heading: "Is your fridge doing any of these?",
    paragraphs: [
      "These are the faults our technicians fix most weeks - usually on the first visit.",
      "If your symptom is not listed, message us a photo and we will tell you what it likely is.",
    ],
    checklist: [
      "Not cooling, or cooling too much",
      "Water leaking onto the floor",
      "Ice build-up in the freezer",
      "Loud humming or clicking noises",
    ],
  },
};

const faqIntro: PresetSection = {
  type: "RICH_TEXT",
  props: {
    heading: "Frequently asked questions",
    lead: "Everything customers ask before, during and after a repair.",
    html: "<p>Cannot find your question? Message us on WhatsApp - a human replies, usually within minutes.</p>",
  },
};

const contactIntro: PresetSection = {
  type: "RICH_TEXT",
  props: {
    heading: "Contact RepairKL",
    lead: "WhatsApp is fastest, but we answer every channel.",
    html: "<p>Send a photo of the appliance and a short description - we will reply with a slot and a price guide.</p>",
  },
};

/** Whole-page starting layouts (§4.8). */
export const PAGE_PRESETS: PagePreset[] = [
  {
    id: "blank",
    name: "Blank",
    description: "An empty layout - add blocks one by one.",
    sections: [],
  },
  {
    id: "home",
    name: "Home page",
    description: "The full RepairKL home flow: hero, services, story, stats, steps, values, reviews, FAQ, CTA.",
    sections: [heroShowcase, servicesAll, imageTextStory, statsLive, stepsThree, valuesSix, testimonialsThree, faqBooking, ctaImage],
  },
  {
    id: "service",
    name: "Service landing",
    description: "A single-service page: hero, symptoms checklist, process, questions, CTA.",
    sections: [serviceHero, serviceIssues, stepsThree, faqShort, ctaImage],
  },
  {
    id: "about",
    name: "About",
    description: "Story block, values with a quote, the 4-step process and a two-button CTA.",
    sections: [imageTextStory, valuesPillars, stepsFour, ctaDouble],
  },
  {
    id: "faq",
    name: "FAQ page",
    description: "Intro, the full booking FAQ and a gradient CTA.",
    sections: [faqIntro, faqBooking, ctaGradient],
  },
  {
    id: "contact",
    name: "Contact",
    description: "Intro, contact details with map and a photo CTA.",
    sections: [contactIntro, contactMap, ctaImage],
  },
];
