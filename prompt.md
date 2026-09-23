# RepairKL — full SEO update: 5 service landing pages (with the new washing-machine content), on-topic About and FAQ content, fixed metadata, schema, sitemap and robots

Apply every step exactly as written. Only touch the files listed. Do not open, read or search any other file or directory. Every file content and FIND string below is final. Do not adjust, verify or look anything up.

The FIND strings contain no colour values, so they match whichever colour palette is currently applied. New files are written in the navy/blue palette (#001353 / #034795).

What this fixes:

1. Adds 5 dedicated, indexable service landing pages at /our-services/<slug>:
   - Washing machine uses the provided content.
   - Fridge, dryer, aircond service and aircond installation get the same depth of content.
   - Each page has a unique title and description, H1/H2/H3 structure, a list of common problems, a process section, brands, areas served, FAQs, related-service links, and Service, FAQPage and BreadcrumbList JSON-LD.
2. Links those pages from Our Services, the home page and the footer (these previously pointed to #anchors).
3. Replaces off-topic template content in About and FAQ. It mentioned house shifting, cleaning, Penang, Rajshahi/Khulna, Dhaka neighbourhoods and a fake promo code.
4. Fixes a duplicated title bug. Page titles rendered as "… | RepairKL | RepairKL" because the root title template was added on top of titles that already include the brand.
5. Fixes social preview images that pointed to files that don't exist (/og-image.png, /og-home.png, /logo.png).
6. Gives the home page its own metadata. The metadata export inside MarketingHome.tsx is ignored by Next.js because it is not a page file.
7. Structured data:
   - Removes self-declared aggregateRating and priceRange from the business schema, which risk a Google penalty and are misleading.
   - Adds areaServed, contactPoint and a WebSite schema.
   - Aligns opening hours with the hours shown on the site.
8. Sitemap and robots:
   - The sitemap now lists the public service pages instead of login-only /services/\* URLs.
   - robots.txt stops crawlers from reaching login and app pages.
9. html lang is set to en-MY.

══════════════════════════════════════════
STEP 1 — src/lib/serviceContent.ts
CREATE this new file (write exactly)
══════════════════════════════════════════

```ts
// SEO content for each service detail page (/our-services/[slug]).
// Edit copy here — the page template renders everything from this file.

import { SERVICE_ASSETS, type ServiceAsset } from "@/lib/brandAssets";

export type ServiceSectionItem = { title: string; desc: string };
export type ServiceSection = {
  title: string;
  intro: string;
  items: ServiceSectionItem[];
};
export type ServiceStep = { title: string; desc: string };
export type ServiceFaq = { q: string; a: string };

export type ServiceContent = {
  slug: string;
  name: string; // short name used in nav, links and schema
  h1: string;
  metaTitle: string; // ≤ 60 characters
  metaDescription: string; // ≈ 150–160 characters
  keywords: string[];
  asset: ServiceAsset;
  intro: string;
  problems: string[]; // "Common problems we fix" chips
  sections: ServiceSection[];
  process: ServiceStep[];
  brands: string[];
  faqs: ServiceFaq[];
};

// Areas shown on every service page (local SEO). Edit to match your real coverage.
export const SERVICE_AREAS = [
  "Kuala Lumpur City Centre",
  "Mont Kiara",
  "Bangsar",
  "Cheras",
  "Setapak",
  "Kepong",
  "Ampang",
  "Petaling Jaya",
  "Subang Jaya",
  "Puchong",
  "Shah Alam",
  "Cyberjaya",
];

export const SERVICES: ServiceContent[] = [
  // ─── Washing machine ──────────────────────────────────────────────────────
  {
    slug: "washing-machine-repair",
    name: "Washing Machine Repair",
    h1: "Washing Machine Repair in Kuala Lumpur",
    metaTitle: "Washing Machine Repair in Kuala Lumpur | RepairKL",
    metaDescription:
      "Front-load and top-load washing machine repair in KL and Selangor. Leaks, no spin, error codes, wiring and motor faults fixed by certified technicians.",
    keywords: [
      "washing machine repair Kuala Lumpur",
      "washing machine repair KL",
      "front load washing machine repair",
      "top load washing machine repair",
      "washing machine not spinning",
      "washing machine leaking",
      "washing machine error code",
      "washer repair Selangor",
    ],
    asset: SERVICE_ASSETS.washer,
    intro:
      "We provide comprehensive diagnostic, electrical and mechanical repairs for front-load and top-load washing machines. Whether your washer is leaking, failing to spin, showing error codes or suffering from electrical faults, our certified technicians handle every component with precision.",
    problems: [
      "Not spinning",
      "Not draining",
      "Leaking water",
      "Error codes",
      "Loud noise or vibration",
      "Door won't lock",
      "Not filling with water",
      "Tripping the breaker",
    ],
    sections: [
      {
        title: "Full electrical & wiring harness repairs",
        intro:
          "Electrical failures can cause complete machine shutdowns or trip your home's circuit breaker. We inspect, trace and repair all internal wiring systems.",
        items: [
          {
            title: "Main wiring harnesses",
            desc: "Repairing or replacing frayed, shorted or rodent-damaged wire looms.",
          },
          {
            title: "PCB & control board connections",
            desc: "Soldering damaged traces, replacing burned relays and fixing loose terminal connectors.",
          },
          {
            title: "Safety switches & door locks",
            desc: "Diagnostic testing and replacement of door interlock switches, lid switches and thermal cut-off fuses.",
          },
          {
            title: "Capacitors & transformers",
            desc: "Testing start/run capacitors for motor propulsion and replacing faulty power units.",
          },
        ],
      },
      {
        title: "Drive & mechanical component overhauls",
        intro:
          "Mechanical wear and tear leads to loud noises, excessive vibration or a drum that won't turn.",
        items: [
          {
            title: "Drive motor & carbon brushes",
            desc: "Testing motor windings, replacing worn carbon brushes or replacing drive motors entirely.",
          },
          {
            title: "Tub bearings & seals",
            desc: "Replacing worn inner-tub bearings and water seals to stop squealing noises and tub leaks.",
          },
          {
            title: "Belts & pulleys",
            desc: "Fitting replacement drive belts and recalibrating motor pulleys.",
          },
          {
            title: "Shock absorbers & suspension springs",
            desc: "Replacing worn dampers to stabilise machines that shake or walk during the spin cycle.",
          },
        ],
      },
      {
        title: "Water system, valves & drainage",
        intro:
          "Proper water flow is essential for clean clothes and leak prevention.",
        items: [
          {
            title: "Drain pumps & filters",
            desc: "Clearing blockages, repairing impellers or replacing dead drain pumps.",
          },
          {
            title: "Water inlet valves",
            desc: "Replacing clogged or malfunctioning solenoids to fix slow-filling or continuous-filling issues.",
          },
          {
            title: "Pressure sensors & switches",
            desc: "Recalibrating or replacing water level sensors to resolve overfilling or false error codes.",
          },
          {
            title: "Hoses & gaskets",
            desc: "Replacing cracked internal drain hoses, inlet pipes and moulded door boot seals.",
          },
        ],
      },
    ],
    process: [
      {
        title: "Diagnostic & safety check",
        desc: "We disconnect power and water, then run full multimeter continuity tests across the wiring harness, control board and safety switches.",
      },
      {
        title: "Component replacement & wiring fixes",
        desc: "We replace burnt cables, repair corroded terminals and install genuine OEM replacement parts for motors, valves or boards.",
      },
      {
        title: "System testing & safety inspection",
        desc: "We run a full test cycle to verify water fill, heating, high-speed spin stability, drainage and earthing safety before handing the machine back.",
      },
    ],
    brands: [
      "Samsung",
      "LG",
      "Panasonic",
      "Sharp",
      "Electrolux",
      "Bosch",
      "Toshiba",
      "Hitachi",
      "Midea",
      "Haier",
    ],
    faqs: [
      {
        q: "Why is my washing machine not spinning?",
        a: "The most common causes are a worn drive belt, faulty carbon brushes or motor, a failed door lock, or an unbalanced load. Our technician tests each part to find the exact cause before replacing anything.",
      },
      {
        q: "Why is my washing machine leaking water?",
        a: "Leaks usually come from a torn door boot seal, a cracked drain hose, a loose inlet pipe or worn tub seals and bearings. We trace the leak to its source and replace the damaged part.",
      },
      {
        q: "Can you fix washing machine error codes?",
        a: "Yes. We diagnose error codes on front-load and top-load machines from all major brands, including drainage, door lock, water level, motor and control board faults.",
      },
      {
        q: "Do you repair both front-load and top-load washing machines?",
        a: "Yes, we repair both front-load and top-load washers, including washer-dryer combo units.",
      },
      {
        q: "Is it worth repairing an old washing machine?",
        a: "Often it is. Parts like belts, pumps, valves and door seals are affordable to replace. After diagnosis, the technician will tell you honestly whether a repair makes sense or a replacement is better value.",
      },
      {
        q: "Do you offer a warranty on washing machine repairs?",
        a: "Yes. Every repair comes with a labour warranty, and replacement parts carry their own manufacturer warranty.",
      },
    ],
  },

  // ─── Fridge ───────────────────────────────────────────────────────────────
  {
    slug: "fridge-repair",
    name: "Fridge Repair",
    h1: "Fridge Repair in Kuala Lumpur",
    metaTitle: "Fridge & Refrigerator Repair in Kuala Lumpur | RepairKL",
    metaDescription:
      "Fridge not cooling, leaking or noisy? Certified refrigerator repair in KL and Selangor for all brands, including inverter, side-by-side and multi-door models.",
    keywords: [
      "fridge repair Kuala Lumpur",
      "refrigerator repair KL",
      "fridge not cooling",
      "fridge repair Selangor",
      "inverter fridge repair",
      "fridge gas refill",
      "fridge compressor repair",
      "side by side fridge repair",
    ],
    asset: SERVICE_ASSETS.fridge,
    intro:
      "We repair single-door, two-door, side-by-side, multi-door and inverter refrigerators and freezers. From a fridge that has stopped cooling to water leaks, ice build-up or a noisy compressor, our certified technicians diagnose the fault on site and fix it with the right parts.",
    problems: [
      "Not cooling",
      "Freezer not freezing",
      "Water leaking",
      "Ice build-up",
      "Noisy compressor",
      "Fridge keeps tripping",
      "Light or display not working",
      "Bad smell or frost",
    ],
    sections: [
      {
        title: "Cooling & sealed system repairs",
        intro:
          "Most fridge complaints come down to the cooling system. We test every stage of the refrigeration cycle to find where cooling is being lost.",
        items: [
          {
            title: "Compressor & inverter compressor",
            desc: "Testing start relays, overload protectors and inverter drive boards, and replacing failed compressors.",
          },
          {
            title: "Gas leak detection & recharge",
            desc: "Locating refrigerant leaks, repairing them and recharging with the correct gas type and quantity.",
          },
          {
            title: "Condenser & evaporator coils",
            desc: "Cleaning clogged condenser coils and repairing damaged evaporator coils to restore efficient cooling.",
          },
          {
            title: "Fans & airflow",
            desc: "Replacing faulty evaporator and condenser fan motors so cold air reaches every compartment.",
          },
        ],
      },
      {
        title: "Electrical, sensors & control boards",
        intro:
          "Modern fridges rely on sensors and electronics. A single failed component can stop the whole unit from cooling.",
        items: [
          {
            title: "Thermostats & temperature sensors",
            desc: "Testing and replacing thermostats and thermistors that cause over-cooling or no cooling.",
          },
          {
            title: "Main PCB & display boards",
            desc: "Diagnosing control board faults, burned relays and display issues on digital models.",
          },
          {
            title: "Defrost system",
            desc: "Replacing defrost heaters, timers and bi-metal thermostats to stop ice build-up.",
          },
          {
            title: "Wiring & power faults",
            desc: "Tracing shorts and damaged wiring that trip your breaker or cut power to the fridge.",
          },
        ],
      },
      {
        title: "Water, seals & ice makers",
        intro:
          "Leaks and warm air leaking in make a fridge work harder and fail sooner.",
        items: [
          {
            title: "Door gaskets & seals",
            desc: "Replacing torn or loose door seals so cold air stays in and your electricity bill stays down.",
          },
          {
            title: "Drain line blockages",
            desc: "Clearing blocked defrost drains that cause water to pool inside or under the fridge.",
          },
          {
            title: "Ice makers & water dispensers",
            desc: "Repairing inlet valves, water lines and ice maker assemblies on side-by-side and multi-door models.",
          },
          {
            title: "Hinges & door alignment",
            desc: "Realigning sagging doors and replacing broken hinges so doors close properly.",
          },
        ],
      },
    ],
    process: [
      {
        title: "On-site diagnosis",
        desc: "We check temperatures, test the compressor, fans, sensors and defrost system, and explain the fault in plain terms.",
      },
      {
        title: "Quote & repair",
        desc: "You approve the quote first. We then replace the faulty parts using genuine or quality-compatible components.",
      },
      {
        title: "Cooling test & handover",
        desc: "We run the fridge until it reaches normal operating temperature and confirm door seals and drainage before we leave.",
      },
    ],
    brands: [
      "Samsung",
      "LG",
      "Panasonic",
      "Sharp",
      "Hitachi",
      "Toshiba",
      "Electrolux",
      "Hisense",
      "Midea",
      "Haier",
    ],
    faqs: [
      {
        q: "Why is my fridge not cooling but the light is on?",
        a: "The light working only means the fridge has power. Common causes are a faulty compressor relay, a failed fan motor, a blocked defrost system or a refrigerant leak. Our technician tests each part to find the cause.",
      },
      {
        q: "Why is there water leaking from my fridge?",
        a: "Most leaks come from a blocked defrost drain, a damaged drain pan or a faulty water line on models with dispensers. We clear or replace the affected part.",
      },
      {
        q: "Can you repair inverter fridges?",
        a: "Yes. We diagnose and repair inverter compressors and inverter control boards on all major brands.",
      },
      {
        q: "Do you refill fridge gas?",
        a: "Yes, but only after finding and fixing the leak. Refilling without repairing the leak only works for a short time.",
      },
      {
        q: "How long does a fridge repair take?",
        a: "Many repairs, such as fans, thermostats, relays and door seals, are completed in a single visit. Sealed-system work like gas leak repair may take longer.",
      },
      {
        q: "Do you offer a warranty on fridge repairs?",
        a: "Yes. Every repair comes with a labour warranty, and replacement parts carry their own manufacturer warranty.",
      },
    ],
  },

  // ─── Dryer ────────────────────────────────────────────────────────────────
  {
    slug: "dryer-repair",
    name: "Dryer Repair",
    h1: "Dryer Repair in Kuala Lumpur",
    metaTitle: "Clothes Dryer Repair in Kuala Lumpur | RepairKL",
    metaDescription:
      "Dryer not heating, not tumbling or overheating? Vented, condenser and heat pump dryer repair in KL and Selangor by certified technicians.",
    keywords: [
      "dryer repair Kuala Lumpur",
      "tumble dryer repair KL",
      "dryer not heating",
      "dryer not spinning",
      "condenser dryer repair",
      "heat pump dryer repair",
      "dryer repair Selangor",
    ],
    asset: SERVICE_ASSETS.dryer,
    intro:
      "We repair vented, condenser and heat pump tumble dryers, as well as washer-dryer combo units. If your dryer won't heat, won't tumble, takes too long to dry or keeps tripping the breaker, our technicians find the fault and carry common parts for same-visit repairs.",
    problems: [
      "Not heating",
      "Drum not turning",
      "Takes too long to dry",
      "Overheating",
      "Tripping the breaker",
      "Loud squeaking or thumping",
      "Won't start",
      "Water tank or pump error",
    ],
    sections: [
      {
        title: "Heating system repairs",
        intro:
          "No heat is the most common dryer fault. We test every part of the heating circuit.",
        items: [
          {
            title: "Heating elements",
            desc: "Testing element resistance and replacing burnt or open-circuit heating elements.",
          },
          {
            title: "Thermostats & thermal fuses",
            desc: "Replacing cycling thermostats, high-limit thermostats and blown thermal fuses.",
          },
          {
            title: "Heat pump systems",
            desc: "Diagnosing heat pump compressors, fans and sensors on energy-efficient heat pump dryers.",
          },
          {
            title: "Moisture & temperature sensors",
            desc: "Cleaning or replacing sensors that end cycles too early or run them too long.",
          },
        ],
      },
      {
        title: "Drum, drive & mechanical repairs",
        intro:
          "A dryer that won't tumble or makes loud noises usually has a worn mechanical part.",
        items: [
          {
            title: "Drive belts",
            desc: "Replacing broken or stretched drum belts so the drum turns smoothly.",
          },
          {
            title: "Drum rollers & bearings",
            desc: "Replacing worn rollers, bearings and drum seals that cause squeaking or thumping.",
          },
          {
            title: "Idler pulleys",
            desc: "Replacing seized or noisy idler pulleys that keep the belt under tension.",
          },
          {
            title: "Drive motors",
            desc: "Testing motor windings and start switches, and replacing failed motors.",
          },
        ],
      },
      {
        title: "Airflow, venting & electrical safety",
        intro:
          "Blocked airflow makes drying slow and is a common cause of overheating.",
        items: [
          {
            title: "Lint filters & ducts",
            desc: "Clearing blocked lint paths and exhaust ducts to restore airflow and drying speed.",
          },
          {
            title: "Condenser units & pumps",
            desc: "Cleaning condenser units and repairing water pumps and tank sensors on condenser dryers.",
          },
          {
            title: "Door switches & control boards",
            desc: "Replacing faulty door switches, timers and control boards that stop the dryer from starting.",
          },
          {
            title: "Wiring & breaker trips",
            desc: "Tracing shorts and earth faults that trip your home's circuit breaker.",
          },
        ],
      },
    ],
    process: [
      {
        title: "Diagnosis & safety check",
        desc: "We disconnect power and test the heating circuit, motor, belt and sensors to pinpoint the fault.",
      },
      {
        title: "Repair with the right parts",
        desc: "After you approve the quote, we replace the faulty components and clean lint and airflow paths.",
      },
      {
        title: "Test cycle & handover",
        desc: "We run a full drying cycle to confirm heat, tumbling, airflow and electrical safety before handing it back.",
      },
    ],
    brands: [
      "Samsung",
      "LG",
      "Electrolux",
      "Bosch",
      "Panasonic",
      "Beko",
      "Midea",
      "Haier",
      "Whirlpool",
    ],
    faqs: [
      {
        q: "Why is my dryer running but not heating?",
        a: "The usual causes are a burnt heating element, a blown thermal fuse or a faulty thermostat. On heat pump dryers, it can be a compressor or sensor fault. We test each part to confirm.",
      },
      {
        q: "Why does my dryer take so long to dry clothes?",
        a: "Slow drying is most often caused by a blocked lint path or exhaust duct, a dirty condenser, or a sensor that ends the cycle too early. Cleaning and a sensor check usually fixes it.",
      },
      {
        q: "Why is my dryer drum not turning?",
        a: "A broken drive belt is the most common cause. Worn rollers, a seized idler pulley or a failed motor can also stop the drum.",
      },
      {
        q: "Do you repair washer-dryer combo machines?",
        a: "Yes. We repair both the washing and drying functions of washer-dryer combo units.",
      },
      {
        q: "Is an overheating dryer dangerous?",
        a: "It can be. Overheating is often caused by blocked airflow or a failed thermostat. Stop using the dryer and book a check as soon as possible.",
      },
    ],
  },

  // ─── Aircond service ──────────────────────────────────────────────────────
  {
    slug: "aircond-service",
    name: "Air-Conditioner Service",
    h1: "Aircond Service & Repair in Kuala Lumpur",
    metaTitle: "Aircond Service & Chemical Wash in KL | RepairKL",
    metaDescription:
      "Aircond servicing, chemical wash, gas top-up and repair in Kuala Lumpur and Selangor. Wall-mounted, cassette and inverter units from all major brands.",
    keywords: [
      "aircond service Kuala Lumpur",
      "aircond chemical wash KL",
      "aircond repair KL",
      "aircond gas top up",
      "aircond not cold",
      "aircond water leaking",
      "inverter aircond repair",
      "aircond service Selangor",
    ],
    asset: SERVICE_ASSETS.acService,
    intro:
      "Regular servicing keeps your aircond cold, quiet and energy-efficient in Malaysia's heat. We service and repair wall-mounted, ceiling cassette and inverter air-conditioners, from basic cleaning and chemical wash to gas top-up and electrical repairs.",
    problems: [
      "Not cold enough",
      "Water dripping indoors",
      "Bad smell",
      "Noisy indoor or outdoor unit",
      "Blinking lights or error codes",
      "Unit won't turn on",
      "Ice on the pipes",
      "High electricity bill",
    ],
    sections: [
      {
        title: "Servicing & cleaning",
        intro:
          "Dust and mould build-up reduce cooling and affect indoor air quality.",
        items: [
          {
            title: "General service",
            desc: "Cleaning filters, indoor coils, blower and drain tray, and checking overall performance.",
          },
          {
            title: "Chemical wash",
            desc: "Deep-cleaning indoor and outdoor coils with coil cleaner to remove stubborn dirt and mould.",
          },
          {
            title: "Chemical overhaul",
            desc: "Dismantling the indoor unit for a full clean of the coil, blower wheel and drain pan.",
          },
          {
            title: "Drain line flushing",
            desc: "Flushing clogged condensate drains that cause water to drip inside your home.",
          },
        ],
      },
      {
        title: "Refrigerant & cooling repairs",
        intro:
          "An aircond that runs but doesn't cool usually has a refrigerant or airflow problem.",
        items: [
          {
            title: "Gas top-up",
            desc: "Checking pressures and topping up R32, R410A or R22 refrigerant to the correct level.",
          },
          {
            title: "Gas leak repair",
            desc: "Locating and repairing leaks at flare joints, coils and piping before recharging.",
          },
          {
            title: "Compressor & capacitor",
            desc: "Testing compressors, start/run capacitors and contactors on the outdoor unit.",
          },
          {
            title: "Fan motors",
            desc: "Repairing or replacing indoor blower and outdoor fan motors.",
          },
        ],
      },
      {
        title: "Electrical & control repairs",
        intro:
          "Error codes and units that won't start often point to an electrical fault.",
        items: [
          {
            title: "PCB & inverter boards",
            desc: "Diagnosing control board and inverter board faults and reading brand-specific error codes.",
          },
          {
            title: "Sensors & thermistors",
            desc: "Replacing room and coil sensors that cause poor temperature control.",
          },
          {
            title: "Wiring & power supply",
            desc: "Checking wiring between indoor and outdoor units, isolators and breakers.",
          },
          {
            title: "Remote control & receiver",
            desc: "Fixing units that don't respond to the remote control.",
          },
        ],
      },
    ],
    process: [
      {
        title: "Inspection",
        desc: "We check cooling performance, pressures, airflow and drainage, and note any error codes.",
      },
      {
        title: "Service or repair",
        desc: "We carry out the agreed service or repair, protecting your walls and furniture while we work.",
      },
      {
        title: "Performance check",
        desc: "We measure the air temperature at the vents and confirm the unit drains correctly before we leave.",
      },
    ],
    brands: [
      "Daikin",
      "Panasonic",
      "Mitsubishi Electric",
      "York",
      "Midea",
      "Samsung",
      "LG",
      "Sharp",
      "Acson",
      "Gree",
    ],
    faqs: [
      {
        q: "How often should I service my aircond in Malaysia?",
        a: "For home units in daily use, a general service every 3 to 6 months and a chemical wash about once a year keeps the unit efficient and prevents water leaks.",
      },
      {
        q: "What is the difference between a general service and a chemical wash?",
        a: "A general service cleans the filters, coil surface, blower and drain tray. A chemical wash uses coil cleaner to remove deeper dirt and mould from the coils, and is recommended when cooling has dropped noticeably.",
      },
      {
        q: "Why is my aircond not cold?",
        a: "Common causes are dirty filters or coils, low refrigerant from a leak, a faulty capacitor or a failing compressor. Our technician checks airflow and pressures to find the cause.",
      },
      {
        q: "Why is my aircond leaking water inside?",
        a: "Indoor water leaks are usually caused by a clogged drain line or a dirty drain tray. Flushing the drain and cleaning the unit normally solves it.",
      },
      {
        q: "Do you service inverter airconds?",
        a: "Yes. We service and repair inverter and non-inverter units from all major brands, including inverter board diagnosis.",
      },
    ],
  },

  // ─── Aircond installation ─────────────────────────────────────────────────
  {
    slug: "aircond-installation",
    name: "AC Installation",
    h1: "Aircond Installation in Kuala Lumpur",
    metaTitle: "Aircond Installation in Kuala Lumpur | RepairKL",
    metaDescription:
      "Professional aircond installation and relocation in KL and Selangor. Wall mounting, copper piping, wiring, drainage and full test run for 1HP to 3HP units.",
    keywords: [
      "aircond installation Kuala Lumpur",
      "aircond installation KL",
      "air conditioner installation Selangor",
      "aircond relocation",
      "aircond piping",
      "inverter aircond installation",
      "aircond dismantle and install",
    ],
    asset: SERVICE_ASSETS.acInstall,
    intro:
      "A correct installation decides how well your aircond cools and how long it lasts. We install and relocate wall-mounted and inverter air-conditioners from 1HP to 3HP, including mounting, copper piping, electrical wiring, drainage and a full test run.",
    problems: [
      "New aircond installation",
      "Relocating an existing unit",
      "Replacing an old unit",
      "Extending copper piping",
      "Fixing a poor installation",
      "Dismantling before moving house",
    ],
    sections: [
      {
        title: "Planning & mounting",
        intro: "Good placement is the first step to efficient cooling.",
        items: [
          {
            title: "Site survey",
            desc: "Choosing the right indoor and outdoor positions for airflow, drainage and easy servicing.",
          },
          {
            title: "Indoor unit mounting",
            desc: "Level, secure wall mounting with a neat, sealed wall opening.",
          },
          {
            title: "Outdoor unit brackets",
            desc: "Installing the outdoor unit on strong brackets or a stand with proper clearance.",
          },
          {
            title: "Unit sizing advice",
            desc: "Recommending the right horsepower for your room size and usage.",
          },
        ],
      },
      {
        title: "Piping, wiring & drainage",
        intro:
          "Most aircond problems after installation come from poor piping or drainage work.",
        items: [
          {
            title: "Copper piping & insulation",
            desc: "Running correctly sized copper pipes with full insulation and tight flare joints.",
          },
          {
            title: "Vacuuming & leak testing",
            desc: "Vacuuming the system and pressure-testing joints before releasing refrigerant.",
          },
          {
            title: "Electrical wiring & MCB",
            desc: "Wiring the unit with the correct cable size and a dedicated circuit breaker.",
          },
          {
            title: "Condensate drainage",
            desc: "Installing drain pipes with the right slope so water never drips indoors.",
          },
        ],
      },
      {
        title: "Relocation & replacement",
        intro: "Moving house or upgrading? We handle the whole job safely.",
        items: [
          {
            title: "Dismantling",
            desc: "Pumping down the refrigerant and removing the unit without losing gas.",
          },
          {
            title: "Re-installation",
            desc: "Reinstalling your existing unit at the new location with new piping where needed.",
          },
          {
            title: "Old unit removal",
            desc: "Removing and replacing old units with new energy-efficient inverter models.",
          },
          {
            title: "Trunking & finishing",
            desc: "Neat trunking covers for exposed pipes and wiring on request.",
          },
        ],
      },
    ],
    process: [
      {
        title: "Survey & plan",
        desc: "We check the room, wall and outdoor position, and confirm the piping length and electrical supply.",
      },
      {
        title: "Install",
        desc: "We mount both units, run piping, wiring and drainage, then vacuum and leak-test the system.",
      },
      {
        title: "Test run & handover",
        desc: "We run the unit, check cooling and drainage, clean up and show you how to use and care for it.",
      },
    ],
    brands: [
      "Daikin",
      "Panasonic",
      "Mitsubishi Electric",
      "York",
      "Midea",
      "Samsung",
      "LG",
      "Sharp",
      "Acson",
      "Gree",
    ],
    faqs: [
      {
        q: "How long does an aircond installation take?",
        a: "A standard wall-mounted installation usually takes a few hours. Longer piping runs, difficult outdoor positions or multiple units take more time.",
      },
      {
        q: "What horsepower aircond do I need for my room?",
        a: "As a rough guide, 1HP suits small bedrooms, 1.5HP suits medium rooms and 2HP or more suits large living areas. Sun exposure and ceiling height also matter, so we confirm during the site survey.",
      },
      {
        q: "Can you install an aircond I bought myself?",
        a: "Yes. We install units bought from any shop, as well as relocate your existing aircond.",
      },
      {
        q: "Do you relocate airconds when moving house?",
        a: "Yes. We dismantle the unit safely by pumping down the gas, then reinstall it at your new home.",
      },
      {
        q: "Why is vacuuming important during installation?",
        a: "Vacuuming removes air and moisture from the pipes. Skipping it reduces cooling performance and can damage the compressor over time.",
      },
    ],
  },
];

export function getServiceContent(slug: string): ServiceContent | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
```

══════════════════════════════════════════
STEP 2 — src/app/(marketing)/our-services/[slug]/page.tsx
CREATE this new file (write exactly). Create the [slug] folder if needed.
══════════════════════════════════════════

```tsx
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
```

══════════════════════════════════════════
STEP 3 — src/lib/seo/index.ts
OVERWRITE the entire file with exactly this content
══════════════════════════════════════════

```ts
import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";
const BASE_URL = SITE_URL;
const SITE_NAME = "RepairKL";
const TAGLINE = "Home Appliance Repair in Kuala Lumpur";

// Existing images used for social previews and schema (no missing files).
export const DEFAULT_OG_IMAGE = "/images/hero/fridge-repairbg.jpg.jpg";
export const LOGO_PATH = "/images/logo/logo.png";

// Areas used in structured data (keep in sync with SERVICE_AREAS in serviceContent.ts)
const AREA_SERVED = [
  "Kuala Lumpur",
  "Selangor",
  "Petaling Jaya",
  "Subang Jaya",
  "Shah Alam",
  "Cheras",
  "Ampang",
  "Puchong",
];

// ─── generateMeta ─────────────────────────────────────────────────────────────
export function generateMeta(options: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const url = options.path ? `${BASE_URL}${options.path}` : BASE_URL;
  const image = options.image ?? `${BASE_URL}${DEFAULT_OG_IMAGE}`;

  return {
    title: { absolute: options.title },
    description: options.description,
    keywords: options.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: options.title,
      description: options.description,
      siteName: SITE_NAME,
      locale: "en_MY",
      images: [{ url: image, alt: options.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image],
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        },
  };
}

// ─── JSON-LD schemas ───────────────────────────────────────────────────────────
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${BASE_URL}/#business`,
    name: SITE_NAME,
    description: `${SITE_NAME} — ${TAGLINE}. Fridge, washing machine, dryer and aircond repair, servicing and installation across Kuala Lumpur and Selangor.`,
    url: BASE_URL,
    logo: `${BASE_URL}${LOGO_PATH}`,
    image: `${BASE_URL}${DEFAULT_OG_IMAGE}`,
    telephone: "+601174347814",
    email: "hello@repairkl.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kuala Lumpur",
      addressRegion: "Wilayah Persekutuan Kuala Lumpur",
      postalCode: "50000",
      addressCountry: "MY",
    },
    geo: { "@type": "GeoCoordinates", latitude: 3.139, longitude: 101.6869 },
    areaServed: AREA_SERVED.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      // Matches the hours shown on the site: Sat–Thu, 8AM–10PM
      dayOfWeek: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+601174347814",
      contactType: "customer service",
      areaServed: "MY",
      availableLanguage: ["English", "Malay"],
    },
    knowsAbout: [
      "Washing machine repair",
      "Refrigerator repair",
      "Clothes dryer repair",
      "Air conditioner servicing",
      "Air conditioner installation",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: SITE_NAME,
    url: BASE_URL,
    inLanguage: "en-MY",
    publisher: { "@id": `${BASE_URL}/#business` },
  };
}

