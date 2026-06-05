import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RatingStars } from "@/components/ui";
import ServiceBookingPanel from "./ServiceBookingPanel";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug }, include: { category: true } });
  if (!service) return { title: "Service Not Found" };
  return {
    title: `${service.name} – Shifty`,
    description: service.description ?? `Book ${service.name} service at your doorstep`,
    openGraph: {
      title: service.name,
      description: service.description ?? "",
      images: service.imageUrl ? [service.imageUrl] : [],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      category: true,
      packages: { orderBy: { price: "asc" } },
      reviews: {
        include: { customer: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: { select: { reviews: true, bookings: true } },
    },
  });

  if (!service) notFound();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#8f92a1] mb-6">
        <Link href="/home" className="hover:text-[#1b1d21]">Home</Link>
        <span>/</span>
        <Link href="/services" className="hover:text-[#1b1d21]">Services</Link>
        <span>/</span>
        <span className="text-[#1b1d21] font-medium">{service.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Hero */}
          <div className="relative h-64 sm:h-80 rounded-[24px] overflow-hidden bg-gradient-to-br from-[#fff0e8] to-[#fde8d5] flex items-center justify-center">
            <span className="text-8xl">{getEmoji(service.category.name)}</span>
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: service.category.color }}>
                {service.category.name}
              </span>
            </div>
            {service.isFeatured && (
              <div className="absolute top-4 right-4">
                <span className="bg-[#fd6b22] text-white text-xs font-bold px-3 py-1.5 rounded-full">⭐ Featured</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
            <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px] mb-2">{service.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <RatingStars rating={service.rating} size={16} />
                <span className="text-sm font-bold text-[#1b1d21]">{service.rating.toFixed(1)}</span>
                <span className="text-sm text-[#8f92a1]">({service._count.reviews} reviews)</span>
              </div>
              <span className="text-sm text-[#8f92a1]">📋 {service._count.bookings}+ booked</span>
              {service.duration && <span className="text-sm text-[#8f92a1]">⏱️ {service.duration}min</span>}
            </div>
            {service.description && (
              <p className="text-[#1b1d21]/70 text-sm leading-6">{service.description}</p>
            )}
            {service.longDesc && (
              <p className="text-[#1b1d21]/60 text-sm leading-6 mt-3">{service.longDesc}</p>
            )}
          </div>

          {/* Packages */}
          {service.packages.length > 0 && (
            <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
              <h2 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px] mb-4">Service Packages</h2>
              <div className="grid gap-4">
                {service.packages.map((pkg) => (
                  <div key={pkg.id} className={`border-2 rounded-[16px] p-4 relative ${pkg.isPopular ? "border-[#fd6b22]" : "border-[#e6e8ec]"}`}>
                    {pkg.isPopular && (
                      <span className="absolute -top-3 left-4 bg-[#fd6b22] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-[#1b1d21]">{pkg.name}</h3>
                        {pkg.description && <p className="text-sm text-[#8f92a1] mt-0.5">{pkg.description}</p>}
                      </div>
                      <p className="text-xl font-bold text-[#fd6b22]">৳{Number(pkg.price).toLocaleString()}</p>
                    </div>
                    <ul className="grid grid-cols-2 gap-1.5">
                      {pkg.includes.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-[#8f92a1]">
                          <span className="text-[#4fbf67]">✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {service.reviews.length > 0 && (
            <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
              <h2 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px] mb-4">Customer Reviews</h2>
              <div className="flex items-center gap-6 mb-6 p-4 bg-[#f3f6f8] rounded-[16px]">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#1b1d21]">{service.rating.toFixed(1)}</p>
                  <RatingStars rating={service.rating} size={16} />
                  <p className="text-xs text-[#8f92a1] mt-1">{service._count.reviews} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-[#8f92a1]">{star}</span>
                      <div className="flex-1 h-1.5 bg-[#e6e8ec] rounded-full overflow-hidden">
                        <div className="h-full bg-[#fd6b22] rounded-full" style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : 7}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {service.reviews.map((r) => (
                  <div key={r.id} className="pb-4 border-b border-[#e8e6ea] last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-[#fff0e8] flex items-center justify-center font-bold text-[#fd6b22] text-sm">
                        {r.customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1b1d21]">{r.customer.fullName}</p>
                        <div className="flex items-center gap-2">
                          <RatingStars rating={r.rating} size={11} />
                          <span className="text-[10px] text-[#8f92a1]">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-[#1b1d21]/70 ml-12">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking panel - sticky */}
        <div className="lg:col-span-1">
          <ServiceBookingPanel
            serviceId={service.id}
            serviceName={service.name}
            basePrice={Number(service.basePrice)}
            priceUnit={service.priceUnit}
            packages={service.packages.map((p) => ({
              id: p.id, name: p.name, price: Number(p.price), isPopular: p.isPopular,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function getEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes("shift")) return "🏠";
  if (n.includes("clean")) return "🧹";
  if (n.includes("plumb")) return "🔧";
  if (n.includes("electr")) return "⚡";
  if (n.includes("pest")) return "🐛";
  if (n.includes("paint")) return "🎨";
  return "🏡";
}
