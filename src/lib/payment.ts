import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import type { CartSummary } from "@/lib/cart";
import type { CurrencyCode } from "@/lib/store";
import type { ShippingOption } from "@/lib/shipping";

export type CheckoutInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  shippingZone?: string;
};

export function clean(value: unknown) {
  return String(value ?? "").trim();
}

export function createOrderNumber() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `TT-${yyyymmdd}-${suffix}`;
}

export function validateCheckoutInput(input: CheckoutInput) {
  const required = [
    ["firstName", input.firstName],
    ["lastName", input.lastName],
    ["email", input.email],
    ["line1", input.line1],
    ["city", input.city],
    ["postalCode", input.postalCode],
    ["countryCode", input.countryCode],
    ["shippingZone", input.shippingZone],
  ];

  const missing = required.find(([, value]) => !clean(value));

  if (missing) {
    return "Complete all required checkout fields.";
  }

  if (!clean(input.email).includes("@")) {
    return "Enter a valid email address.";
  }

  if (clean(input.countryCode).length !== 2) {
    return "Use a 2-letter country code, for example CA, US, or NG.";
  }

  return null;
}

export function getPaymentProvider(currency: CurrencyCode) {
  return currency === "NGN" ? "PAYSTACK" : "STRIPE";
}

export function toMinorUnit(amount: number) {
  return Math.round(amount * 100);
}

export async function createPendingOrder({
  cart,
  input,
  shipping,
}: {
  cart: CartSummary;
  input: CheckoutInput;
  shipping: ShippingOption;
}) {
  if (!prisma) {
    throw new Error("The database is not configured yet.");
  }

  const orderNumber = createOrderNumber();
  const total = cart.subtotal + shipping.amount;

  return prisma.order.create({
    data: {
      orderNumber,
      email: clean(input.email).toLowerCase(),
      firstName: clean(input.firstName),
      lastName: clean(input.lastName),
      phone: clean(input.phone) || null,
      currency: cart.currency,
      subtotalAmount: cart.subtotal,
      shippingAmount: shipping.amount,
      totalAmount: total,
      status: "PENDING_PAYMENT",
      paymentProvider: getPaymentProvider(cart.currency),
      paymentStatus: "PENDING",
      addresses: {
        create: {
          type: "SHIPPING",
          firstName: clean(input.firstName),
          lastName: clean(input.lastName),
          line1: clean(input.line1),
          line2: clean(input.line2) || null,
          city: clean(input.city),
          state: clean(input.state) || shipping.label,
          postalCode: clean(input.postalCode),
          countryCode: shipping.countryCode,
          phone: clean(input.phone) || null,
        },
      },
      items: {
        create: cart.lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          productName: line.name,
          productSlug: line.slug,
          size: line.size,
          colorName: line.colorName,
          quantity: line.quantity,
          unitPriceAmount: line.unitPrice,
          lineTotalAmount: line.lineTotal,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

export async function markOrderPaid(orderId: string, paymentData: {
  stripePaymentIntentId?: string | null;
  paystackReference?: string | null;
}) {
  if (!prisma) {
    throw new Error("The database is not configured yet.");
  }

  const db = prisma;
  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.paymentStatus === "PAID") {
    return order;
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
        stripePaymentIntentId: paymentData.stripePaymentIntentId ?? undefined,
        paystackReference: paymentData.paystackReference ?? undefined,
        paidAt: new Date(),
      },
    });

    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({
        where: {
          id: item.variantId,
        },
        select: {
          stock: true,
          nigeriaStock: true,
          canadaStock: true,
        },
      });

      if (!variant) {
        throw new Error("Product variant not found.");
      }

      const usesLegacyStock =
        variant.nigeriaStock === 0 && variant.canadaStock === 0 && variant.stock > 0;

      if (usesLegacyStock) {
        await tx.productVariant.update({
          where: {
            id: item.variantId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
            nigeriaStock: {
              set: Math.max(0, variant.stock - item.quantity),
            },
          },
        });
        continue;
      }

      if (order.currency === "NGN") {
        await tx.productVariant.update({
          where: {
            id: item.variantId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
            nigeriaStock: {
              decrement: item.quantity,
            },
          },
        });
        continue;
      }

      const canadaQuantity = Math.min(variant.canadaStock, item.quantity);
      const nigeriaQuantity = item.quantity - canadaQuantity;

      await tx.productVariant.update({
        where: {
          id: item.variantId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
          canadaStock:
            canadaQuantity > 0
              ? {
                  decrement: canadaQuantity,
                }
              : undefined,
          nigeriaStock:
            nigeriaQuantity > 0
              ? {
                  decrement: nigeriaQuantity,
                }
              : undefined,
        },
      });
    }
  });

  return order;
}
