import { randomBytes } from "crypto";
import type { CartSummary } from "@/lib/cart";

type PayPalLink = {
  href: string;
  rel: string;
  method: string;
};

type PayPalOrderResponse = {
  id: string;
  status: string;
  links?: PayPalLink[];
};

type PayPalCaptureResponse = {
  id: string;
  status: string;
  purchase_units?: {
    payments?: {
      captures?: {
        id: string;
        status: string;
      }[];
    };
  }[];
};

function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }

  return {
    clientId,
    clientSecret,
  };
}

export function isPayPalConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET,
  );
}

export function createOrderNumber() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `TT-${yyyymmdd}-${suffix}`;
}

export function getPayPalCurrency(displayCurrency: CartSummary["currency"]) {
  return displayCurrency === "NGN" ? "USD" : displayCurrency;
}

export function formatPayPalAmount(amount: number) {
  return amount.toFixed(2);
}

async function generateAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await response.json()) as { access_token?: string; error?: string };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error ?? "Unable to generate PayPal access token.");
  }

  return data.access_token;
}

export async function createPayPalOrder({
  cart,
  localOrderId,
  orderNumber,
}: {
  cart: CartSummary;
  localOrderId: string;
  orderNumber: string;
}) {
  const accessToken = await generateAccessToken();
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: localOrderId,
        invoice_id: orderNumber,
        amount: {
          currency_code: cart.currency,
          value: formatPayPalAmount(cart.subtotal),
          breakdown: {
            item_total: {
              currency_code: cart.currency,
              value: formatPayPalAmount(cart.subtotal),
            },
          },
        },
        items: cart.lines.map((line) => ({
          name: line.name.slice(0, 127),
          quantity: String(line.quantity),
          sku: line.variantId,
          unit_amount: {
            currency_code: cart.currency,
            value: formatPayPalAmount(line.unitPrice),
          },
          category: "PHYSICAL_GOODS",
        })),
      },
    ],
  };

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": orderNumber,
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as PayPalOrderResponse & {
    details?: { issue?: string; description?: string }[];
  };

  if (!response.ok || !data.id) {
    const detail = data.details?.[0];
    throw new Error(
      detail?.description ?? detail?.issue ?? "PayPal order creation failed.",
    );
  }

  return data;
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const accessToken = await generateAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  const data = (await response.json()) as PayPalCaptureResponse & {
    details?: { issue?: string; description?: string }[];
  };

  if (!response.ok) {
    const detail = data.details?.[0];
    throw new Error(
      detail?.description ?? detail?.issue ?? "PayPal capture failed.",
    );
  }

  return data;
}