export function serviceSchema(service: {
  name: string;
  description: string;
  url: string;
  image?: string;
  areaServed?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.description,
    url: service.url,
    ...(service.image ? { image: service.image } : {}),
    provider: {
      "@id": `${BASE_URL}/#business`,
      "@type": "HomeAndConstructionBusiness",
      name: SITE_NAME,
      url: BASE_URL,
    },
    areaServed: (service.areaServed ?? ["Kuala Lumpur", "Selangor"]).map(
      (name) => ({ "@type": "Place", name }),
    ),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}
```

══════════════════════════════════════════
STEP 4 — src/app/page.tsx
OVERWRITE the entire file with exactly this content
══════════════════════════════════════════

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { generateMeta, websiteSchema } from "@/lib/seo";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import MarketingHome from "@/components/marketing/MarketingHome";

export const metadata: Metadata = generateMeta({
  title: "Appliance Repair in Kuala Lumpur & Selangor | RepairKL",
  description:
    "Fridge, washing machine, dryer and aircond repair in Kuala Lumpur and Selangor. Verified technicians, same-day slots, a clear quote first and a labour warranty.",
  path: "/",
  keywords: [
    "appliance repair Kuala Lumpur",
    "appliance repair KL",
    "home appliance repair Selangor",
    "fridge repair Kuala Lumpur",
    "washing machine repair Kuala Lumpur",
    "dryer repair KL",
    "aircond service Kuala Lumpur",
    "aircond installation KL",
  ],
});

export default async function RootPage() {
  const session = await getSession();
  if (session) {
    const roleMap: Record<string, string> = {
      ADMIN: "/admin/dashboard",
      WORKER: "/worker/dashboard",
      SUPPORT: "/support/dashboard",
      CUSTOMER: "/home",
    };
    redirect(roleMap[session.role] ?? "/home");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
      <PublicNav />
      <main>
        <MarketingHome />
      </main>
      <PublicFooter />
    </>
  );
}
```

══════════════════════════════════════════
STEP 5 — src/app/sitemap.ts
OVERWRITE the entire file with exactly this content
══════════════════════════════════════════

```ts
import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/serviceContent";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE}/our-services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Public service landing pages (/our-services/[slug])
  const servicePages: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${BASE}/our-services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...servicePages];
}
```

══════════════════════════════════════════
STEP 6 — src/app/robots.ts
OVERWRITE the entire file with exactly this content
══════════════════════════════════════════

```ts
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/admin/",
          "/worker/",
          "/support/",
          "/home",
          "/services",
          "/search",
          "/orders",
          "/profile",
          "/booking",
          "/review",
          "/saved",
          "/notifications",
          "/login",
          "/register",
          "/otp",
          "/forgot-password",
          "/reset-password",
          "/onboarding",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
```

══════════════════════════════════════════
STEP 7 — EDIT src/app/(marketing)/about/page.tsx
Make exactly these 14 replacements. Change nothing else in this file. A FIND may be part of a longer line; replace only the matched text.
══════════════════════════════════════════

7.1) FIND:

