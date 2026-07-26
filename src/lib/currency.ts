import { cookies, headers } from "next/headers";
import type { CurrencyCode } from "@/lib/store";

const CURRENCY_COOKIE = "treshatrendy_currency";
const supportedCurrencies = new Set(["NGN", "CAD", "USD"]);

export async function getActiveCurrency(): Promise<CurrencyCode> {
  const cookieStore = await cookies();
  const savedCurrency = cookieStore.get(CURRENCY_COOKIE)?.value;

  if (savedCurrency && supportedCurrencies.has(savedCurrency)) {
    return savedCurrency as CurrencyCode;
  }

  const headerStore = await headers();
  const country =
    headerStore.get("x-vercel-ip-country") ??
    headerStore.get("cf-ipcountry") ??
    headerStore.get("x-country-code") ??
    "";

  if (country.toUpperCase() === "NG") {
    return "NGN";
  }

  if (country.toUpperCase() === "CA") {
    return "CAD";
  }

  return "USD";
}

export async function setActiveCurrency(currency: CurrencyCode) {
  const cookieStore = await cookies();
  cookieStore.set(CURRENCY_COOKIE, currency, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
}
