import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getActiveCurrency } from "@/lib/currency";
import {
  getAvailabilityMessage,
  getMarketStock,
} from "@/lib/regional-stock";
import type { CurrencyCode } from "@/lib/store";
import {
  getChristmasSalePrice,
  isChristmasSaleActive,
} from "@/lib/christmas-sale";

const CART_COOKIE = "treshatrendy_cart";

export type CartLine = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  imageUrl: string;
  size: string;
  colorName: string;
  colorHex: string | null;
  quantity: number;
  stock: number;
  nigeriaStock: number;
  canadaStock: number;
  availabilityLabel: string;
  availabilityDetail: string;
  availabilityTone: "ready" | "delayed" | "unavailable";
  originalUnitPrice: number;
  unitPrice: number;
  lineTotal: number;
};

export type CartSummary = {
  id: string | null;
  currency: CurrencyCode;
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  saleActive: boolean;
};

async function getCartSessionId(createIfMissing: boolean) {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;

  if (existing || !createIfMissing) {
    return existing ?? null;
  }

  const sessionId = randomBytes(24).toString("base64url");
  cookieStore.set(CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return sessionId;
}

export async function getOrCreateCart() {
  if (!prisma) {
    throw new Error("Database is not configured.");
  }

  const sessionId = await getCartSessionId(true);
  const currency = await getActiveCurrency();

  return prisma.cart.upsert({
    where: {
      sessionId: sessionId ?? "",
    },
    update: {
      currency,
    },
    create: {
      sessionId,
      currency,
    },
  });
}

export async function getCartSummary(
  currencyOverride?: CurrencyCode,
): Promise<CartSummary> {
  const currency = currencyOverride ?? (await getActiveCurrency());
  const now = new Date();
  const saleActive = isChristmasSaleActive(now);

  if (!prisma) {
    return {
      id: null,
      currency,
      lines: [],
      subtotal: 0,
      itemCount: 0,
      saleActive,
    };
  }

  const sessionId = await getCartSessionId(false);

  if (!sessionId) {
    return {
      id: null,
      currency,
      lines: [],
      subtotal: 0,
      itemCount: 0,
      saleActive,
    };
  }

  const cart = await prisma.cart.findUnique({
    where: {
      sessionId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
                take: 1,
              },
              prices: true,
            },
          },
          variant: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!cart) {
    return {
      id: null,
      currency,
      lines: [],
      subtotal: 0,
      itemCount: 0,
      saleActive,
    };
  }

  const lines = cart.items.map((item) => {
    const price = item.product.prices.find(
      (productPrice) => productPrice.currency === currency,
    );
    const originalUnitPrice = Number(price?.amount ?? 0);
    const unitPrice = getChristmasSalePrice(originalUnitPrice, currency, now);
    const marketStock = getMarketStock(item.variant, currency);
    const availability = getAvailabilityMessage(item.variant, currency);

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      slug: item.product.slug,
      imageUrl: item.product.images[0]?.url ?? "/images/treshatrendy-hero.png",
      size: item.variant.size,
      colorName: item.variant.colorName,
      colorHex: item.variant.colorHex,
      quantity: item.quantity,
      stock: marketStock,
      nigeriaStock: item.variant.nigeriaStock,
      canadaStock: item.variant.canadaStock,
      availabilityLabel: availability.label,
      availabilityDetail: availability.detail,
      availabilityTone: availability.tone,
      originalUnitPrice,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  return {
    id: cart.id,
    currency,
    lines,
    subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    saleActive,
  };
}

export async function clearCurrentCart() {
  if (!prisma) {
    return;
  }

  const sessionId = await getCartSessionId(false);

  if (!sessionId) {
    return;
  }

  const cart = await prisma.cart.findUnique({
    where: {
      sessionId,
    },
    select: {
      id: true,
    },
  });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });
}
