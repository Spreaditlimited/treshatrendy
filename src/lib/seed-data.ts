import { categories, sizes } from "@/lib/store";

export const seedCategories = categories.map((category, index) => ({
  ...category,
  sortOrder: index + 1,
  isActive: true,
}));

export const seedProducts = [
  {
    name: "Ankara Midi Dress",
    slug: "ankara-midi-dress",
    shortSummary: "A polished midi silhouette cut from vibrant Ankara fabric.",
    description:
      "A versatile African print midi dress designed for weddings, brunch, celebrations, and elevated everyday styling.",
    careNotes: "Hand wash cold or dry clean. Hang to dry. Iron inside out on low heat.",
    status: "PUBLISHED",
    seoTitle: "Ankara Midi Dress | Treshatrendy",
    seoDescription:
      "Shop a vibrant Ankara midi dress from Treshatrendy with sizes 6 to 22 and prices in NGN, CAD, and USD.",
    categorySlugs: ["dresses"],
    imageUrls: ["/images/treshatrendy-hero.png"],
    prices: {
      NGN: 85000,
      CAD: 125,
      USD: 92,
    },
    colors: [
      { name: "Berry Print", hex: "#8a2442" },
      { name: "Teal Print", hex: "#127777" },
    ],
  },
  {
    name: "Adire Wrap Top",
    slug: "adire-wrap-top",
    shortSummary: "A flattering wrap top with a crisp Adire-inspired finish.",
    description:
      "A statement top for pairing with denim, skirts, tailored trousers, or matching African print separates.",
    careNotes: "Machine wash gentle with similar colors. Do not bleach. Steam lightly.",
    status: "PUBLISHED",
    seoTitle: "Adire Wrap Top | Treshatrendy",
    seoDescription:
      "Shop the Adire wrap top from Treshatrendy with manual NGN, CAD, and USD pricing.",
    categorySlugs: ["tops"],
    imageUrls: ["/images/treshatrendy-hero.png"],
    prices: {
      NGN: 42000,
      CAD: 68,
      USD: 50,
    },
    colors: [
      { name: "Indigo", hex: "#243f70" },
      { name: "Ivory", hex: "#f4eadc" },
    ],
  },
  {
    name: "Kente Co-ord Set",
    slug: "kente-coord-set",
    shortSummary: "A coordinated top and bottom set for effortless dressing.",
    description:
      "A bold two-piece set made for travel, events, dinner plans, and easy styling across seasons.",
    careNotes: "Dry clean recommended. Store folded or on padded hangers.",
    status: "PUBLISHED",
    seoTitle: "Kente Co-ord Set | Treshatrendy",
    seoDescription:
      "Shop a Kente-inspired co-ord set from Treshatrendy with size and color stock tracking.",
    categorySlugs: ["sets", "bottoms"],
    imageUrls: ["/images/treshatrendy-hero.png"],
    prices: {
      NGN: 110000,
      CAD: 165,
      USD: 122,
    },
    colors: [
      { name: "Gold Mix", hex: "#d09a2d" },
      { name: "Charcoal Mix", hex: "#2c2926" },
    ],
  },
] as const;

export function createSeedVariants(productSlug: string, colors: readonly { name: string; hex: string }[]) {
  return colors.flatMap((color) =>
    sizes.map((size, sizeIndex) => ({
      sku: `${productSlug}-${color.name.toLowerCase().replaceAll(" ", "-")}-${size}`,
      size,
      colorName: color.name,
      colorHex: color.hex,
      stock: Math.max(2, 8 - (sizeIndex % 4)),
      nigeriaStock: Math.max(2, 8 - (sizeIndex % 4)),
      canadaStock: sizeIndex % 3 === 0 ? 2 : 0,
      isActive: true,
    })),
  );
}
