import type { CurrencyCode } from "@/lib/store";

export type ShippingZoneCode =
  | "lagos-mainland"
  | "lagos-island"
  | "lagos-ajah"
  | "east"
  | "south"
  | "west"
  | "north"
  | "canada"
  | "usa";

export type ShippingOption = {
  code: ShippingZoneCode;
  label: string;
  countryCode: "NG" | "CA" | "US";
  currency: CurrencyCode;
  amount: number;
};

export const shippingOptions: ShippingOption[] = [
  {
    code: "lagos-mainland",
    label: "Lagos mainland",
    countryCode: "NG",
    currency: "NGN",
    amount: 3500,
  },
  {
    code: "lagos-island",
    label: "Lagos island",
    countryCode: "NG",
    currency: "NGN",
    amount: 5000,
  },
  {
    code: "lagos-ajah",
    label: "Lagos Ajah",
    countryCode: "NG",
    currency: "NGN",
    amount: 6500,
  },
  {
    code: "east",
    label: "East",
    countryCode: "NG",
    currency: "NGN",
    amount: 4500,
  },
  {
    code: "south",
    label: "South",
    countryCode: "NG",
    currency: "NGN",
    amount: 5500,
  },
  {
    code: "west",
    label: "West",
    countryCode: "NG",
    currency: "NGN",
    amount: 4000,
  },
  {
    code: "north",
    label: "North",
    countryCode: "NG",
    currency: "NGN",
    amount: 4500,
  },
  {
    code: "canada",
    label: "Canada",
    countryCode: "CA",
    currency: "CAD",
    amount: 18,
  },
  {
    code: "usa",
    label: "United States",
    countryCode: "US",
    currency: "USD",
    amount: 25,
  },
];

export function getShippingOptionsForCurrency(currency: CurrencyCode) {
  return shippingOptions.filter((option) => option.currency === currency);
}

export function getShippingOption(code: string, currency: CurrencyCode) {
  return shippingOptions.find(
    (option) => option.code === code && option.currency === currency,
  );
}

export function getDefaultShippingOption(currency: CurrencyCode) {
  return getShippingOptionsForCurrency(currency)[0] ?? null;
}
