import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "Bebes", slug: "bebes", sortOrder: 10 },
  { name: "Nino", slug: "nino", sortOrder: 20 },
  { name: "Nina", slug: "nina", sortOrder: 30 },
];

const defaultProducts = [
  {
    title: "Body Nubes Suaves",
    slug: "body-nubes",
    description: "Algodon respirable para bebes, ideal para uso diario.",
    priceCents: 1099,
    categorySlug: "bebes",
    swatch: "body",
    images: [
      {
        publicId: "body_nubes_suaves",
        alt: "Body de bebe en algodon suave color claro",
      },
    ],
    sortOrder: 10,
    variants: [
      { size: "0-3M", stock: 8 },
      { size: "3-6M", stock: 6 },
      { size: "6-9M", stock: 4 },
    ],
  },
  {
    title: "Jardinera Lila",
    slug: "jardinera-lila",
    description: "Look comodo con broches y tono purpura pastel.",
    priceCents: 1899,
    categorySlug: "bebes",
    swatch: "jardinera",
    images: [
      {
        publicId: "jardinera_lila",
        alt: "Jardinera de bebe en tono lila pastel",
      },
    ],
    sortOrder: 20,
    variants: [
      { size: "6-9M", stock: 5 },
      { size: "9-12M", stock: 5 },
      { size: "12-18M", stock: 3 },
    ],
  },
  {
    title: "Poleron Aventura",
    slug: "poleron-aventura",
    description: "Abrigo liviano para juegos, colegio y tardes frescas.",
    priceCents: 2299,
    categorySlug: "nino",
    swatch: "poleron",
    images: [
      {
        publicId: "poleron_aventura",
        alt: "Poleron infantil para nino en tonos neutros",
      },
    ],
    sortOrder: 30,
    variants: [
      { size: "2", stock: 4 },
      { size: "4", stock: 7 },
      { size: "6", stock: 7 },
      { size: "8", stock: 5 },
      { size: "10", stock: 3 },
    ],
  },
  {
    title: "Jeans Flex Gris",
    slug: "jeans-flex",
    description: "Pretina elasticada y calce resistente para moverse facil.",
    priceCents: 2099,
    categorySlug: "nino",
    swatch: "jeans",
    images: [
      {
        publicId: "jeans_flex_gris",
        alt: "Jeans gris infantil con pretina elasticada",
      },
    ],
    sortOrder: 40,
    variants: [
      { size: "4", stock: 6 },
      { size: "6", stock: 6 },
      { size: "8", stock: 5 },
      { size: "10", stock: 4 },
      { size: "12", stock: 3 },
    ],
  },
  {
    title: "Vestido Rosita",
    slug: "vestido-rosita",
    description: "Tela suave con vuelo ligero para cumpleanos o paseos.",
    priceCents: 2499,
    categorySlug: "nina",
    swatch: "vestido",
    images: [
      {
        publicId: "vestido_rosita",
        alt: "Vestido rosado infantil con tela suave",
      },
    ],
    sortOrder: 50,
    variants: [
      { size: "2", stock: 4 },
      { size: "4", stock: 6 },
      { size: "6", stock: 5 },
      { size: "8", stock: 3 },
    ],
  },
  {
    title: "Set Florencia",
    slug: "set-florencia",
    description: "Polera y calza combinadas en rosado y beige.",
    priceCents: 2699,
    categorySlug: "nina",
    swatch: "set",
    images: [
      {
        publicId: "set_florencia",
        alt: "Set infantil de polera y calza en rosado y beige",
      },
    ],
    sortOrder: 60,
    variants: [
      { size: "4", stock: 5 },
      { size: "6", stock: 5 },
      { size: "8", stock: 4 },
      { size: "10", stock: 3 },
      { size: "12", stock: 2 },
    ],
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for seed.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { passwordHash, isActive: true },
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "ADMIN",
    },
  });

  const categories = new Map<string, number>();

  for (const category of defaultCategories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });

    categories.set(savedCategory.slug, savedCategory.id);
  }

  for (const product of defaultProducts) {
    const categoryId = categories.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Category ${product.categorySlug} was not seeded.`);
    }

    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        description: product.description,
        priceCents: product.priceCents,
        currency: "USD",
        categoryId,
        swatch: product.swatch,
        sortOrder: product.sortOrder,
        isActive: true,
      },
      create: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        currency: "USD",
        categoryId,
        swatch: product.swatch,
        sortOrder: product.sortOrder,
        isActive: true,
      },
    });

    await prisma.productVariant.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prisma.productVariant.createMany({
      data: product.variants.map((variant) => ({
        productId: savedProduct.id,
        size: variant.size,
        stock: variant.stock,
        isActive: true,
      })),
    });

    await prisma.productImage.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prisma.productImage.createMany({
      data: product.images.map((image, index) => ({
        productId: savedProduct.id,
        publicId: image.publicId,
        alt: image.alt,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
