import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/payment";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    status?: string;
    reference?: string;
    metadata?: {
      localOrderId?: string;
    };
  };
};

function verifyPaystackSignature(body: string, signature: string | null) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey || !signature) {
    return false;
  }

  const hash = createHmac("sha512", secretKey).update(body).digest("hex");
  return hash === signature;
}

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "The database is not configured yet." },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid Paystack signature." }, { status: 400 });
  }

  const event = JSON.parse(body) as PaystackWebhookEvent;

  if (event.event === "charge.success" && event.data?.status === "success") {
    const localOrderId = event.data.metadata?.localOrderId;
    const reference = event.data.reference ?? null;

    if (localOrderId) {
      await markOrderPaid(localOrderId, {
        paystackReference: reference,
      });
    }
  }

  return NextResponse.json({ received: true });
}