```
    title: "About Us – RepairKL Home Services",
    description: "Learn about RepairKL — Malaysia's most trusted home service platform. Our story, mission, team and commitment to quality home services since 2021.",
```

REPLACE WITH:

```
    title: "About RepairKL – Appliance Repair Experts in Kuala Lumpur",
    description: "RepairKL is a Kuala Lumpur appliance repair company. Verified technicians for fridge, washing machine, dryer and aircond repair across KL and Selangor since 2021.",
```

7.2) FIND:

```
    keywords: ["about repairkl", "home service company Malaysia", "repairkl team", "repairkl mission"],
```

REPLACE WITH:

```
    keywords: ["about repairkl", "appliance repair company Kuala Lumpur", "appliance repair Malaysia", "repairkl technicians"],
```

7.3) FIND:

```
desc: "RepairKL launched with just 5 service workers and a vision to make home services effortless." },
```

REPLACE WITH:

```
desc: "RepairKL launched with a small team of appliance technicians and a simple goal: make appliance repair in KL honest and easy to book." },
```

7.4) FIND:

```
{ year: "2022", title: "1,000 Bookings Hit", desc: "We crossed our first major milestone and expanded to cleaning and electrical services." },
```

REPLACE WITH:

```
{ year: "2022", title: "1,000 Repairs Completed", desc: "We crossed our first major milestone and added aircond servicing and installation to our fridge, washer and dryer repairs." },
```

