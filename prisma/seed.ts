import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding RepairKL database...");

  // ── Service Categories (5 appliance repair categories) ──────────────────────────────
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { slug: "fridge-repair" },
      update: {},
      create: {
        name: "Fridge Repair",
        slug: "fridge-repair",
        description: "Professional refrigerator repair for all brands",
        color: "#2196f3",
        sortOrder: 1,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "washing-machine-repair" },
      update: {},
      create: {
        name: "Washing Machine Repair",
        slug: "washing-machine-repair",
        description: "Fast washing machine repair and service",
        color: "#4fbf67",
        sortOrder: 2,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "dryer-repair" },
      update: {},
      create: {
        name: "Dryer Repair",
        slug: "dryer-repair",
        description: "Tumble dryer repair and maintenance",
        color: "#fd6b22",
        sortOrder: 3,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "aircond-service" },
      update: {},
      create: {
        name: "Air-Conditioner Service",
        slug: "aircond-service",
        description: "AC cleaning, servicing and gas top-up",
        color: "#00bcd4",
        sortOrder: 4,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "aircond-installation" },
      update: {},
      create: {
        name: "Air-Conditioner Installation",
        slug: "aircond-installation",
        description: "Full AC unit installation and setup",
        color: "#9c27b0",
        sortOrder: 5,
      },
    }),
  ]);

  // ── Services (5 appliance repair services) ─────────────────────────────────────────
  const services = await Promise.all([
    // 1. Fridge Repair
    prisma.service.upsert({
      where: { slug: "fridge-repair-general" },
      update: {},
      create: {
        categoryId: categories[0].id,
        name: "Fridge Repair",
        slug: "fridge-repair-general",
        description:
          "Diagnose and repair all fridge problems — not cooling, water leaking, noisy compressor and more.",
        basePrice: 120,
        priceUnit: "fixed",
        rating: 4.9,
        reviewCount: 214,
        isFeatured: true,
        duration: 60,
        packages: {
          create: [
            {
              name: "Diagnosis Only",
              price: 60,
              includes: [
                "Full inspection",
                "Written report",
                "Free quote for repair",
              ],
              isPopular: false,
            },
            {
              name: "Standard Repair",
              price: 120,
              includes: ["Diagnosis", "Labour charge", "1 month warranty"],
              isPopular: true,
            },
            {
              name: "Premium Repair",
              price: 200,
              includes: [
                "Diagnosis",
                "Labour + parts",
                "3 month warranty",
                "Free follow-up visit",
              ],
              isPopular: false,
            },
          ],
        },
      },
    }),

    // 2. Washing Machine Repair
    prisma.service.upsert({
      where: { slug: "washing-machine-repair-general" },
      update: {},
      create: {
        categoryId: categories[1].id,
        name: "Washing Machine Repair",
        slug: "washing-machine-repair-general",
        description:
          "Fix all washing machine issues — not spinning, water not draining, error codes, drum problems.",
        basePrice: 120,
        priceUnit: "fixed",
        rating: 4.8,
        reviewCount: 187,
        isFeatured: true,
        duration: 60,
        packages: {
          create: [
            {
              name: "Diagnosis Only",
              price: 60,
              includes: ["Full inspection", "Error code reading", "Free quote"],
            },
            {
              name: "Standard Repair",
              price: 120,
              includes: ["Diagnosis", "Labour charge", "1 month warranty"],
              isPopular: true,
            },
            {
              name: "Premium Repair",
              price: 220,
              includes: ["Diagnosis", "Labour + parts", "3 month warranty"],
              isPopular: false,
            },
          ],
        },
      },
    }),

    // 3. Dryer Repair
    prisma.service.upsert({
      where: { slug: "dryer-repair-general" },
      update: {},
      create: {
        categoryId: categories[2].id,
        name: "Dryer Repair",
        slug: "dryer-repair-general",
        description:
          "Dryer not heating, not turning, overheating or tripping — all brands serviced.",
        basePrice: 120,
        priceUnit: "fixed",
        rating: 4.7,
        reviewCount: 98,
        isFeatured: false,
        duration: 60,
        packages: {
          create: [
            {
              name: "Diagnosis Only",
              price: 60,
              includes: ["Full inspection", "Free quote"],
            },
            {
              name: "Standard Repair",
              price: 120,
              includes: ["Diagnosis", "Labour", "1 month warranty"],
              isPopular: true,
            },
          ],
        },
      },
    }),

    // 4. Air-Conditioner Service
    prisma.service.upsert({
      where: { slug: "aircond-service-general" },
      update: {},
      create: {
        categoryId: categories[3].id,
        name: "Air-Conditioner Service",
        slug: "aircond-service-general",
        description:
          "AC cleaning, chemical wash, gas top-up and general servicing. All brands and models.",
        basePrice: 80,
        priceUnit: "fixed",
        rating: 4.9,
        reviewCount: 432,
        isFeatured: true,
        duration: 90,
        packages: {
          create: [
            {
              name: "Basic Service",
              price: 80,
              includes: ["Filter cleaning", "Coil rinse", "Check gas level"],
            },
            {
              name: "Chemical Wash",
              price: 150,
              includes: [
                "Deep chemical cleaning",
                "Full coil wash",
                "Drain flush",
                "Gas check",
              ],
              isPopular: true,
            },
            {
              name: "Chemical Overhaul",
              price: 280,
              includes: [
                "Full dismantle",
                "Deep chemical wash",
                "Gas top-up included",
                "3 month warranty",
              ],
            },
          ],
        },
      },
    }),

    // 5. Air-Conditioner Installation
    prisma.service.upsert({
      where: { slug: "aircond-installation" },
      update: {},
      create: {
        categoryId: categories[4].id,
        name: "Air-Conditioner Installation",
        slug: "aircond-installation",
        description:
          "Full AC installation including mounting, piping, electrical wiring and testing.",
        basePrice: 350,
        priceUnit: "fixed",
        rating: 4.8,
        reviewCount: 156,
        isFeatured: true,
        duration: 180,
        packages: {
          create: [
            {
              name: "1HP Unit",
              price: 350,
              includes: [
                "Bracket mounting",
                "Up to 10ft piping",
                "Electrical connection",
                "Test run",
              ],
            },
            {
              name: "1.5HP Unit",
              price: 380,
              includes: [
                "Bracket mounting",
                "Up to 15ft piping",
                "Electrical connection",
                "Test run",
              ],
              isPopular: true,
            },
            {
              name: "2HP Unit",
              price: 420,
              includes: [
                "Bracket mounting",
                "Up to 20ft piping",
                "Electrical connection",
                "Test run",
                "MCB installation",
              ],
            },
          ],
        },
      },
    }),
  ]);

  // ── Password hash for demo users ───────────────────────────
  const hashedPassword = await bcrypt.hash("12345678Aa", 12);

  // ── Demo Users (Malaysia context) ────────────────────────────────
  await prisma.user.upsert({
    where: { email: "customer@repairkl.com" },
    update: {},
    create: {
      fullName: "Ahmad Razak",
      email: "customer@repairkl.com",
      phone: "+60123456789",
      passwordHash: hashedPassword,
      isEmailVerified: true,
      isPhoneVerified: true,
      role: UserRole.CUSTOMER,
      address: {
        create: {
          street: "123 Jalan Bukit Bintang",
          city: "Kuala Lumpur",
          state: "Wilayah Persekutuan",
          zipCode: "50000",
          country: "MY",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@repairkl.com" },
    update: {},
    create: {
      fullName: "Admin RepairKL",
      email: "admin@repairkl.com",
      phone: "+601127272745",
      passwordHash: hashedPassword,
      isEmailVerified: true,
      isPhoneVerified: true,
      role: UserRole.ADMIN,
      address: {
        create: {
          street: "45 Jalan Ampang",
          city: "Kuala Lumpur",
          state: "Wilayah Persekutuan",
          zipCode: "50000",
          country: "MY",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "worker@repairkl.com" },
    update: {},
    create: {
      fullName: "Tech Repair Sdn Bhd",
      email: "worker@repairkl.com",
      phone: "+60129876543",
      passwordHash: hashedPassword,
      isEmailVerified: true,
      isPhoneVerified: true,
      role: UserRole.WORKER,
      address: {
        create: {
          street: "789 Jalan Petaling",
          city: "Kuala Lumpur",
          state: "Wilayah Persekutuan",
          zipCode: "50000",
          country: "MY",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "support@repairkl.com" },
    update: {},
    create: {
      fullName: "Support Team",
      email: "support@repairkl.com",
      phone: "+601127272746",
      passwordHash: hashedPassword,
      isEmailVerified: true,
      isPhoneVerified: true,
      role: UserRole.SUPPORT,
      address: {
        create: {
          street: "45 Jalan Ampang",
          city: "Kuala Lumpur",
          state: "Wilayah Persekutuan",
          zipCode: "50000",
          country: "MY",
        },
      },
    },
  });

  // ── Promotions (RepairKL promo codes) ────────────────────────────────────
  await prisma.promotion.upsert({
    where: { code: "REPAIR30" },
    update: {},
    create: {
      code: "REPAIR30",
      title: "30% OFF First Repair",
      description: "Get 30% off on your first appliance repair service",
      discountType: "percentage",
      discountValue: 30,
      minOrderValue: 100,
      maxDiscount: 150,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.promotion.upsert({
    where: { code: "REPAIRKL10" },
    update: {},
    create: {
      code: "REPAIRKL10",
      title: "10% OFF Any Service",
      description: "Get 10% off on any appliance repair service",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 50,
      maxDiscount: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // ── Banner ───────────────────────────────────────────────────────────────
  await prisma.banner.upsert({
    where: { id: "default-banner" },
    update: {},
    create: {
      id: "default-banner",
      title: "30% OFF First Repair - Use code REPAIR30 at checkout",
      subtitle: "Professional appliance repair in Kuala Lumpur",
      imageUrl: "/images/banner-repair.jpg",
      linkUrl: "/register",
      isActive: true,
    },
  });

  console.log("✅ Created 5 categories");
  console.log("✅ Created 5 services");
  console.log("✅ Created demo users");
  console.log("✅ Seeding complete!");

  console.log("\n📋 Demo Accounts:");
  console.log("  customer@repairkl.com / 12345678Aa (CUSTOMER)");
  console.log("  admin@repairkl.com / 12345678Aa (ADMIN)");
  console.log("  worker@repairkl.com / 12345678Aa (WORKER)");
  console.log("  support@repairkl.com / 12345678Aa (SUPPORT)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
