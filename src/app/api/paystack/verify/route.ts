import { NextResponse } from "next/server";
import { clearCurrentCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/payment";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(request: Request) {
  if (!prisma) {
    return NextResponse.redirect(new URL("/checkout?payment=database", request.url));
  }

  const url = new URL(request.url);
  const reference = url.searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/checkout?payment=missing-reference", request.url));
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);

    if (transaction.status !== "success") {
      return NextResponse.redirect(new URL("/checkout?payment=failed", request.url));
    }

    const order = await prisma.order.findFirst({
      where: {
        paystackReference: reference,
      },
    });

    if (!order) {
      return NextResponse.redirect(new URL("/checkout?payment=order-not-found", request.url));
    }

    await markOrderPaid(order.id, {
      paystackReference: reference,
    });
    await clearCurrentCart();

    return NextResponse.redirect(
      new URL(
        `/checkout/success?order=${encodeURIComponent(order.orderNumber)}`,
        request.url,
      ),
    );
  } catch {
    return NextResponse.redirect(new URL("/checkout?payment=verification-failed", request.url));
  }
}
