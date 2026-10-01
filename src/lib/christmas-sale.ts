import type { CurrencyCode } from "@/lib/store";

export const christmasSale = {
  discountPercent: 20,
  startsAt: "2026-10-04T23:00:00.000Z", // 5 October, 00:00 in the UK
  endsAt: "2026-11-06T00:00:00.000Z", // End of 5 November in the UK
} as const;

export type ChristmasSalePhase = "upcoming" | "active" | "ended";

export function getChristmasSalePhase(now = new Date()): ChristmasSalePhase {
  const timestamp = now.getTime();

  if (timestamp < Date.parse(christmasSale.startsAt)) {
    return "upcoming";
  }

  if (timestamp < Date.parse(christmasSale.endsAt)) {
    return "active";
  }

  return "ended";
}

export function isChristmasSaleActive(now = new Date()) {
  return getChristmasSalePhase(now) === "active";
}

export function getChristmasSalePrice(
  amount: number,
  currency: CurrencyCode,
  now = new Date(),
) {
  if (!isChristmasSaleActive(now)) {
    return amount;
  }

  const discountedAmount = amount * (1 - christmasSale.discountPercent / 100);
  return currency === "NGN"
    ? Math.round(discountedAmount)
    : Math.round(discountedAmount * 100) / 100;
}
