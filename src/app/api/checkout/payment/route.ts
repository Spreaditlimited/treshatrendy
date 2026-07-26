import { NextResponse } from "next/server";
import { getCartSummary } from "@/lib/cart";
import { prisma } from "@/lib/db";
import {
  clean,
  createPendingOrder,
  validateCheckoutInput,
  type CheckoutInput,
} from "@/lib/payment";
import { initializePaystackTransaction, isPaystackConfigured } from "@/lib/paystack";
import { getShippingOption } from "@/lib/shipping";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "The database is not configured yet." },
      { status: 500 },
    );
  }

  const input = (await request.json()) as CheckoutInput;
  const validationError = validateCheckoutInput(input);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const cart = await getCartSummary();

  if (cart.lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const stockIssue = cart.lines.find((line) => line.quantity > line.stock);

  if (stockIssue) {
    return NextResponse.json(
      { error: `${stockIssue.name} does not have enough stock available.` },
      { status: 400 },
    );
  }

  const shipping = getShippingOption(clean(input.shippingZone), cart.currency);

  if (!shipping) {
    return NextResponse.json(
      { error: "Select a valid shipping option for this currency." },
      { status: 400 },
    );
  }

  if (clean(input.countryCode).toUpperCase() !== shipping.countryCode) {
    return NextResponse.json(
      { error: "Shipping country does not match the selected delivery area." },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const order = await createPendingOrder({
      cart,
      input,
      shipping,
    });

    if (cart.currency === "NGN") {
      if (!isPaystackConfigured()) {
        return NextResponse.json(
          { error: "Paystack credentials are not configured yet." },
          { status: 500 },
        );
      }

      const paystack = await initializePaystackTransaction({
        cart,
        localOrderId: order.id,
        orderNumber: order.orderNumber,
        shipping,
        email: order.email,
        origin,
      });

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paystackReference: paystack.reference,
        },
      });

      return NextResponse.json({
        authorizationUrl: paystack.authorization_url,
        provider: "PAYSTACK",
        orderNumber: order.orderNumber,
      });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe credentials are not configured yet." },
        { status: 500 },
      );
    }

    const stripeSession = await createStripeCheckoutSession({
      cart,
      localOrderId: order.id,
      orderNumber: order.orderNumber,
      shipping,
      origin,
    });

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        stripeCheckoutSessionId: stripeSession.id,
      },
    });

    return NextResponse.json({
      authorizationUrl: stripeSession.url,
      provider: "STRIPE",
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout payment.",
      },
      { status: 500 },
    );
  }
}
