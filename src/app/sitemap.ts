import type { MetadataRoute } from "next";
import { getStoreCategories, getStoreProducts } from "@/lib/products";
import { seedCategories, seedProducts } from "@/lib/seed-data";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getStoreCategories().catch(() => seedCategories),
    getStoreProducts().catch(() =>
      seedProducts.map((product) => ({
        slug: product.slug,
      })),
    ),
  ]);
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...[
      "women",
      "men",
      "children",
      "wholesale",
      "about-us",
      "terms-and-conditions",
      "return-policy",
      "shipping-policy",
      "privacy-policy",
    ].map((path) => ({
      url: `${siteUrl}/${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/shop?category=${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
