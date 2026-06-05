import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Shifty database...");

  // ── Service Categories ──────────────────────────────
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { slug: "house-shifting" },
      update: {},
      create: {
        name: "House Shifting",
        slug: "house-shifting",
        description: "Professional house moving and relocation services",
        color: "#FD6B22",
        iconUrl: "/icons/house-shifting.svg",
        sortOrder: 1,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "home-cleaning" },
      update: {},
      create: {
        name: "Home Cleaning",
        slug: "home-cleaning",
        description: "Deep cleaning and regular maintenance",
        color: "#4FBF67",
        iconUrl: "/icons/cleaning.svg",
        sortOrder: 2,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "plumbing" },
      update: {},
      create: {
        name: "Plumbing",
        slug: "plumbing",
        description: "Fix leaks, pipes, and water systems",
        color: "#2196F3",
        iconUrl: "/icons/plumbing.svg",
        sortOrder: 3,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "electrical" },
      update: {},
      create: {
        name: "Electrical",
        slug: "electrical",
        description: "Wiring, repairs, and installations",
        color: "#FFB800",
        iconUrl: "/icons/electrical.svg",
        sortOrder: 4,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "pest-control" },
      update: {},
      create: {
        name: "Pest Control",
        slug: "pest-control",
        description: "Eliminate pests and protect your home",
        color: "#9C27B0",
        iconUrl: "/icons/pest-control.svg",
        sortOrder: 5,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "painting" },
      update: {},
      create: {
        name: "Painting",
        slug: "painting",
        description: "Interior and exterior painting services",
        color: "#FF5722",
        iconUrl: "/icons/painting.svg",
        sortOrder: 6,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "carpentry" },
      update: {},
      create: {
        name: "Carpentry",
        slug: "carpentry",
        description: "Furniture assembly and woodwork",
        color: "#795548",
        iconUrl: "/icons/carpentry.svg",
        sortOrder: 7,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "ac-service" },
      update: {},
      create: {
        name: "AC Service",
        slug: "ac-service",
        description: "Air conditioner installation and repair",
        color: "#00BCD4",
        iconUrl: "/icons/ac.svg",
        sortOrder: 8,
      },
    }),
  ]);

  // ── Services ─────────────────────────────────────────
  const houseShiftingCat = categories[0];
  const cleaningCat = categories[1];
  const electricalCat = categories[3];
  const plumbingCat = categories[2];

  await prisma.service.upsert({
    where: { slug: "house-shifting-standard" },
    update: {},
    create: {
      categoryId: houseShiftingCat.id,
      name: "House Shifting",
      slug: "house-shifting-standard",
      description: "Complete house relocation with professional movers",
      longDesc:
        "Our professional house shifting service handles everything from packing to unpacking. We ensure your belongings are safely transported to your new home.",
      basePrice: 2500,
      priceUnit: "fixed",
      rating: 4.8,
      reviewCount: 256,
      isFeatured: true,
      duration: 480,
      packages: {
        create: [
          {
            name: "Basic",
            description: "1 bedroom, ground floor",
            price: 2500,
            includes: ["2 workers", "Basic packing", "2 trucks"],
          },
          {
            name: "Standard",
            description: "2-3 bedrooms",
            price: 4500,
            includes: [
              "4 workers",
              "Full packing service",
              "3 trucks",
              "Disassembly",
            ],
            isPopular: true,
          },
          {
            name: "Premium",
            description: "4+ bedrooms",
            price: 8000,
            includes: [
              "6 workers",
              "Premium packing",
              "5 trucks",
              "Disassembly & assembly",
              "Insurance",
            ],
          },
        ],
      },
    },
  });

  await prisma.service.upsert({
    where: { slug: "home-deep-cleaning" },
    update: {},
    create: {
      categoryId: cleaningCat.id,
      name: "Deep Home Cleaning",
      slug: "home-deep-cleaning",
      description: "Thorough top-to-bottom home cleaning",
      basePrice: 800,
      priceUnit: "fixed",
      rating: 4.9,
      reviewCount: 412,
      isFeatured: true,
      duration: 240,
    },
  });

  await prisma.service.upsert({
    where: { slug: "electrical-wiring" },
    update: {},
    create: {
      categoryId: electricalCat.id,
      name: "Electrical Wiring & Repair",
      slug: "electrical-wiring",
      description: "Safe electrical installation and repairs",
      basePrice: 500,
      priceUnit: "per_hour",
      rating: 4.7,
      reviewCount: 189,
      isFeatured: true,
      duration: 120,
    },
  });

  await prisma.service.upsert({
    where: { slug: "plumbing-repair" },
    update: {},
    create: {
      categoryId: plumbingCat.id,
      name: "Plumbing Repair",
      slug: "plumbing-repair",
      description: "Fix leaks, blocks, and pipe issues fast",
      basePrice: 400,
      priceUnit: "per_hour",
      rating: 4.6,
      reviewCount: 143,
      isFeatured: false,
      duration: 90,
    },
  });

  // ── Workers ───────────────────────────────────────────
  await prisma.worker.upsert({
    where: { phone: "+8801700000001" },
    update: {},
    create: {
      fullName: "Karim Ahmed",
      phone: "+8801700000001",
      email: "karim@shifty.com",
      speciality: "House Shifting",
      bio: "10+ years experience in house moving and relocation",
      rating: 4.9,
      reviewCount: 87,
      hourlyRate: 500,
      experience: 10,
      isVerified: true,
    },
  });

  await prisma.worker.upsert({
    where: { phone: "+8801700000002" },
    update: {},
    create: {
      fullName: "Rahim Uddin",
      phone: "+8801700000002",
      email: "rahim@shifty.com",
      speciality: "Electrical",
      bio: "Certified electrician with 8 years of experience",
      rating: 4.8,
      reviewCount: 64,
      hourlyRate: 600,
      experience: 8,
      isVerified: true,
    },
  });

  // ── Demo User ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Password123!", 12);
  await prisma.user.upsert({
    where: { email: "demo@shifty.com" },
    update: {},
    create: {
      fullName: "Hannah Turin",
      email: "demo@shifty.com",
      phone: "+8801900000001",
      passwordHash: hashedPassword,
      isEmailVerified: true,
      isPhoneVerified: true,
      role: UserRole.CUSTOMER,
      address: {
        create: {
          street: "907 Valley Drive, Allentown",
          city: "Dhaka",
          state: "Dhaka",
          zipCode: "1215",
          country: "BD",
        },
      },
    },
  });

  // ── Promotions ────────────────────────────────────────
  await prisma.promotion.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      title: "Welcome Discount",
      description: "20% off on your first booking",
      discountType: "percentage",
      discountValue: 20,
      minOrderValue: 500,
      maxDiscount: 1000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
