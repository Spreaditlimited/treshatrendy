export const storeConfig = {
  name: "Treshatrendy",
  tagline: "African fashion tailored for everyday elegance.",
  markets: ["Nigeria", "Canada", "United States"],
  defaultCurrency: "USD",
} as const;

export const currencies = [
  { code: "NGN", label: "Naira", symbol: "₦", countryDefault: "Nigeria" },
  { code: "CAD", label: "Canadian dollar", symbol: "$", countryDefault: "Canada" },
  { code: "USD", label: "US dollar", symbol: "$", countryDefault: "Other countries" },
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];

export const categories = [
  {
    name: "Tops",
    slug: "tops",
    description: "Statement blouses, wrap tops, and easy daily pieces.",
  },
  {
    name: "Dresses",
    slug: "dresses",
    description: "Occasion-ready silhouettes in vibrant African prints.",
  },
  {
    name: "Jumpsuits",
    slug: "jumpsuits",
    description: "One-piece silhouettes for polished everyday and occasion styling.",
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    description: "Skirts and trousers designed for polished styling.",
  },
  {
    name: "Sets",
    slug: "sets",
    description: "Coordinated looks made for effortless dressing.",
  },
  {
    name: "Kids",
    slug: "kids",
    description: "Bright, comfortable outfits for younger trendsetters.",
  },
  {
    name: "Men",
    slug: "men",
    description: "Modern menswear with rich tailoring details.",
  },
] as const;

export const sizes = ["6", "8", "10", "12", "14", "16", "18", "20", "22"] as const;

export const launchFeatures = [
  "Manual NGN, CAD, and USD pricing",
  "Stock by size and color",
  "Multiple product photos",
  "PayPal checkout",
  "SEO-ready product pages",
  "One-admin launch dashboard",
] as const;

export function formatPrice(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}
