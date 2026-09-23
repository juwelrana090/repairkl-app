import AppIcon from "@/components/ui/AppIcon";
import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/ui";
import { twMerge } from "tailwind-merge";
import { getServiceAssets, getServiceIcon } from "@/lib/brandAssets";

// ─── Service Card ─────────────────────────────────────────────────────────────

export interface ServiceCardData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number | string;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  isFeatured: boolean;
  category?: { name: string; color: string };
}

export function ServiceCard({ service }: { service: ServiceCardData }) {
  return (
    <Link href={`/services/${service.slug}`}>
      <div className="bg-white rounded-[20px] border border-[#ddddee] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-[#eaf0f8] to-[#dde6f3] overflow-hidden">
          {(() => {
            const fallback = getServiceAssets(service.category?.name ?? service.name);
            const src = service.imageUrl ?? fallback?.image;
            return src ? (
              <Image src={src} alt={service.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image src={getServiceIcon(service.name)} alt="" width={72} height={72} className="w-18 h-18 object-contain" />
              </div>
            );
          })()}
          {service.isFeatured && (
            <span className="absolute top-3 left-3 bg-[#034795] text-white text-[10px] font-bold px-2 py-1 rounded-full">
              Featured
            </span>
          )}
          {service.category && (
            <span
              className="absolute top-3 right-3 text-white text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ background: service.category.color }}
            >
              {service.category.name}
            </span>
          )}
        </div>
        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-bold text-base text-[#001353] tracking-[-0.3px] line-clamp-1">{service.name}</h3>
          {service.description && (
            <p className="text-sm text-[#5b6480] line-clamp-2">{service.description}</p>
          )}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <RatingStars rating={service.rating} size={13} />
            <span className="text-xs text-[#5b6480]">({service.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-[#034795]">RM{Number(service.basePrice).toLocaleString()}</span>
              <span className="text-xs text-[#5b6480] ml-1">/{service.priceUnit === "fixed" ? "job" : service.priceUnit.replace("_", " ")}</span>
            </div>
            <span className="text-xs font-bold text-[#034795] bg-[#eaf0f8] px-3 py-1.5 rounded-full">Book →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

export function CategoryCard({
  name,
  slug,
  iconUrl,
  color,
  count,
}: {
  name: string;
  slug: string;
  iconUrl?: string | null;
  color: string;
  count?: number;
}) {
  return (
    <Link href={`/services?category=${slug}`}>
      <div className="flex flex-col items-center gap-3 p-4 rounded-[20px] border border-[#ddddee] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer bg-white group">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
          style={{ background: `${color}20` }}
        >
          <Image src={getServiceIcon(slug || name)} alt="" width={36} height={36} className="w-9 h-9 object-contain" />
        </div>
        <p className="text-xs font-bold text-[#001353] text-center tracking-[-0.2px] leading-tight">{name}</p>
        {count !== undefined && (
          <p className="text-[10px] text-[#5b6480]">{count} services</p>
        )}
      </div>
    </Link>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

export function BookingCard({
  booking,
}: {
  booking: {
    id: string;
    bookingCode: string;
    status: string;
    scheduledDate: Date;
    scheduledTime: string;
    totalAmount: number | string;
    service: { name: string; category?: { name: string; color: string } | null };
  };
}) {
  const statusColors: Record<string, string> = {
    PENDING: "text-amber-600 bg-amber-50",
    CONFIRMED: "text-blue-600 bg-blue-50",
    IN_PROGRESS: "text-orange-600 bg-orange-50",
    COMPLETED: "text-green-600 bg-green-50",
    CANCELLED: "text-red-500 bg-red-50",
  };
  const statusColor = statusColors[booking.status] ?? "text-gray-600 bg-gray-50";

  return (
    <Link href={`/orders/${booking.id}`}>
      <div className="bg-white rounded-[20px] border border-[#ddddee] p-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-[#001353] text-sm tracking-[-0.3px]">{booking.service.name}</h4>
            <p className="text-xs text-[#5b6480] mt-0.5">{booking.bookingCode}</p>
          </div>
          <span className={twMerge("px-3 py-1 rounded-full text-xs font-bold", statusColor)}>
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#5b6480]">
          <span className="inline-flex items-center gap-1.5"><AppIcon name="calendar" className="w-3.5 h-3.5" /> {new Date(booking.scheduledDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1.5"><AppIcon name="clock" className="w-3.5 h-3.5" /> {booking.scheduledTime}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#ddddee]">
          <span className="text-base font-bold text-[#034795]">RM{Number(booking.totalAmount).toLocaleString()}</span>
          <span className="text-xs text-[#034795] font-medium">View Details →</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Worker Card ──────────────────────────────────────────────────────────────

export function WorkerCard({
  worker,
}: {
  worker: {
    id: string;
    speciality: string;
    rating: number;
    reviewCount: number;
    hourlyRate: number | string;
    experience: number;
    isAvailable: boolean;
    user: { fullName: string; avatarUrl?: string | null };
  };
}) {
  return (
    <div className="bg-white rounded-[20px] border border-[#ddddee] p-4 flex items-start gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all">
      <div className="w-14 h-14 rounded-full bg-[#eaf0f8] flex items-center justify-center text-xl font-bold text-[#034795] shrink-0">
        {worker.user.fullName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h4 className="font-bold text-[#001353] text-sm">{worker.user.fullName}</h4>
          <span className={twMerge("text-[10px] font-bold px-2 py-1 rounded-full", worker.isAvailable ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500")}>
            {worker.isAvailable ? "Available" : "Busy"}
          </span>
        </div>
        <p className="text-xs text-[#5b6480] mt-0.5">{worker.speciality} • {worker.experience}yr exp</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <RatingStars rating={worker.rating} size={12} />
            <span className="text-xs text-[#5b6480]">({worker.reviewCount})</span>
          </div>
          <span className="text-sm font-bold text-[#034795]">RM{Number(worker.hourlyRate).toLocaleString()}/hr</span>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  change,
  changeType = "neutral",
  color = "#034795",
}: {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  color?: string;
}) {
  return (
    <div className="bg-white rounded-[20px] border border-[#ddddee] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl" style={{ background: `${color}15`, color }}>
          <AppIcon name={icon} className="w-6 h-6" />
        </div>
        {change && (
          <span className={twMerge("text-xs font-bold px-2 py-1 rounded-full",
            changeType === "up" ? "text-green-600 bg-green-50" :
            changeType === "down" ? "text-red-500 bg-red-50" :
            "text-gray-600 bg-gray-50"
          )}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">{value}</p>
      <p className="text-sm text-[#5b6480] mt-1">{label}</p>
    </div>
  );
}
