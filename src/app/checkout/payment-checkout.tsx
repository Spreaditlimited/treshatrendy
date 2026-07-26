"use client";

import { useMemo, useState } from "react";
import type { CurrencyCode } from "@/lib/store";
import { formatPrice } from "@/lib/store";
import type { ShippingOption } from "@/lib/shipping";

type PaymentCheckoutProps = {
  currency: CurrencyCode;
  itemCount: number;
  subtotal: number;
  shippingOptions: ShippingOption[];
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
  shippingZone: string;
};

const countryNames = {
  NG: "Nigeria",
  CA: "Canada",
  US: "United States",
} as const;

function createInitialFields(shippingOptions: ShippingOption[]): CheckoutFields {
  const defaultShipping = shippingOptions[0];

  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    countryCode: defaultShipping?.countryCode ?? "",
    shippingZone: defaultShipping?.code ?? "",
  };
}

function requiredFieldsAreReady(fields: CheckoutFields) {
  return Boolean(
    fields.firstName &&
      fields.lastName &&
      fields.email &&
      fields.line1 &&
      fields.city &&
      fields.postalCode &&
      fields.countryCode.length === 2 &&
      fields.shippingZone,
  );
}

export function PaymentCheckout({
  currency,
  itemCount,
  subtotal,
  shippingOptions,
}: PaymentCheckoutProps) {
  const [fields, setFields] = useState(() => createInitialFields(shippingOptions));
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedShipping = useMemo(
    () => shippingOptions.find((option) => option.code === fields.shippingZone),
    [fields.shippingZone, shippingOptions],
  );
  const total = subtotal + (selectedShipping?.amount ?? 0);
  const formReady = requiredFieldsAreReady(fields);
  const provider = currency === "NGN" ? "Paystack" : "Stripe";

  function updateField(name: keyof CheckoutFields, value: string) {
    setFields((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateShippingZone(value: string) {
    const option = shippingOptions.find((item) => item.code === value);

    setFields((current) => ({
      ...current,
      shippingZone: value,
      countryCode: option?.countryCode ?? current.countryCode,
      state: option?.countryCode === "NG" ? option.label : current.state,
    }));
  }

  async function startPayment() {
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });
      const data = (await response.json()) as {
        authorizationUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.authorizationUrl) {
        throw new Error(data.error ?? "Unable to start payment.");
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start payment.");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
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
        <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
          Delivery area
          <select
            className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3"
            onChange={(event) => updateShippingZone(event.target.value)}
            required
            value={fields.shippingZone}
          >
            {shippingOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label} - {formatPrice(option.amount, option.currency)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-lg border border-[#e8ded5] bg-[#fbfaf7] p-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[#6d5a51]">Country</span>
          <span className="font-semibold text-[#201713]">
            {selectedShipping ? countryNames[selectedShipping.countryCode] : "Select area"}
          </span>
        </div>
        <div className="mt-3 flex justify-between gap-4">
          <span className="text-[#6d5a51]">Shipping</span>
          <span className="font-semibold text-[#201713]">
            {selectedShipping
              ? formatPrice(selectedShipping.amount, selectedShipping.currency)
              : "Select area"}
          </span>
        </div>
        <div className="mt-3 flex justify-between gap-4 border-t border-[#e8ded5] pt-3">
          <span className="font-semibold text-[#201713]">Total to pay</span>
          <span className="font-semibold text-[#201713]">
            {formatPrice(total, currency)}
          </span>
        </div>
      </div>

      {message ? (
        <p className="mt-5 rounded-md border border-[#e2b4a9] bg-[#fff3ef] px-4 py-3 text-sm font-medium text-[#8d2f1d]">
          {message}
        </p>
      ) : null}

      <button
        className="mt-6 h-12 rounded-md bg-[#201713] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!formReady || itemCount === 0 || isSubmitting}
        onClick={() => {
          void startPayment();
        }}
        type="button"
      >
        {isSubmitting ? "Starting payment..." : `Pay with ${provider}`}
      </button>
    </div>
  );
}
