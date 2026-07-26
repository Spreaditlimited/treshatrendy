import Image from "next/image";
import Link from "next/link";
import { CurrencySwitcher } from "@/app/currency/currency-switcher";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { getStoreCategories, getStoreProducts } from "@/lib/products";
import { getActiveCurrency } from "@/lib/currency";
import { formatPrice } from "@/lib/store";
import { ShopFilterForm } from "./filter-form";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    color?: string;
    size?: string;
    sort?: string;
  }>;
};

export const metadata = {
  title: "Shop African Fashion | Treshatrendy",
  description:
    "Browse African dresses, tops, bottoms, sets, kidswear, and menswear from Treshatrendy.",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [params, categories, products, activeCurrency] = await Promise.all([
    searchParams,
    getStoreCategories(),
    getStoreProducts(),
    getActiveCurrency(),
  ]);
  const category = params.category ?? "";
  const q = params.q?.trim().toLowerCase() ?? "";
  const color = params.color ?? "";
  const size = params.size ?? "";
  const sort = params.sort ?? "newest";
  const currentQuery = new URLSearchParams();
  const fullQuery = new URLSearchParams();

  if (category) fullQuery.set("category", category);
  if (q) currentQuery.set("q", q);
  if (color) currentQuery.set("color", color);
  if (size) currentQuery.set("size", size);
  if (sort !== "newest") currentQuery.set("sort", sort);
  Array.from(currentQuery.entries()).forEach(([key, value]) => {
    fullQuery.set(key, value);
  });

  const availableColors = Array.from(
    new Set(products.flatMap((product) => product.colors.map((item) => item.name))),
  ).sort((a, b) => a.localeCompare(b));

  const visibleProducts = products
    .filter((product) => {
      if (category && !product.categorySlugs.includes(category)) {
        return false;
      }

      if (color && !product.colors.some((item) => item.name === color)) {
        return false;
      }

      if (size && !product.sizes.includes(size)) {
        return false;
      }

      if (!q) {
        return true;
      }

      const searchable = [
        product.name,
        product.shortSummary,
        product.description,
        ...product.categorySlugs,
        ...product.colors.map((item) => item.name),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    })
    .sort((a, b) => {
      if (sort === "price-low") {
        return a.prices[activeCurrency] - b.prices[activeCurrency];
      }

      if (sort === "price-high") {
        return b.prices[activeCurrency] - a.prices[activeCurrency];
      }

      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <header className="relative border-b border-[#e8ded5] bg-white">
        <div className="mx-auto flex min-h-16 max-w-[92rem] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <CurrencySwitcher
                activeCurrency={activeCurrency}
                redirectTo={`/shop${fullQuery.toString() ? `?${fullQuery.toString()}` : ""}`}
              />
            </div>
            <HeaderActions />
            <MobileMenu />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[92rem] px-3 py-10 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a3f2b]">
              Shop
            </p>
            <h1 className="mt-2 text-4xl font-semibold">African fashion collection</h1>
          </div>
          <p className="text-sm text-[#6d5a51]">
            {visibleProducts.length} product{visibleProducts.length === 1 ? "" : "s"} ·{" "}
            {activeCurrency}
          </p>
        </div>

        <nav className="mt-8 flex gap-2 overflow-x-auto pb-2">
          <Link
            href={`/shop${currentQuery.toString() ? `?${currentQuery.toString()}` : ""}`}
            className={`shrink-0 rounded-md border px-4 py-2 text-sm font-semibold ${
              !category
                ? "border-[#201713] bg-[#201713] text-white"
                : "border-[#e8ded5] bg-white text-[#5c4b42]"
            }`}
          >
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={`/shop?${new URLSearchParams([
                ["category", item.slug],
                ...Array.from(currentQuery.entries()),
              ]).toString()}`}
              className={`shrink-0 rounded-md border px-4 py-2 text-sm font-semibold ${
                category === item.slug
                  ? "border-[#201713] bg-[#201713] text-white"
                  : "border-[#e8ded5] bg-white text-[#5c4b42]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <ShopFilterForm
          colors={availableColors}
          defaults={{
            category,
            q: params.q ?? "",
            color,
            size,
            sort,
          }}
        />

        {visibleProducts.length === 0 ? (
          <div className="mt-8 rounded-lg border border-[#e8ded5] bg-white p-10 text-center">
            <p className="text-lg font-semibold">No products match those filters.</p>
            <Link
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[#201713] px-5 text-sm font-semibold text-white"
              href="/shop"
            >
              Reset filters
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="group overflow-hidden rounded-lg border border-[#e8ded5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#eee3d8]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a3f2b]">
                  {product.categorySlugs.join(" / ")}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#6d5a51]">
                  {product.shortSummary}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    {formatPrice(product.prices[activeCurrency], activeCurrency)}
                  </p>
                  <div className="flex gap-1">
                    {product.colors.slice(0, 3).map((color) => (
                      <span
                        key={color.name}
                        title={color.name}
                        className="h-5 w-5 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex ?? "#201713" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
