import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createSeedVariants, seedCategories, seedProducts } from "../src/lib/seed-data";

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required before running npm run db:seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

async function main() {
  for (const category of seedCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
  }

  for (const product of seedProducts) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        name: product.name,
        slug: product.slug,
        shortSummary: product.shortSummary,
        description: product.description,
        careNotes: product.careNotes,
        status: product.status,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        publishedAt: new Date(),
        categories: {
          create: product.categorySlugs.map((slug) => ({
            category: {
              connect: { slug },
            },
          })),
        },
        images: {
          create: product.imageUrls.map((url, index) => ({
            url,
            altText: `${product.name} product image ${index + 1}`,
            sortOrder: index + 1,
          })),
        },
        prices: {
          create: Object.entries(product.prices).map(([currency, amount]) => ({
            currency: currency as "NGN" | "CAD" | "USD",
            amount,
          })),
        },
        variants: {
          create: createSeedVariants(product.slug, product.colors),
        },
      },
      update: {
        name: product.name,
        shortSummary: product.shortSummary,
        description: product.description,
        careNotes: product.careNotes,
        status: product.status,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        publishedAt: new Date(),
      },
    });

    for (const [index, url] of product.imageUrls.entries()) {
      await prisma.productImage.upsert({
        where: { id: `${createdProduct.id}-image-${index + 1}` },
        create: {
          id: `${createdProduct.id}-image-${index + 1}`,
          productId: createdProduct.id,
          url,
          altText: `${product.name} product image ${index + 1}`,
          sortOrder: index + 1,
        },
        update: {
          url,
          altText: `${product.name} product image ${index + 1}`,
          sortOrder: index + 1,
        },
      });
    }

    for (const [currency, amount] of Object.entries(product.prices)) {
      await prisma.productPrice.upsert({
        where: {
          productId_currency: {
            productId: createdProduct.id,
            currency: currency as "NGN" | "CAD" | "USD",
          },
        },
        create: {
          productId: createdProduct.id,
          currency: currency as "NGN" | "CAD" | "USD",
          amount,
        },
        update: { amount },
      });
    }

    for (const variant of createSeedVariants(product.slug, product.colors)) {
      await prisma.productVariant.upsert({
        where: {
          productId_size_colorName: {
            productId: createdProduct.id,
            size: variant.size,
            colorName: variant.colorName,
          },
        },
        create: {
          productId: createdProduct.id,
          ...variant,
        },
        update: {
          sku: variant.sku,
          colorHex: variant.colorHex,
          stock: variant.stock,
          nigeriaStock: variant.nigeriaStock,
          canadaStock: variant.canadaStock,
          isActive: variant.isActive,
        },
      });
    }
  }

  console.log(`Seeded ${seedCategories.length} categories and ${seedProducts.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
