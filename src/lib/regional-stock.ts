import type { CurrencyCode } from "@/lib/store";

export type RegionalStockInput = {
  stock: number;
  nigeriaStock?: number | null;
  canadaStock?: number | null;
};

export type AvailabilityMessage = {
  label: string;
  detail: string;
  tone: "ready" | "delayed" | "unavailable";
};

export function getNigeriaStock(variant: RegionalStockInput) {
  const nigeriaStock = variant.nigeriaStock ?? 0;
  const canadaStock = variant.canadaStock ?? 0;

  if (nigeriaStock === 0 && canadaStock === 0 && variant.stock > 0) {
    return variant.stock;
  }

  return nigeriaStock;
}

export function getCanadaStock(variant: RegionalStockInput) {
  return variant.canadaStock ?? 0;
}

export function getMarketStock(
  variant: RegionalStockInput,
  currency: CurrencyCode,
) {
  const nigeriaStock = getNigeriaStock(variant);
  const canadaStock = getCanadaStock(variant);

  if (currency === "NGN") {
    return nigeriaStock;
  }

  return canadaStock + nigeriaStock;
}

export function getAvailabilityMessage(
  variant: RegionalStockInput | null | undefined,
  currency: CurrencyCode,
): AvailabilityMessage {
  if (!variant) {
    return {
      label: "Choose an available option",
      detail: "Select a colour and size to see availability.",
      tone: "unavailable",
    };
  }

  const nigeriaStock = getNigeriaStock(variant);
  const canadaStock = getCanadaStock(variant);

  if (currency === "NGN") {
    if (nigeriaStock > 0) {
      return {
        label: "Available in Nigeria",
        detail: "This item is available in Nigeria within 5 business days.",
        tone: "ready",
      };
    }

    return {
      label: "Currently unavailable in Nigeria",
      detail: "Choose another size or colour for faster availability.",
      tone: "unavailable",
    };
  }

  if (canadaStock > 0) {
    return {
      label: currency === "CAD" ? "Ready in Canada" : "Ready for North America",
      detail:
        currency === "CAD"
          ? "This item is already in Canada and ready for local fulfilment."
          : "This item is available from Canada for US delivery.",
      tone: "ready",
    };
  }

  if (nigeriaStock > 0) {
    return {
      label: "Available from Nigeria",
      detail: "This item is produced in Nigeria and may take 2-3 weeks to arrive.",
      tone: "delayed",
    };
  }

  return {
    label: "Currently unavailable",
    detail: "Choose another size or colour, or contact us for restock timing.",
    tone: "unavailable",
  };
}