7.5) FIND:

```
{ year: "2023", title: "Penang Expansion", desc: "Moved into our second city with 100+ verified workers and 8 service categories." },
```

REPLACE WITH:

```
{ year: "2023", title: "Klang Valley Coverage", desc: "Expanded from Kuala Lumpur across Selangor with 100+ verified technicians." },
```

7.6) FIND:

```
desc: "We never compromise on the quality of our workers or the quality of your experience." },
```

REPLACE WITH:

```
desc: "We never compromise on the skill of our technicians or the quality of every repair." },
```

7.7) FIND:

```
desc: "We create dignified employment opportunities for skilled workers across Malaysia." },
```

REPLACE WITH:

```
desc: "We create steady, fairly paid work for skilled appliance technicians across Malaysia." },
```

7.8) FIND:

```
desc: "We keep improving our platform based on feedback from customers and workers alike." },
```

REPLACE WITH:

```
desc: "We keep improving our service based on feedback from customers and technicians alike." },
```

7.9) FIND:

```
>Fix Home Services</span>
```

REPLACE WITH:

```
>Make Appliance Repair Simple</span>
```

7.10) FIND:

```
            Since 2021, we&apos;ve been making it easy for families across Malaysia to access quality, affordable home services — with complete peace of mind.
```

REPLACE WITH:

