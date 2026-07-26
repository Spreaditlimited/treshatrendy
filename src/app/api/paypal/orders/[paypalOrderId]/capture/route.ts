import { NextResponse } from "next/server";
import { clearCurrentCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal";

type CaptureRouteProps = {
  params: Promise<{
    paypalOrderId: string;
  }>;
};

export async function POST(_request: Request, { params }: CaptureRouteProps) {
  if (!prisma) {
    return NextResponse.json(
      { error: "The database is not configured yet." },
      { status: 500 },
    );
  }

  const db = prisma;
  const { paypalOrderId } = await params;

  try {
    const capture = await capturePayPalOrder(paypalOrderId);
    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    const captureStatus =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.status ??
      capture.status;

    if (capture.status !== "COMPLETED" && captureStatus !== "COMPLETED") {
      return NextResponse.json(
        { error: "PayPal did not complete this payment." },
        { status: 400 },
      );
    }

    const order = await db.order.findFirst({
      where: {
        paypalOrderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.paymentStatus !== "PAID") {
      await db.$transaction([
        db.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "PAID",
            paymentStatus: "PAID",
            paypalCaptureId: captureId,
            paidAt: new Date(),
          },
        }),
        ...order.items.map((item) =>
          db.productVariant.update({
            where: {
              id: item.variantId,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      ]);
    }

    await clearCurrentCart();

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: "PAID",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to capture PayPal payment.",
      },
      { status: 500 },
    );
  }
}
