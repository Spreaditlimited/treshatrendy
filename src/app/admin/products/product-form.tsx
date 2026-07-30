"use client";

import Image from "next/image";
import { useActionState } from "react";
import type { Category, Product } from "@/generated/prisma/client";
import { currencies, sizes } from "@/lib/store";
import type { ProductFormState } from "./actions";
import { createProductAction, updateProductAction } from "./actions";

type ProductWithDetails = Product & {
  categories: { categoryId: string }[];
  images: { id: string; url: string; altText: string | null }[];
  prices: { currency: string; amount: unknown }[];
  variants: {
    size: string;
    colorName: string;
    colorHex: string | null;
    stock: number;
    nigeriaStock?: number | null;
    canadaStock?: number | null;
  }[];
};

type ProductFormProps = {
  categories: Category[];
  product?: ProductWithDetails;
};

const initialState: ProductFormState = {};

function getPrice(product: ProductWithDetails | undefined, currency: string) {
  const price = product?.prices.find((item) => item.currency === currency);
  return price ? String(price.amount) : "";
}

function getColorRows(product?: ProductWithDetails) {
  const colors = new Map<string, { name: string; hex: string }>();

  product?.variants.forEach((variant) => {
    if (!colors.has(variant.colorName)) {
      colors.set(variant.colorName, {
        name: variant.colorName,
        hex: variant.colorHex ?? "",
      });
    }
  });

  const rows = Array.from(colors.values());

  while (rows.length < 3) {
    rows.push({ name: "", hex: "" });
  }

  return rows.slice(0, 6);
}

