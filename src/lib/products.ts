import { prisma } from "@/lib/db";
import { seedCategories, seedProducts } from "@/lib/seed-data";
import type { CurrencyCode } from "@/lib/store";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  shortSummary: string;
  description: string;
  categorySlugs: string[];
  imageUrl: string;
  prices: Record<CurrencyCode, number>;
  colors: { name: string; hex: string | null }[];
  sizes: string[];
};

export type StoreProductDetail = StoreProduct & {
  images: { url: string; altText: string | null }[];
  variants: {
    id: string;
    size: string;
    colorName: string;
    colorHex: string | null;
    stock: number;
    nigeriaStock: number;
    canadaStock: number;
  }[];
};

export async function getStoreCategories() {
  if (!prisma) {
    return seedCategories;
  }

  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getStoreProductBySlug(
  slug: string,
): Promise<StoreProductDetail | null> {
  if (!prisma) {
    const product = seedProducts.find((item) => item.slug === slug);

    if (!product) {
      return null;
    }

    const variants = product.colors.flatMap((color) =>
      ["6", "8", "10", "12", "14", "16", "18", "20", "22"].map((size) => ({
        id: `${product.slug}-${color.name}-${size}`,
        size,
        colorName: color.name,
        colorHex: color.hex,
        stock: 5,
        nigeriaStock: 5,
        canadaStock: 0,
      })),
    );

    return {
      id: product.slug,
      name: product.name,
      slug: product.slug,
      shortSummary: product.shortSummary,
      description: product.description,
      categorySlugs: [...product.categorySlugs],
      imageUrl: product.imageUrls[0],
      images: product.imageUrls.map((url) => ({
        url,
        altText: product.name,
      })),
      prices: product.prices,
      colors: product.colors.map((color) => ({ name: color.name, hex: color.hex })),
      sizes: ["6", "8", "10", "12", "14", "16", "18", "20", "22"],
      variants,
    };
  }

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      categories: { include: { category: true } },
      images: { orderBy: { sortOrder: "asc" } },
      prices: true,
      variants: {
        where: { isActive: true },
        orderBy: [{ colorName: "asc" }, { size: "asc" }],
      },
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortSummary: product.shortSummary ?? "",
    description: product.description,
    categorySlugs: product.categories.map(({ category }) => category.slug),
    imageUrl: product.images[0]?.url ?? "/images/treshatrendy-hero.png",
    images:
      product.images.length > 0
        ? product.images.map((image) => ({
            url: image.url,
            altText: image.altText,
          }))
        : [{ url: "/images/treshatrendy-hero.png", altText: product.name }],
    prices: Object.fromEntries(
      product.prices.map((price) => [price.currency, Number(price.amount)]),
    ) as Record<CurrencyCode, number>,
    colors: uniqueBy(
      product.variants.map((variant) => ({
        name: variant.colorName,
        hex: variant.colorHex,
      })),
      (color) => color.name,
    ),
    sizes: uniqueBy(
      product.variants.map((variant) => variant.size),
      (size) => size,
    ),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      stock: variant.stock,
      nigeriaStock: variant.nigeriaStock,
      canadaStock: variant.canadaStock,
    })),
  };
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  if (!prisma) {
    return seedProducts.map((product) => ({
      id: product.slug,
      name: product.name,
      slug: product.slug,
      shortSummary: product.shortSummary,
      description: product.description,
      categorySlugs: [...product.categorySlugs],
      imageUrl: product.imageUrls[0],
      prices: product.prices,
      colors: product.colors.map((color) => ({ name: color.name, hex: color.hex })),
      sizes: ["6", "8", "10", "12", "14", "16", "18", "20", "22"],
    }));
  }

  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      categories: { include: { category: true } },
      images: { orderBy: { sortOrder: "asc" } },
      prices: true,
      variants: {
        where: { isActive: true },
        orderBy: [{ size: "asc" }, { colorName: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortSummary: product.shortSummary ?? "",
    description: product.description,
    categorySlugs: product.categories.map(({ category }) => category.slug),
    imageUrl: product.images[0]?.url ?? "/images/treshatrendy-hero.png",
    prices: Object.fromEntries(
      product.prices.map((price) => [price.currency, Number(price.amount)]),
    ) as Record<CurrencyCode, number>,
    colors: uniqueBy(
      product.variants.map((variant) => ({
        name: variant.colorName,
        hex: variant.colorHex,
      })),
      (color) => color.name,
    ),
    sizes: uniqueBy(
      product.variants.map((variant) => variant.size),
      (size) => size,
    ),
  }));
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