```
            Since 2021, we&apos;ve helped households across Kuala Lumpur and Selangor get fridges, washing machines, dryers and airconds fixed properly — by verified technicians, with a clear quote first.
```

7.11) FIND:

```
<p>RepairKL was born in 2021 when our founders spent three weeks trying to find a reliable house-shifting service in Kuala Lumpur — calling dozens of providers, getting different prices every time, and ultimately having a terrible experience.</p>
```

REPLACE WITH:

```
<p>RepairKL was born in 2021 when our founders spent weeks trying to get a broken washing machine fixed in Kuala Lumpur — calling dozens of repair shops, getting different prices every time, and waiting days for technicians who never showed up.</p>
```

7.12) FIND:

```
<p>So we built one. Starting with house shifting, we quickly expanded to 8 service categories and 3 cities. Today, over 50,000 families trust RepairKL for their home service needs.</p>
```

REPLACE WITH:

```
<p>So we built one. Starting with washing machine and fridge repair, we added dryer repair, aircond servicing and aircond installation. Today, thousands of households across the Klang Valley trust RepairKL with their home appliances.</p>
```

7.13) FIND:

```
l: "Verified Workers",
```

REPLACE WITH:

```
l: "Verified Technicians",
```

7.14) FIND:

```
Join 50,000+ families who have already made the switch to smarter home services.
```

