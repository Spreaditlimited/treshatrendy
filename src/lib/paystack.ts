import type { CartSummary } from "@/lib/cart";
import type { ShippingOption } from "@/lib/shipping";
import { toMinorUnit } from "@/lib/payment";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata?: {
      localOrderId?: string;
      orderNumber?: string;
      shippingZone?: string;
    };
  };
};

function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Paystack secret key is not configured.");
  }

  return secretKey;
}

export function isPaystackConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY && process.env.PAYSTACK_SECRET_KEY);
}

export async function initializePaystackTransaction({
  cart,
  localOrderId,
  orderNumber,
  shipping,
  email,
  origin,
}: {
  cart: CartSummary;
  localOrderId: string;
  orderNumber: string;
  shipping: ShippingOption;
  email: string;
  origin: string;
}) {
  const total = cart.subtotal + shipping.amount;
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: toMinorUnit(total),
      currency: "NGN",
      reference: orderNumber,
      callback_url: `${origin}/api/paystack/verify?reference=${encodeURIComponent(
        orderNumber,
      )}`,
      metadata: {
        localOrderId,
        orderNumber,
        shippingZone: shipping.code,
      },
    }),
  });
  const data = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !data.status || !data.data?.authorization_url) {
    throw new Error(data.message || "Unable to initialize Paystack payment.");
  }

  return data.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
      },
    },
  );
  const data = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !data.status || !data.data) {
    throw new Error(data.message || "Unable to verify Paystack payment.");
  }

  return data.data;
}
