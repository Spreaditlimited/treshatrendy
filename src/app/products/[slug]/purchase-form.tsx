"use client";

import { useState, useActionState } from "react";
import { addToCartAction, buyNowAction, type CartActionState } from "@/app/cart/actions";
import {
  getAvailabilityMessage,
  getMarketStock,
} from "@/lib/regional-stock";
import { sizes as storeSizes, type CurrencyCode } from "@/lib/store";

type VariantOption = {
  id: string;
  size: string;
  colorName: string;
  colorHex: string | null;
  stock: number;
  nigeriaStock: number;
  canadaStock: number;
};

type PurchaseFormProps = {
  activeCurrency: CurrencyCode;
  variants: VariantOption[];
};

const initialState: CartActionState = {};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function sortSizes(values: string[]) {
  return [...values].sort((a, b) => {
    const firstIndex = storeSizes.findIndex((size) => size === a);
    const secondIndex = storeSizes.findIndex((size) => size === b);

    if (firstIndex !== -1 && secondIndex !== -1) {
      return firstIndex - secondIndex;
    }

    return Number(a) - Number(b);
  });
}

export function PurchaseForm({ activeCurrency, variants }: PurchaseFormProps) {
  const availableVariants = variants.filter(
    (variant) => getMarketStock(variant, activeCurrency) > 0,
  );
  const colors = uniqueValues(availableVariants.map((variant) => variant.colorName));
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const sizes = sortSizes(
    uniqueValues(
      availableVariants
        .filter((variant) => variant.colorName === selectedColor)
        .map((variant) => variant.size),
    ),
  );
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [cartState, addToCartFormAction, isAdding] = useActionState(
    addToCartAction,
    initialState,
  );
  const [buyState, buyNowFormAction, isBuying] = useActionState(
    buyNowAction,
    initialState,
  );

  const selectedVariant = availableVariants.find(
    (variant) =>
      variant.colorName === selectedColor && variant.size === selectedSize,
  );
  const selectedMarketStock = selectedVariant
    ? getMarketStock(selectedVariant, activeCurrency)
    : 0;
  const availability = getAvailabilityMessage(selectedVariant, activeCurrency);

  const visibleSizes = sizes.length > 0 ? sizes : [...storeSizes];
  const error = cartState.error ?? buyState.error;
  const safeQuantity =
    selectedMarketStock > 0 ? Math.min(quantity, selectedMarketStock) : quantity;

  function handleColorChange(colorName: string) {
    setSelectedColor(colorName);
    const firstSize = sortSizes(
      uniqueValues(
        availableVariants
          .filter((variant) => variant.colorName === colorName)
          .map((variant) => variant.size),
      ),
    )[0];
    setSelectedSize(firstSize ?? "");
    setQuantity(1);
  }

  return (
    <div className="mt-8">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
          Colours
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {colors.map((colorName) => {
            const color = availableVariants.find(
              (variant) => variant.colorName === colorName,
            );

            return (
              <button
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  selectedColor === colorName
                    ? "border-[#201713] bg-[#201713] text-white"
                    : "border-[#e8ded5] bg-white text-[#201713]"
                }`}
                key={colorName}
                onClick={() => handleColorChange(colorName)}
                type="button"
              >
                <span
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ backgroundColor: color?.colorHex ?? "#201713" }}
                />
                {colorName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">Sizes</h2>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-9">
          {visibleSizes.map((size) => {
            const isAvailable = availableVariants.some(
              (variant) =>
                variant.colorName === selectedColor && variant.size === size,
            );

            return (
              <button
                className={`flex h-11 items-center justify-center rounded-md border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${
                  selectedSize === size
                    ? "border-[#201713] bg-[#201713] text-white"
                    : "border-[#e8ded5] bg-white text-[#201713]"
                }`}
                disabled={!isAvailable}
                key={size}
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-2 text-sm font-medium text-[#3b2a22] sm:max-w-40">
        Quantity
        <input
          className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
          min="1"
          max={selectedMarketStock || 1}
          onChange={(event) => {
            const nextQuantity = Number(event.target.value);
            setQuantity(
              selectedMarketStock > 0
                ? Math.min(nextQuantity, selectedMarketStock)
                : nextQuantity,
            );
          }}
          type="number"
          value={safeQuantity}
        />
      </div>

      {selectedVariant ? (
        <div
          className={`mt-4 rounded-md border px-4 py-3 text-sm ${
            availability.tone === "ready"
              ? "border-[#b9d8be] bg-[#f0fff3] text-[#23562b]"
              : availability.tone === "delayed"
                ? "border-[#ead39b] bg-[#fff8e2] text-[#785015]"
                : "border-[#e2b4a9] bg-[#fff3ef] text-[#8d2f1d]"
          }`}
        >
          <p className="font-semibold">{availability.label}</p>
          <p className="mt-1 leading-6">{availability.detail}</p>
          <p className="mt-1 text-xs">
            {selectedMarketStock} available for your selected market.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#8d2f1d]">
          Choose an available colour and size.
        </p>
      )}

      {error ? (
        <p className="mt-4 rounded-md border border-[#e2b4a9] bg-[#fff3ef] px-4 py-3 text-sm font-medium text-[#8d2f1d]">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <form action={addToCartFormAction}>
          <input name="variantId" type="hidden" value={selectedVariant?.id ?? ""} />
          <input name="quantity" type="hidden" value={safeQuantity} />
          <button
            className="h-12 w-full rounded-md bg-[#201713] text-sm font-bold text-white transition hover:bg-[#3b2a22] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedVariant || isAdding || isBuying}
            type="submit"
          >
            {isAdding ? "Adding..." : "Add to cart"}
          </button>
        </form>
        <form action={buyNowFormAction}>
          <input name="variantId" type="hidden" value={selectedVariant?.id ?? ""} />
          <input name="quantity" type="hidden" value={safeQuantity} />
          <button
            className="h-12 w-full rounded-md bg-[#f5c56f] text-sm font-bold text-[#201713] transition hover:bg-[#ffd992] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedVariant || isAdding || isBuying}
            type="submit"
          >
            {isBuying ? "Opening checkout..." : "Buy now"}
          </button>
        </form>
      </div>
    </div>
  );
}