function getRegionalStock(
  product: ProductWithDetails | undefined,
  colorName: string,
  size: string,
  region: "nigeria" | "canada",
) {
  if (!colorName) {
    return "";
  }

  const variant = product?.variants.find(
    (item) => item.colorName === colorName && item.size === size,
  );

  if (!variant) {
    return "0";
  }

  if (region === "nigeria") {
    const nigeriaStock = variant.nigeriaStock ?? 0;
    const canadaStock = variant.canadaStock ?? 0;

    if (nigeriaStock === 0 && canadaStock === 0 && variant.stock > 0) {
      return String(variant.stock);
    }

    return String(nigeriaStock);
  }

  return String(variant.canadaStock ?? 0);
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const colorRows = getColorRows(product);
  const selectedCategories = new Set(
    product?.categories.map((category) => category.categoryId) ?? [],
  );

  return (
    <form action={formAction} className="grid gap-8">
      {product ? <input name="productId" type="hidden" value={product.id} /> : null}

      {state.error ? (
        <p className="rounded-md border border-[#e2b4a9] bg-[#fff3ef] px-4 py-3 text-sm font-medium text-[#8d2f1d]">
          {state.error}
        </p>
      ) : null}

      <section className="rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm">
        <div className="border-b border-[#e8ded5] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
            Basic Info
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#201713]">
            Product details
          </h2>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            Name
            <input
              className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
              name="name"
              required
              defaultValue={product?.name ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            Slug
            <input
              className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
              name="slug"
              placeholder="generated-from-name"
              defaultValue={product?.slug ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22] md:col-span-2">
            Short summary
            <input
              className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
              name="shortSummary"
              maxLength={300}
              defaultValue={product?.shortSummary ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22] md:col-span-2">
            Description
            <textarea
              className="min-h-32 rounded-md border border-[#d6c7b7] bg-white px-3 py-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
              name="description"
              required
              defaultValue={product?.description ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22] md:col-span-2">
            Care notes
            <textarea
              className="min-h-24 rounded-md border border-[#d6c7b7] bg-white px-3 py-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
              name="careNotes"
              defaultValue={product?.careNotes ?? ""}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm">
        <div className="border-b border-[#e8ded5] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
            Catalog Placement
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#201713]">
            Categories and status
          </h2>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_220px]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <label
                className="flex items-center gap-3 rounded-md border border-[#e6d8ca] bg-white px-3 py-3 text-sm font-medium text-[#3b2a22]"
                key={category.id}
              >
                <input
                  className="size-4 accent-[#8d4931]"
                  name="categoryIds"
                  type="checkbox"
                  value={category.id}
                  defaultChecked={selectedCategories.has(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            Status
            <select
              className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
              name="status"
              defaultValue={product?.status ?? "DRAFT"}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ded5] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
              Regional Pricing
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[#201713]">
              Multi-currency prices
            </h2>
          </div>
          <span className="rounded-md bg-[#f5c56f]/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a3f2b]">
            NGN · CAD · USD
          </span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {currencies.map((currency) => (
            <label
              className="grid gap-2 text-sm font-medium text-[#3b2a22]"
              key={currency.code}
            >
              {currency.code}
              <input
                className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
                name={`price-${currency.code}`}
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={getPrice(product, currency.code)}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm">
        <div className="border-b border-[#e8ded5] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
            Media
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#201713]">
            Product imagery
          </h2>
        </div>
        {product?.images.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {product.images.map((image) => (
              <Image
                alt={image.altText ?? product.name}
                className="aspect-[4/5] w-full rounded-md border border-[#e6d8ca] object-cover"
                height={500}
                key={image.id}
                src={image.url}
                width={400}
              />
            ))}
          </div>
        ) : null}
        <div className="mt-6 grid gap-4 rounded-xl border-2 border-dashed border-[#e8ded5] bg-[#fbfaf7] p-6">
          <div>
            <p className="text-sm font-semibold text-[#201713]">
              Upload product photos
            </p>
            <p className="mt-1 text-xs leading-5 text-[#6d5a51]">
              Use clear product images. Multiple photos are supported; for best
              results, keep each image under 5MB.
            </p>
          </div>
          <input
            className="rounded-md border border-[#d6c7b7] bg-white px-3 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#8a3f2b] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#6d3222]"
            name="images"
            type="file"
            accept="image/*"
            multiple
            required={!product}
          />
          {product ? (
            <label className="flex items-center gap-3 text-sm font-medium text-[#3b2a22]">
              <input
                className="size-4 accent-[#8d4931]"
                name="replaceImages"
                type="checkbox"
                value="yes"
              />
              Replace existing images with new upload
            </label>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm">
        <div className="border-b border-[#e8ded5] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
            Regional Inventory
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#201713]">
            Colours and regional stock
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6e5b4f]">
            Nigeria stock is available within 5 business days. Canada stock means
            pieces already shipped to Canada for faster Canada and US fulfilment.
          </p>
        </div>
        <div className="mt-6 grid gap-6">
          {colorRows.map((color, colorIndex) => (
            <div
              className="rounded-md border border-[#e6d8ca] bg-white p-4"
              key={colorIndex}
            >
              <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
                  Colour name
                  <input
                    className="h-10 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931]"
                    name={`color-name-${colorIndex}`}
                    defaultValue={color.name}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
                  Swatch
                  <input
                    className="h-10 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931]"
                    name={`color-hex-${colorIndex}`}
                    placeholder="#8a2442"
                    defaultValue={color.hex}
                  />
                </label>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-xs">
                  <thead>
                    <tr className="text-[#6e5b4f]">
                      <th className="pb-2 pr-3 font-semibold">Size</th>
                      {sizes.map((size) => (
                        <th className="pb-2 pr-3 font-semibold" key={size}>
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="py-2 pr-3 font-semibold text-[#3b2a22]">
                        Nigeria
                      </th>
                      {sizes.map((size) => (
                        <td className="py-2 pr-3" key={size}>
                          <input
                            aria-label={`Nigeria stock for ${color.name || "colour"} size ${size}`}
                            className="h-10 w-16 rounded-md border border-[#d6c7b7] bg-white px-2 text-sm outline-none focus:border-[#8d4931]"
                            name={`nigeria-stock-${colorIndex}-${size}`}
                            type="number"
                            min="0"
                            step="1"
                            defaultValue={getRegionalStock(product, color.name, size, "nigeria")}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th className="py-2 pr-3 font-semibold text-[#3b2a22]">
                        Canada
                      </th>
                      {sizes.map((size) => (
                        <td className="py-2 pr-3" key={size}>
                          <input
                            aria-label={`Canada stock for ${color.name || "colour"} size ${size}`}
                            className="h-10 w-16 rounded-md border border-[#d6c7b7] bg-white px-2 text-sm outline-none focus:border-[#8d4931]"
                            name={`canada-stock-${colorIndex}-${size}`}
                            type="number"
                            min="0"
                            step="1"
                            defaultValue={getRegionalStock(product, color.name, size, "canada")}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm">
        <div className="border-b border-[#e8ded5] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
            Search Visibility
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#201713]">
            SEO setup
          </h2>
        </div>
        <div className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            SEO title
            <input
              className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
              name="seoTitle"
              maxLength={70}
              defaultValue={product?.seoTitle ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
            SEO description
            <textarea
              className="min-h-24 rounded-md border border-[#d6c7b7] bg-white px-3 py-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
              name="seoDescription"
              maxLength={170}
              defaultValue={product?.seoDescription ?? ""}
            />
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8ded5] bg-[#fbfaf7]/95 py-5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d5a51]">
          Choose how this product should be saved
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <button
            className="rounded-lg border border-[#d6c7b7] bg-white px-5 py-3 text-sm font-semibold text-[#201713] transition hover:border-[#8a3f2b] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            name="submitStatus"
            type="submit"
            value="DRAFT"
          >
            {isPending ? "Saving..." : "Save as draft"}
          </button>
        <button
          className="rounded-lg bg-[#8a3f2b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d3222] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          name="submitStatus"
          type="submit"
          value="PUBLISHED"
        >
            {isPending
              ? "Publishing..."
              : product
                ? "Publish changes"
                : "Publish product"}
        </button>
        </div>
      </div>
    </form>
  );
}