REPLACE WITH:

```
Book a verified technician for your fridge, washing machine, dryer or aircond on WhatsApp.
```

══════════════════════════════════════════
STEP 8 — EDIT src/app/(marketing)/faq/page.tsx
Make exactly these 4 replacements. Change nothing else in this file. A FIND may be part of a longer line; replace only the matched text.
══════════════════════════════════════════

8.1) FIND:

```
    title: "Frequently Asked Questions – RepairKL",
    description: "Answers to common questions about booking home services on RepairKL. Learn about pricing, cancellation, payment methods, worker verification and more.",
```

REPLACE WITH:

```
    title: "Appliance Repair FAQ – RepairKL Kuala Lumpur",
    description: "Answers about booking appliance repair in KL: same-day service, brands, parts, warranty, payment and the areas we cover for fridge, washer, dryer and aircond.",
```

8.2) FIND:

```
    keywords: ["repairkl FAQ", "home service questions", "how to book cleaning service", "repairkl pricing"],
```

REPLACE WITH:

```
    keywords: ["appliance repair FAQ", "repairkl FAQ", "appliance repair Kuala Lumpur", "washing machine repair questions", "aircond service questions"],
```

8.3) FIND:

```
            Everything you need to know about booking home services on RepairKL.
```

REPLACE WITH:

```
            Everything you need to know about booking fridge, washing machine, dryer and aircond repair with RepairKL.
```

8.4) FIND:

```
const FAQ_SECTIONS = [
  {
    category: "Booking",
    emoji: "📅",
    faqs: [
      { q: "How do I book a service?", a: "Send us a WhatsApp message at +60 11-7434 7814 with your appliance, the problem and your area. We'll confirm a time slot and assign a verified technician. It usually takes just a few minutes." },
      { q: "How far in advance do I need to book?", a: "You can book same-day services up to 1 hour in advance for many service types. For house shifting and large jobs, we recommend booking at least 24–48 hours ahead to ensure worker availability." },
      { q: "Can I book a recurring service?", a: "Yes! For cleaning and maintenance services, you can set up weekly, bi-weekly or monthly recurring bookings at a discounted rate from the RepairKL app." },
      { q: "Is there a minimum booking value?", a: "There is no minimum booking value. Some promotions may have a minimum order requirement, which is shown clearly before applying." },
    ],
  },
  {
    category: "Pricing & Payment",
    emoji: "💳",
    faqs: [
      { q: "How does pricing work?", a: "All prices are shown upfront before you confirm. You'll see the package price, any applicable taxes, and your final total. There are never hidden charges." },
      { q: "What payment methods do you accept?", a: "We accept Touch 'n Go, GrabPay, Boost, debit and credit cards (Visa/Mastercard), and cash on delivery. Payment is processed after the service is completed to your satisfaction." },
      { q: "Can I apply a promo code?", a: "Yes! Enter your promo code at checkout. First-time customers get 40% off (code: FIRST40). You can also subscribe to our newsletter for exclusive codes." },
      { q: "When am I charged?", a: "Payment is processed after the service is successfully completed. If you pay cash, you pay the worker directly at the end of the job." },
    ],
  },
  {
    category: "Workers & Quality",
    emoji: "👷",
    faqs: [
      { q: "How are your workers verified?", a: "Every worker goes through a multi-step verification: National ID check, background screening, skills assessment, in-person interview, and a trial period. Only the top 30% of applicants are approved." },
      { q: "Are your workers insured?", a: "Yes. Every RepairKL worker carries comprehensive liability insurance. If any accidental damage occurs during a service, you are fully covered. Simply report it within 24 hours via the app." },
      { q: "What if I'm not happy with the service?", a: "We offer a satisfaction guarantee. If you're not completely happy, contact us within 24 hours and we'll either re-do the service at no cost or give you a full refund." },
      { q: "Can I request the same worker again?", a: "Yes! If you leave a positive review for a worker, you can mark them as a favourite and request them for future bookings when they are available." },
    ],
  },
  {
    category: "Cancellation & Rescheduling",
    emoji: "🔄",
    faqs: [
      { q: "Can I cancel my booking?", a: "You can cancel for free up to 24 hours before your scheduled service. Cancellations within 24 hours may incur a small cancellation fee. Cancellations can be made directly in the app." },
      { q: "Can I reschedule my booking?", a: "Yes, free rescheduling is available up to 4 hours before the service. Late rescheduling is subject to worker availability." },
      { q: "What if the worker cancels?", a: "If a worker cancels, we'll immediately assign a replacement and notify you. If no replacement is available, you'll receive a full refund." },
    ],
  },
  {
    category: "Coverage & Availability",
    emoji: "📍",
    faqs: [
      { q: "Which cities do you serve?", a: "We currently operate in Kuala Lumpur, Penang, and Johor Bahru. We're expanding to Rajshahi and Khulna in 2025." },
      { q: "What areas in Kuala Lumpur are covered?", a: "We cover all major areas of Kuala Lumpur including Gulshan, Banani, Dhanmondi, Uttara, Mirpur, Mohammadpur, Wari, Rampura and surrounding areas. Enter your address at checkout to confirm availability." },
      { q: "Are services available on public holidays?", a: "Most services are available on public holidays, though availability may be limited. You can check availability for a specific date by selecting it at checkout." },
    ],
  },
];
```

REPLACE WITH:

```
const FAQ_SECTIONS = [
  {
    category: "Booking",
    emoji: "📅",
    faqs: [
      { q: "How do I book an appliance repair?", a: "Send us a WhatsApp message at +60 11-7434 7814 with your appliance, the problem and your area. We'll confirm a time slot and assign a verified technician. It usually takes just a few minutes." },
      { q: "Do you offer same-day appliance repair?", a: "Yes, for most areas in Kuala Lumpur and Selangor. Book before 12pm for the best chance of a same-day slot." },
      { q: "What details should I send when booking?", a: "Tell us the appliance type and brand, the model number if you have it, what the problem is (for example an error code, noise or leak), your area, and your preferred time. A photo or short video helps the technician prepare." },
      { q: "Can I reschedule or cancel my booking?", a: "Yes. Just message us on WhatsApp as early as possible and we'll move or cancel your appointment." },
    ],
  },
  {
    category: "Repairs & Parts",
    emoji: "🔧",
    faqs: [
      { q: "Which appliances do you repair?", a: "We repair fridges and freezers, front-load and top-load washing machines, tumble dryers and washer-dryers, and we service, repair and install air-conditioners." },
      { q: "Which brands do you repair?", a: "All major brands sold in Malaysia, including Samsung, LG, Panasonic, Sharp, Hitachi, Toshiba, Electrolux, Bosch, Daikin, Mitsubishi Electric, York, Midea and more." },
      { q: "Do you use genuine parts?", a: "We use genuine or quality-compatible replacement parts, and the technician tells you which option is being used before fitting it." },
      { q: "How long does a repair take?", a: "Many repairs are completed in a single visit, often within one to two hours. If a special part must be ordered, we'll tell you the expected time before we proceed." },
      { q: "Is it worth repairing my appliance or should I replace it?", a: "After diagnosis, the technician will give you an honest recommendation based on the appliance's age, condition and the repair needed." },
    ],
  },
  {
    category: "Cost & Payment",
    emoji: "💳",
    faqs: [
      { q: "How is the repair cost decided?", a: "Every job starts with a diagnosis. Your technician explains the fault and gives you a full quote to approve before any work begins, so there are no surprise charges." },
      { q: "What payment methods do you accept?", a: "Cash, online banking (FPX), Touch 'n Go eWallet, and credit or debit cards." },
      { q: "When do I pay?", a: "You pay after the repair is completed and tested in front of you." },
    ],
  },
  {
    category: "Technicians & Warranty",
    emoji: "🛡️",
    faqs: [
      { q: "Are your technicians verified?", a: "Yes. Every technician is background-checked, trained and insured before their first job with RepairKL." },
      { q: "Do you offer a warranty on repairs?", a: "Yes. All repairs come with a minimum 1-month warranty on labour. Replacement parts carry their own manufacturer warranty." },
      { q: "What if the same problem comes back?", a: "If the same fault returns within the warranty period, contact us on WhatsApp and we'll send a technician to fix it again at no labour cost." },
      { q: "What if something is damaged during the repair?", a: "Our technicians are insured. Report any issue to us within 24 hours and we'll resolve it." },
    ],
  },
  {
    category: "Coverage",
    emoji: "📍",
    faqs: [
      { q: "Which areas do you cover?", a: "We cover Kuala Lumpur and the Klang Valley, including KLCC, Mont Kiara, Bangsar, Cheras, Setapak, Kepong, Ampang, Petaling Jaya, Subang Jaya, Puchong, Shah Alam and Cyberjaya. Message us to confirm your exact location." },
      { q: "Are you available on weekends and public holidays?", a: "We're open Saturday to Thursday, 8AM to 10PM. Availability on public holidays may be limited, so book early." },
    ],
  },
];
```

