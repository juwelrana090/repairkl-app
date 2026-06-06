import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateMeta, serviceSchema } from "@/lib/seo";
import ServiceBookingPanel from "./ServiceBookingPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!service) return {};

  return generateMeta({
    title: `${service.name} | RepairKL`,
    description: service.description || `Book ${service.name} at RepairKL`,
    path: `/services/${slug}`,
    keywords: [service.name, service.category.name, "home services"],
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      packages: true,
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          rating: true,
          comment: true,
          customer: { select: { fullName: true } },
          createdAt: true,
        },
      },
    },
  });

  if (!service) redirect("/services");

  const jsonLd = serviceSchema({
    name: service.name,
    description: service.description || "",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/services/${slug}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-sm font-medium text-[#fd6b22]">
                {service.category.name}
              </span>
              <h1 className="text-2xl font-bold text-[#1b1d21] mt-1">
                {service.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#fd6b22]">
                RM{Number(service.basePrice).toLocaleString()}
              </span>
              <span className="text-sm text-[#8f92a1]">/from</span>
            </div>
          </div>

          <p className="text-[#8f92a1] mb-6 leading-relaxed">
            {service.description}
          </p>

          {service.longDesc && (
            <div className="prose prose-sm max-w-none mb-6">
              <p>{service.longDesc}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{service.rating.toFixed(1)}</span>
              <span className="text-[#8f92a1]">
                ({service.reviewCount} reviews)
              </span>
            </div>
            {service.duration && (
              <div className="text-[#8f92a1]">
                Duration: {service.duration} mins
              </div>
            )}
          </div>
        </div>

        {service.packages.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-[#1b1d21] mb-4">
              Service Packages
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {service.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`border rounded-xl p-4 ${
                    pkg.isPopular
                      ? "border-[#fd6b22] bg-[#fff0e8]"
                      : "border-[#e8e6ea]"
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="text-xs font-bold text-[#fd6b22]">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-bold text-[#1b1d21] mt-2">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-[#8f92a1] mb-3">
                    {pkg.description}
                  </p>
                  <p className="text-lg font-bold text-[#fd6b22]">
                    RM{Number(pkg.price).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {service.reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-[#1b1d21] mb-4">
              Recent Reviews
            </h2>
            <div className="space-y-4">
              {service.reviews.map((review) => (
                <div
                  key={review.createdAt.toISOString()}
                  className="border-b border-[#e8e6ea] pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {review.customer.fullName}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xs">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#8f92a1]">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ServiceBookingPanel service={service} />
    </>
  );
}
