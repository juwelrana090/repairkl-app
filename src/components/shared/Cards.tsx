import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/ui";
import { twMerge } from "tailwind-merge";

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
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-[#fff0e8] to-[#fde8d5] overflow-hidden">
          {service.imageUrl ? (
            <Image src={service.imageUrl} alt={service.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {getCategoryEmoji(service.category?.name ?? "")}
            </div>
          )}
          {service.isFeatured && (
            <span className="absolute top-3 left-3 bg-[#fd6b22] text-white text-[10px] font-bold px-2 py-1 rounded-full">
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
          <h3 className="font-bold text-base text-[#1b1d21] tracking-[-0.3px] line-clamp-1">{service.name}</h3>
          {service.description && (
            <p className="text-sm text-[#8f92a1] line-clamp-2">{service.description}</p>
          )}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <RatingStars rating={service.rating} size={13} />
            <span className="text-xs text-[#8f92a1]">({service.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-[#fd6b22]">৳{Number(service.basePrice).toLocaleString()}</span>
              <span className="text-xs text-[#8f92a1] ml-1">/{service.priceUnit === "fixed" ? "job" : service.priceUnit.replace("_", " ")}</span>
            </div>
            <span className="text-xs font-bold text-[#fd6b22] bg-[#fff0e8] px-3 py-1.5 rounded-full">Book →</span>
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
      <div className="flex flex-col items-center gap-3 p-4 rounded-[20px] border border-[#e8e6ea] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer bg-white group">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
          style={{ background: `${color}20` }}
        >
          <span>{getCategoryEmoji(name)}</span>
        </div>
        <p className="text-xs font-bold text-[#1b1d21] text-center tracking-[-0.2px] leading-tight">{name}</p>
        {count !== undefined && (
          <p className="text-[10px] text-[#8f92a1]">{count} services</p>
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
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-[#1b1d21] text-sm tracking-[-0.3px]">{booking.service.name}</h4>
            <p className="text-xs text-[#8f92a1] mt-0.5">{booking.bookingCode}</p>
          </div>
          <span className={twMerge("px-3 py-1 rounded-full text-xs font-bold", statusColor)}>
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#8f92a1]">
          <span>📅 {new Date(booking.scheduledDate).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span>🕐 {booking.scheduledTime}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e8e6ea]">
          <span className="text-base font-bold text-[#fd6b22]">৳{Number(booking.totalAmount).toLocaleString()}</span>
          <span className="text-xs text-[#fd6b22] font-medium">View Details →</span>
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
    <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-4 flex items-start gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all">
      <div className="w-14 h-14 rounded-full bg-[#fff0e8] flex items-center justify-center text-xl font-bold text-[#fd6b22] shrink-0">
        {worker.user.fullName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h4 className="font-bold text-[#1b1d21] text-sm">{worker.user.fullName}</h4>
          <span className={twMerge("text-[10px] font-bold px-2 py-1 rounded-full", worker.isAvailable ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500")}>
            {worker.isAvailable ? "Available" : "Busy"}
          </span>
        </div>
        <p className="text-xs text-[#8f92a1] mt-0.5">{worker.speciality} • {worker.experience}yr exp</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <RatingStars rating={worker.rating} size={12} />
            <span className="text-xs text-[#8f92a1]">({worker.reviewCount})</span>
          </div>
          <span className="text-sm font-bold text-[#fd6b22]">৳{Number(worker.hourlyRate).toLocaleString()}/hr</span>
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
  color = "#fd6b22",
}: {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  color?: string;
}) {
  return (
    <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl" style={{ background: `${color}15` }}>
          {icon}
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
      <p className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">{value}</p>
      <p className="text-sm text-[#8f92a1] mt-1">{label}</p>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getCategoryEmoji(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("shift")) return "🏠";
  if (lower.includes("clean")) return "🧹";
  if (lower.includes("plumb")) return "🔧";
  if (lower.includes("electr")) return "⚡";
  if (lower.includes("pest")) return "🐛";
  if (lower.includes("paint")) return "🎨";
  if (lower.includes("carp")) return "🪵";
  if (lower.includes("ac")) return "❄️";
  return "🏡";
}