══════════════════════════════════════════
STEP 9 — EDIT src/app/(marketing)/contact/page.tsx
Make exactly these 2 replacements. Change nothing else in this file. A FIND may be part of a longer line; replace only the matched text.
══════════════════════════════════════════

9.1) FIND:

```
    title: "Contact Us – RepairKL Home Services",
    description: "Get in touch with RepairKL. Call, email or fill in our contact form. Our support team is available Saturday–Thursday 8AM–10PM.",
```

REPLACE WITH:

```
    title: "Contact RepairKL – Appliance Repair in Kuala Lumpur",
    description: "WhatsApp or call RepairKL on +60 11-7434 7814 to book fridge, washing machine, dryer or aircond repair in KL and Selangor. Open Sat–Thu, 8AM–10PM.",
```

9.2) FIND:

```
    keywords: ["contact repairkl", "repairkl customer support", "home service help", "repairkl phone number email"],
```

REPLACE WITH:

```
    keywords: ["contact repairkl", "appliance repair Kuala Lumpur contact", "repairkl whatsapp", "repairkl phone number"],
```

══════════════════════════════════════════
STEP 10 — EDIT src/app/(marketing)/our-services/page.tsx
Make exactly these 3 replacements. Change nothing else in this file. A FIND may be part of a longer line; replace only the matched text.
══════════════════════════════════════════

10.1) FIND:

```
                        href={whatsappLink(
                          `Hi RepairKL, I have a question about ${cat.name.toLowerCase()}.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
```

REPLACE WITH:

```
                        href={`/our-services/${cat.slug}`}
```

10.2) FIND:

```
                        Ask a question
```

REPLACE WITH:

```
                        {cat.name} details
```

10.3) FIND:

```
import { bookingLink, whatsappLink } from "@/lib/whatsapp";
```

REPLACE WITH:

```
import { bookingLink } from "@/lib/whatsapp";
```

══════════════════════════════════════════
STEP 11 — EDIT src/components/marketing/MarketingHome.tsx
Make exactly these 6 replacements. Change nothing else in this file. A FIND may be part of a longer line; replace only the matched text.
══════════════════════════════════════════

11.1) FIND:

```
    href: "/our-services#fridge-repair",
```

REPLACE WITH:

```
    href: "/our-services/fridge-repair",
```

11.2) FIND:

```
    href: "/our-services#washing-machine-repair",
```

REPLACE WITH:

```
    href: "/our-services/washing-machine-repair",
```

11.3) FIND:

```
    href: "/our-services#dryer-repair",
```

REPLACE WITH:

```
    href: "/our-services/dryer-repair",
```

11.4) FIND:

```
    href: "/our-services#aircond-service",
```

REPLACE WITH:

```
    href: "/our-services/aircond-service",
```

11.5) FIND:

```
    href: "/our-services#aircond-installation",
```

REPLACE WITH:

```
    href: "/our-services/aircond-installation",
```

11.6) FIND:

```
                Appliance repair, done right the first time.
```

REPLACE WITH:

```
                Appliance repair in Kuala Lumpur, done right the first time.
```

══════════════════════════════════════════
STEP 12 — EDIT src/components/marketing/PublicFooter.tsx
Make exactly these 5 replacements. Change nothing else in this file. A FIND may be part of a longer line; replace only the matched text.
══════════════════════════════════════════

12.1) FIND:

```
  { name: "Fridge Repair", href: "/our-services#fridge-repair" },
```

REPLACE WITH:

```
  { name: "Fridge Repair", href: "/our-services/fridge-repair" },
```

12.2) FIND:

```
    href: "/our-services#washing-machine-repair",
```

REPLACE WITH:

```
    href: "/our-services/washing-machine-repair",
```

12.3) FIND:

```
  { name: "Dryer Repair", href: "/our-services#dryer-repair" },
```

REPLACE WITH:

```
  { name: "Dryer Repair", href: "/our-services/dryer-repair" },
```

12.4) FIND:

```
  { name: "Air-Conditioner Service", href: "/our-services#aircond-service" },
```

REPLACE WITH:

```
  { name: "Air-Conditioner Service", href: "/our-services/aircond-service" },
```

12.5) FIND:

```
  { name: "AC Installation", href: "/our-services#aircond-installation" },
```

REPLACE WITH:

```
  { name: "AC Installation", href: "/our-services/aircond-installation" },
```

══════════════════════════════════════════
STEP 13 — EDIT src/app/layout.tsx
Make exactly these 3 replacements. Change nothing else in this file. A FIND may be part of a longer line; replace only the matched text.
══════════════════════════════════════════

13.1) FIND:

```
    title: "RepairKL – Trusted Home Appliance Repair in KL",
    description: "Book professional appliance repair services instantly",
    images: ["/og-image.png"],
```

REPLACE WITH:

```
    title: "RepairKL – Trusted Home Appliance Repair in KL",
    description: "Fridge, washing machine, dryer and aircond repair in Kuala Lumpur and Selangor by verified technicians.",
    images: ["/images/hero/fridge-repairbg.jpg.jpg"],
```

13.2) FIND:

```
    title: "RepairKL – Appliance Repair",
    description: "Book professional appliance repair services instantly",
    images: ["/og-image.png"],
```

REPLACE WITH:

```
    title: "RepairKL – Appliance Repair in Kuala Lumpur",
    description: "Fridge, washing machine, dryer and aircond repair in Kuala Lumpur and Selangor by verified technicians.",
    images: ["/images/hero/fridge-repairbg.jpg.jpg"],
```

13.3) FIND:

```
<html lang="en" className=
```

REPLACE WITH:

```
<html lang="en-MY" className=
```

══════════════════════════════════════════
Expected result
══════════════════════════════════════════

- New indexable pages, each with its own title, description, canonical URL, OG image and JSON-LD:
  - /our-services/washing-machine-repair (the provided content)
  - /our-services/fridge-repair
  - /our-services/dryer-repair
  - /our-services/aircond-service
  - /our-services/aircond-installation
- Links to these pages:
  - On Our Services, each section's secondary button "<Service> details" opens its page.
  - The home services cards and hero picker link to the pages.
  - The footer service links point to the pages.
- About and FAQ contain only appliance-repair content for Kuala Lumpur and Selangor. FAQ JSON-LD updates automatically from the new FAQ data.
- Titles no longer repeat "| RepairKL". The home page has its own title and description.
- Social previews use an existing image. The business schema has no fake rating, and hours are Sat–Thu 8AM–10PM.
- The sitemap lists the 7 public pages plus the 5 service pages. robots.txt blocks app, login and admin routes.
- No layout or colour changes to existing pages apart from the text edits listed.
