"use client";

import Script from "next/script";
import { useMemo, useState } from "react";
import type { CurrencyCode } from "@/lib/store";

type PayPalButtonsConfig = {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (error: unknown) => void;
};

type PayPalNamespace = {
  Buttons: (config: PayPalButtonsConfig) => {
    render: (selector: string) => Promise<void>;
  };
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

type PayPalCheckoutProps = {
  clientId: string | null;
  currency: CurrencyCode;
  paymentCurrency: CurrencyCode;
  itemCount: number;
};

type CheckoutFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
};

const emptyFields: CheckoutFields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "",
};

function requiredFieldsAreReady(fields: CheckoutFields) {
  return Boolean(
    fields.firstName &&
      fields.lastName &&
      fields.email &&
      fields.line1 &&
      fields.city &&
      fields.postalCode &&
      fields.countryCode.length === 2,
  );
}

export function PayPalCheckout({
  clientId,
  currency,
  paymentCurrency,
  itemCount,
}: PayPalCheckoutProps) {
  const [fields, setFields] = useState(emptyFields);
  const [message, setMessage] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const formReady = requiredFieldsAreReady(fields);
  const sdkUrl = useMemo(() => {
    if (!clientId) {
      return null;
    }

    const params = new URLSearchParams({
      "client-id": clientId,
      currency: paymentCurrency,
      intent: "capture",
      components: "buttons",
    });

    return `https://www.paypal.com/sdk/js?${params.toString()}`;
  }, [clientId, paymentCurrency]);

  function updateField(name: keyof CheckoutFields, value: string) {
    setFields((current) => ({
      ...current,
      [name]: name === "countryCode" ? value.toUpperCase().slice(0, 2) : value,
    }));
  }

  async function createOrder() {
    setMessage(null);
    const response = await fetch("/api/paypal/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fields),
    });
    const data = (await response.json()) as { id?: string; error?: string };

    if (!response.ok || !data.id) {
      throw new Error(data.error ?? "Unable to create PayPal order.");
    }

    return data.id;
  }

  async function captureOrder(paypalOrderId: string) {
    const response = await fetch(`/api/paypal/orders/${paypalOrderId}/capture`, {
      method: "POST",
    });
    const data = (await response.json()) as {
      orderNumber?: string;
      error?: string;
    };

    if (!response.ok || !data.orderNumber) {
      throw new Error(data.error ?? "Unable to capture PayPal payment.");
    }

    window.location.href = `/checkout/success?order=${encodeURIComponent(
      data.orderNumber,
    )}`;
  }

  async function renderButtons() {
    if (!window.paypal || !formReady || itemCount === 0) {
      return;
    }

    const container = document.querySelector("#paypal-buttons");

    if (container) {
      container.innerHTML = "";
    }

    await window.paypal
      .Buttons({
        createOrder,
        onApprove: async (data) => {
          await captureOrder(data.orderID);
        },
        onError: (error) => {
          setMessage(
            error instanceof Error
              ? error.message
              : "PayPal could not complete this payment.",
          );
        },
      })
      .render("#paypal-buttons");
  }

  return (
    <div>
      {sdkUrl ? (
        <Script
          src={sdkUrl}
          strategy="afterInteractive"
          onLoad={() => {
            setScriptReady(true);
          }}
        />
      ) : null}

      <div className="mt-6 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            First name
            <input
              className="h-11 rounded-md border border-[#d6c7b7] px-3"
              onChange={(event) => updateField("firstName", event.target.value)}
              required
              value={fields.firstName}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            Last name
            <input
              className="h-11 rounded-md border border-[#d6c7b7] px-3"
              onChange={(event) => updateField("lastName", event.target.value)}
              required
              value={fields.lastName}
            />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            Email
            <input
              className="h-11 rounded-md border border-[#d6c7b7] px-3"
              onChange={(event) => updateField("email", event.target.value)}
              required
              type="email"
              value={fields.email}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            Phone
            <input
              className="h-11 rounded-md border border-[#d6c7b7] px-3"
              onChange={(event) => updateField("phone", event.target.value)}
              value={fields.phone}
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
          Address line 1
          <input
            className="h-11 rounded-md border border-[#d6c7b7] px-3"
            onChange={(event) => updateField("line1", event.target.value)}
            required
            value={fields.line1}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
          Address line 2
          <input
            className="h-11 rounded-md border border-[#d6c7b7] px-3"
            onChange={(event) => updateField("line2", event.target.value)}
            value={fields.line2}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            City
            <input
              className="h-11 rounded-md border border-[#d6c7b7] px-3"
              onChange={(event) => updateField("city", event.target.value)}
              required
              value={fields.city}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            State/Province
            <input
              className="h-11 rounded-md border border-[#d6c7b7] px-3"
              onChange={(event) => updateField("state", event.target.value)}
              value={fields.state}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            Postal code
            <input
              className="h-11 rounded-md border border-[#d6c7b7] px-3"
              onChange={(event) => updateField("postalCode", event.target.value)}
              required
              value={fields.postalCode}
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-[#3b2a22] sm:max-w-44">
          Country code
          <input
            className="h-11 rounded-md border border-[#d6c7b7] px-3 uppercase"
            maxLength={2}
            onChange={(event) => updateField("countryCode", event.target.value)}
            placeholder="CA"
            required
            value={fields.countryCode}
          />
        </label>
      </div>

      {currency === "NGN" ? (
        <p className="mt-5 rounded-md border border-[#e8ded5] bg-[#fbfaf7] px-4 py-3 text-sm leading-6 text-[#6d5a51]">
          PayPal does not currently support NGN checkout, so this payment will be
          charged in USD while the storefront can still display Naira pricing.
        </p>
      ) : null}

      {!clientId ? (
        <p className="mt-5 rounded-md border border-[#e2b4a9] bg-[#fff3ef] px-4 py-3 text-sm font-medium text-[#8d2f1d]">
          PayPal credentials are not configured yet.
        </p>
      ) : null}

      {message ? (
        <p className="mt-5 rounded-md border border-[#e2b4a9] bg-[#fff3ef] px-4 py-3 text-sm font-medium text-[#8d2f1d]">
          {message}
        </p>
      ) : null}

      <button
        className="mt-6 h-12 rounded-md bg-[#201713] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!scriptReady || !formReady || itemCount === 0}
        onClick={() => {
          void renderButtons();
        }}
        type="button"
      >
        Continue to PayPal
      </button>

      <div className="mt-5" id="paypal-buttons" />
    </div>
  );
}
