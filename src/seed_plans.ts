import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding reference plan tiers...");

  const plansData = [
    {
      name: "Trial",
      tagline: "Try the core festival tools for 3 days.",
      badge: null,
      monthlyPrice: 0,
      annualPrice: 0,
      isContactSales: false,
      durationOptions: [
        { months: 1, pricePerMonth: 0, originalPricePerMonth: null, totalPrice: 0, originalTotalPrice: null }
      ],
      featureList: [
        { label: "Trial", value: "3 days" },
        { label: "Users", value: "3" },
        { label: "Programmes", value: "5" },
        { label: "Candidates", value: "50" },
        { label: "Sub-fests", value: "1" }
      ],
      featureEntitlements: {
        maxFestivals: 1,
        maxStaffPerFestival: 3,
        canExportReports: false,
        canUseCustomDomain: false
      },
      maxFestivals: 1,
      maxStaffPerFestival: 3,
      sortOrder: 1,
      active: true
    },
    {
      name: "Basic",
      tagline: "For smaller festivals with registrations, schedules, and results.",
      badge: null,
      monthlyPrice: 1000,
      annualPrice: 9600,
      isContactSales: false,
      durationOptions: [
        { months: 3, pricePerMonth: 1000, originalPricePerMonth: 1200, totalPrice: 3000, originalTotalPrice: 3600 },
        { months: 6, pricePerMonth: 900, originalPricePerMonth: 1200, totalPrice: 5400, originalTotalPrice: 7200 },
        { months: 12, pricePerMonth: 800, originalPricePerMonth: 1200, totalPrice: 9600, originalTotalPrice: 14400 }
      ],
      featureList: [
        { label: "Users", value: "10" },
        { label: "Programmes", value: "100" },
        { label: "Candidates", value: "200" },
        { label: "Sub-fests", value: "1" },
        { label: "Storage", value: "1.0 GB" }
      ],
      featureEntitlements: {
        maxFestivals: 3,
        maxStaffPerFestival: 10,
        canExportReports: true,
        canUseCustomDomain: false
      },
      maxFestivals: 3,
      maxStaffPerFestival: 10,
      sortOrder: 2,
      active: true
    },
    {
      name: "Pro",
      tagline: "For busier festivals, with optional add-ons when you need more capacity.",
      badge: "POPULAR",
      monthlyPrice: 2166,
      annualPrice: 21588,
      isContactSales: false,
      durationOptions: [
        { months: 3, pricePerMonth: 2166, originalPricePerMonth: 3500, totalPrice: 6498, originalTotalPrice: 10500 },
        { months: 6, pricePerMonth: 1999, originalPricePerMonth: 3500, totalPrice: 11994, originalTotalPrice: 21000 },
        { months: 12, pricePerMonth: 1799, originalPricePerMonth: 3500, totalPrice: 21588, originalTotalPrice: 42000 }
      ],
      featureList: [
        { label: "Users", value: "25" },
        { label: "Programmes", value: "250" },
        { label: "Candidates", value: "1,000" },
        { label: "Sub-fests", value: "2" },
        { label: "Storage", value: "10 GB" }
      ],
      featureEntitlements: {
        maxFestivals: 10,
        maxStaffPerFestival: 25,
        canExportReports: true,
        canUseCustomDomain: true
      },
      maxFestivals: 10,
      maxStaffPerFestival: 25,
      sortOrder: 3,
      active: true
    },
    {
      name: "Ultra",
      tagline: "For large festivals that need custom capacity and hands-on support.",
      badge: null,
      monthlyPrice: 0,
      annualPrice: 0,
      isContactSales: true,
      durationOptions: [],
      featureList: [
        { label: "Users", value: "Unlimited" },
        { label: "Programmes", value: "Unlimited" },
        { label: "Candidates", value: "Unlimited" },
        { label: "Sub-fests", value: "Unlimited" },
        { label: "Storage", value: "Unlimited" }
      ],
      featureEntitlements: {
        maxFestivals: 999,
        maxStaffPerFestival: 999,
        canExportReports: true,
        canUseCustomDomain: true
      },
      maxFestivals: 999,
      maxStaffPerFestival: 999,
      sortOrder: 4,
      active: true
    }
  ];

  for (const item of plansData) {
    const existing = await prisma.planTier.findFirst({
      where: { name: { equals: item.name, mode: 'insensitive' } }
    });

    if (existing) {
      await prisma.planTier.update({
        where: { id: existing.id },
        data: {
          tagline: item.tagline,
          badge: item.badge,
          monthlyPrice: item.monthlyPrice,
          annualPrice: item.annualPrice,
          isContactSales: item.isContactSales,
          durationOptions: item.durationOptions,
          featureList: item.featureList,
          featureEntitlements: item.featureEntitlements,
          maxFestivals: item.maxFestivals,
          maxStaffPerFestival: item.maxStaffPerFestival,
          sortOrder: item.sortOrder,
          active: true
        }
      });
      console.log(`Updated plan: ${item.name}`);
    } else {
      await prisma.planTier.create({
        data: {
          name: item.name,
          tagline: item.tagline,
          badge: item.badge,
          monthlyPrice: item.monthlyPrice,
          annualPrice: item.annualPrice,
          isContactSales: item.isContactSales,
          durationOptions: item.durationOptions,
          featureList: item.featureList,
          featureEntitlements: item.featureEntitlements,
          maxFestivals: item.maxFestivals,
          maxStaffPerFestival: item.maxStaffPerFestival,
          sortOrder: item.sortOrder,
          active: true
        }
      });
      console.log(`Created plan: ${item.name}`);
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
