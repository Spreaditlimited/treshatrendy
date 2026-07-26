"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";
import { getActiveCurrency } from "@/lib/currency";
import { getMarketStock } from "@/lib/regional-stock";

export type CartActionState = {
  error?: string;
};

function readString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function readQuantity(formData: FormData) {
  const quantity = Number(readString(formData, "quantity") || "1");
  return Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
}

async function addVariantToCart(formData: FormData) {
  if (!prisma) {
    return "The database is not configured yet.";
  }

  const variantId = readString(formData, "variantId");
  const quantity = readQuantity(formData);
  const currency = await getActiveCurrency();

  if (!variantId) {
    return "Choose a size and colour before adding to cart.";
  }

  const variant = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
    include: {
      product: true,
    },
  });

  if (!variant || !variant.isActive || variant.product.status !== "PUBLISHED") {
    return "This option is no longer available.";
  }

  const marketStock = getMarketStock(variant, currency);

  if (marketStock < quantity) {
    return `Only ${marketStock} item${marketStock === 1 ? "" : "s"} available for your selected market.`;
  }

  const cart = await getOrCreateCart();
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
  });

  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (nextQuantity > marketStock) {
    return `Only ${marketStock} item${marketStock === 1 ? "" : "s"} available for your selected market.`;
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
    update: {
      quantity: nextQuantity,
    },
    create: {
      cartId: cart.id,
      productId: variant.productId,
      variantId,
      quantity,
    },
  });

  revalidatePath("/cart");
  return null;
}

export async function addToCartAction(
  _previousState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const error = await addVariantToCart(formData);

  if (error) {
    return { error };
  }

  redirect("/cart");
}

export async function buyNowAction(
  _previousState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const error = await addVariantToCart(formData);

  if (error) {
    return { error };
  }

  redirect("/checkout");
}

export async function updateCartItemAction(formData: FormData) {
  if (!prisma) {
    redirect("/cart");
  }

  const itemId = readString(formData, "itemId");
  const quantity = readQuantity(formData);

  const item = await prisma.cartItem.findUnique({
    where: {
      id: itemId,
    },
    include: {
      variant: true,
    },
  });

  if (item) {
    const currency = await getActiveCurrency();
    const marketStock = getMarketStock(item.variant, currency);

    await prisma.cartItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity: Math.min(quantity, marketStock),
      },
    });
  }

  revalidatePath("/cart");
  redirect("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  if (!prisma) {
    redirect("/cart");
  }

  const itemId = readString(formData, "itemId");

  if (itemId) {
    await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
      },
    });
  }

  revalidatePath("/cart");
  redirect("/cart");
}
