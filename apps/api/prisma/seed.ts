import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Men's Health", slug: "mens-health" },
    { name: "Weight Management", slug: "weight-management" },
    { name: "Energy & Immunity", slug: "energy-immunity" },
    { name: "Women's Wellness", slug: "womens-wellness" },
    { name: "Brain & Focus", slug: "brain-focus" },
    { name: "Detox & Digestion", slug: "detox-digestion" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const digestion = await prisma.category.findUniqueOrThrow({
    where: { slug: "detox-digestion" },
  });

  await prisma.product.upsert({
    where: { slug: "moringa-capsules-60ct" },
    update: {},
    create: {
      name: "Moringa Capsules (60ct)",
      slug: "moringa-capsules-60ct",
      shortBenefits: "Daily energy & immune support",
      description: "Pure moringa leaf extract capsules sourced and processed for daily wellness support.",
      ingredients: "100% Moringa Oleifera leaf powder",
      usageInstructions: "Take 2 capsules daily with water, preferably after a meal.",
      benefits: "Supports energy levels, immune function, and general nutrition.",
      warnings: "Consult a doctor before use if pregnant, nursing, or on medication.",
      priceCents: 1200000, // TSh 12,000
      stock: 42,
      categoryId: digestion.id,
      images: {
        create: [{ url: "https://res.cloudinary.com/demo/moringa-1.jpg", position: 0 }],
      },
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
