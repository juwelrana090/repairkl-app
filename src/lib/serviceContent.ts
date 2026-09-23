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
