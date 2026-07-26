import Stripe from "stripe";
import type { CartSummary } from "@/lib/cart";
import type { ShippingOption } from "@/lib/shipping";
import { toMinorUnit } from "@/lib/payment";

export function isStripeConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET,
  );
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe secret key is not configured.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
  });
}

export async function createStripeCheckoutSession({
  cart,
  localOrderId,
  orderNumber,
  shipping,
  origin,
}: {
  cart: CartSummary;
  localOrderId: string;
  orderNumber: string;
  shipping: ShippingOption;
  origin: string;
}) {
  const stripe = getStripe();
  const currency = cart.currency.toLowerCase();

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: localOrderId,
    customer_email: undefined,
    line_items: [
      ...cart.lines.map((line) => ({
        price_data: {
          currency,
          product_data: {
            name: `${line.name} - ${line.colorName}, size ${line.size}`.slice(0, 250),
          },
          unit_amount: toMinorUnit(line.unitPrice),
        },
        quantity: line.quantity,
      })),
      {
        price_data: {
          currency,
          product_data: {
            name: `Shipping - ${shipping.label}`,
          },
          unit_amount: toMinorUnit(shipping.amount),
        },
        quantity: 1,
      },
    ],
    metadata: {
      localOrderId,
      orderNumber,
      shippingZone: shipping.code,
    },
    success_url: `${origin}/checkout/success?order=${encodeURIComponent(
      orderNumber,
    )}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?cancelled=1`,
  });
}
