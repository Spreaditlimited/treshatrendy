import { NextResponse } from "next/server";
import { getCartSummary } from "@/lib/cart";
import { prisma } from "@/lib/db";
import {
  createOrderNumber,
  createPayPalOrder,
  getPayPalCurrency,
  isPayPalConfigured,
} from "@/lib/paypal";

type CheckoutRequest = {
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
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function validateCheckoutInput(input: CheckoutRequest) {
  const required = [
    ["firstName", input.firstName],
    ["lastName", input.lastName],
    ["email", input.email],
    ["line1", input.line1],
    ["city", input.city],
    ["postalCode", input.postalCode],
    ["countryCode", input.countryCode],
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

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "The database is not configured yet." },
      { status: 500 },
    );
  }

  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "PayPal credentials are not configured yet." },
      { status: 500 },
    );
  }

  const input = (await request.json()) as CheckoutRequest;
  const validationError = validateCheckoutInput(input);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const displayCart = await getCartSummary();
  const paymentCurrency = getPayPalCurrency(displayCart.currency);
  const paymentCart =
    paymentCurrency === displayCart.currency
      ? displayCart
      : await getCartSummary(paymentCurrency);

  if (paymentCart.lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const stockIssue = paymentCart.lines.find((line) => line.quantity > line.stock);

  if (stockIssue) {
    return NextResponse.json(
      { error: `${stockIssue.name} does not have enough stock available.` },
      { status: 400 },
    );
  }

  const orderNumber = createOrderNumber();

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: clean(input.email).toLowerCase(),
        firstName: clean(input.firstName),
        lastName: clean(input.lastName),
        phone: clean(input.phone) || null,
        currency: paymentCart.currency,
        subtotalAmount: paymentCart.subtotal,
        totalAmount: paymentCart.subtotal,
        status: "PENDING_PAYMENT",
        paymentProvider: "PAYPAL",
        paymentStatus: "PENDING",
        addresses: {
          create: {
            type: "SHIPPING",
            firstName: clean(input.firstName),
            lastName: clean(input.lastName),
            line1: clean(input.line1),
            line2: clean(input.line2) || null,
            city: clean(input.city),
            state: clean(input.state) || null,
            postalCode: clean(input.postalCode),
            countryCode: clean(input.countryCode).toUpperCase(),
            phone: clean(input.phone) || null,
          },
        },
        items: {
          create: paymentCart.lines.map((line) => ({
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
    });

    const paypalOrder = await createPayPalOrder({
      cart: paymentCart,
      localOrderId: order.id,
      orderNumber,
    });

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paypalOrderId: paypalOrder.id,
      },
    });

    return NextResponse.json({
      id: paypalOrder.id,
      orderNumber,
      localOrderId: order.id,
      currency: paymentCart.currency,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create PayPal order.",
      },
      { status: 500 },
    );
  }
}
