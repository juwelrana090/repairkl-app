import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/shared/Cards";
import { CategoryCard } from "@/components/shared/Cards";
import { BookingCard } from "@/components/shared/Cards";
import HomeSearchBar from "./HomeSearchBar";

export const metadata: Metadata = {
  title: "Home – Shifty",
  description: "Book trusted home services near you",
};

export default async function HomePage() {
  const session = await getSession();

  const [user, categories, featuredServices, recentBookings, activeBanner] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session!.userId },
      select: { fullName: true, address: true },
    }),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { services: true } } },
    }),
    prisma.service.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      orderBy: { rating: "desc" },
      take: 6,
    }),
    prisma.booking.findMany({
      where: { customerId: session!.userId, status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] } },
      include: { service: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.banner.findFirst({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const firstName = user?.fullName.split(" ")[0] ?? "there";
  const location = user?.address?.city ?? "your area";

  return (
    <div className="flex flex-col gap-8 pb-20 md:pb-0">
      {/* Hero greeting */}
      <section>
        <div className="bg-gradient-to-br from-[#1b1d21] to-[#2d3038] rounded-[24px] p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#fd6b22]/20 rounded-full" />
          <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-[#fd6b22]/10 rounded-full" />
          <p className="text-sm text-white/60 mb-1">📍 {location}</p>
          <h1 className="text-2xl font-bold leading-tight tracking-[-0.5px]">
            Hello, {firstName}! 👋
          </h1>
          <p className="text-white/60 text-sm mt-1 mb-4">What service do you need today?</p>
          <HomeSearchBar />
        </div>
      </section>

      {/* Promo banner */}
      {activeBanner && (
        <section>
          <div className="bg-gradient-to-r from-[#fd6b22] to-[#ff9b22] rounded-[20px] p-5 text-white flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Special Offer</p>
              <p className="text-xl font-bold mt-1 tracking-tight">{activeBanner.title}</p>
              {activeBanner.subtitle && <p className="text-sm opacity-80 mt-1">{activeBanner.subtitle}</p>}
            </div>
            <div className="text-4xl">🎁</div>
          </div>
        </section>
      )}

      {/* Active bookings */}
      {recentBookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px]">Active Bookings</h2>
            <Link href="/orders" className="text-sm text-[#fd6b22] font-medium">See all →</Link>
          </div>
          <div className="grid gap-3">
            {recentBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={{
                  id: b.id,
                  bookingCode: b.bookingCode,
                  status: b.status,
                  scheduledDate: b.scheduledDate,
                  scheduledTime: b.scheduledTime,
                  totalAmount: b.totalAmount,
                  service: { name: b.service.name, category: b.service.category },
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px]">Our Services</h2>
          <Link href="/services" className="text-sm text-[#fd6b22] font-medium">View all →</Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              iconUrl={cat.iconUrl}
              color={cat.color}
              count={cat._count.services}
            />
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px]">Featured Services</h2>
          <Link href="/services?featured=true" className="text-sm text-[#fd6b22] font-medium">See all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredServices.map((s) => (
            <ServiceCard
              key={s.id}
              service={{
                id: s.id,
                slug: s.slug,
                name: s.name,
                description: s.description,
                basePrice: s.basePrice,
                priceUnit: s.priceUnit,
                rating: s.rating,
                reviewCount: s.reviewCount,
                imageUrl: s.imageUrl,
                isFeatured: s.isFeatured,
                category: s.category,
              }}
            />
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-4">
        {[
          { href: "/services?category=house-shifting", icon: "🏠", label: "House Shifting", desc: "Move your home safely", color: "#fd6b22" },
          { href: "/services?category=home-cleaning", icon: "🧹", label: "Home Cleaning", desc: "Spotless results", color: "#4fbf67" },
          { href: "/services?category=electrical", icon: "⚡", label: "Electrical", desc: "Expert electricians", color: "#ffb800" },
          { href: "/services?category=plumbing", icon: "🔧", label: "Plumbing", desc: "Fix it right away", color: "#2196f3" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5 flex items-center gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all">
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl shrink-0" style={{ background: `${item.color}20` }}>
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-sm text-[#1b1d21]">{item.label}</p>
                <p className="text-xs text-[#8f92a1]">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
