// Central map of RepairKL icon + photo assets (files live in /public/images).
// Import from here instead of hard-coding paths or emojis in components.

const ICONS = "/images/icons";
const PHOTOS = "/images/services";

export type ServiceAsset = {
  icon: string;
  image: string;
  alt: string;
};

export const SERVICE_ASSETS = {
  fridge: {
    icon: `${ICONS}/refrigerator.png`,
    image: `${PHOTOS}/Fridge-Repair.jpg`,
    alt: "Technician repairing a refrigerator",
  },
  washer: {
    icon: `${ICONS}/washing-machine.png`,
    image: `${PHOTOS}/Washing-Machine-Repair.jpg`,
    alt: "Technician repairing a front-load washing machine",
  },
  dryer: {
    icon: `${ICONS}/washing-machine.png`,
    image: `${PHOTOS}/Dryer-Repair.webp`,
    alt: "Technician testing a clothes dryer",
  },
  acService: {
    icon: `${ICONS}/maintenance.png`,
    image: `${PHOTOS}/Air-Conditioner-Service.webp`,
    alt: "Technician servicing a wall-mounted air conditioner",
  },
  acInstall: {
    icon: `${ICONS}/installation.png`,
    image: `${PHOTOS}/AC-Installation.webp`,
    alt: "Technician installing an air conditioner",
  },
} satisfies Record<string, ServiceAsset>;

export const FEATURE_ICONS = {
  booking: `${ICONS}/booking.png`, // calendar with check
  verified: `${ICONS}/verified.png`, // green shield with check
  secured: `${ICONS}/secured.png`, // green shield with plus
  badge: `${ICONS}/social-media.png`, // blue verified badge
  wallet: `${ICONS}/wallet.png`, // wallet
} as const;

export const DEFAULT_SERVICE_ICON = `${ICONS}/maintenance.png`;

/** Match a service/category name or slug to its icon + photo. Returns null if unknown. */
export function getServiceAssets(nameOrSlug: string): ServiceAsset | null {
  const s = nameOrSlug.toLowerCase();
  if (
    s.includes("fridge") ||
    s.includes("refrigerator") ||
    s.includes("freezer")
  )
    return SERVICE_ASSETS.fridge;
  if (s.includes("wash")) return SERVICE_ASSETS.washer;
  if (s.includes("dryer")) return SERVICE_ASSETS.dryer;
  if (s.includes("install")) return SERVICE_ASSETS.acInstall;
  if (
    s.includes("aircond") ||
    s.includes("air-cond") ||
    s.includes("air cond") ||
    /\bac\b/.test(s)
  ) {
    return SERVICE_ASSETS.acService;
  }
  return null;
}

/** Icon path for any service/category name, with a safe fallback. */
export function getServiceIcon(nameOrSlug: string): string {
  return getServiceAssets(nameOrSlug)?.icon ?? DEFAULT_SERVICE_ICON;
}
