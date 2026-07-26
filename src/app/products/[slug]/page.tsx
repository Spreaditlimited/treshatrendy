import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CurrencySwitcher } from "@/app/currency/currency-switcher";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { getStoreProductBySlug } from "@/lib/products";
import { getActiveCurrency } from "@/lib/currency";
import { currencies, formatPrice } from "@/lib/store";
import { PurchaseForm } from "./purchase-form";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Treshatrendy",
    };
  }

  return {
    title: `${product.name} | Treshatrendy`,
    description: product.shortSummary,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, activeCurrency] = await Promise.all([
    getStoreProductBySlug(slug),
    getActiveCurrency(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <header className="relative border-b border-[#e8ded5] bg-white">
        <div className="mx-auto flex min-h-16 max-w-[92rem] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <CurrencySwitcher
                activeCurrency={activeCurrency}
                redirectTo={`/products/${product.slug}`}
              />
            </div>
            <Link href="/shop" className="hidden text-sm font-semibold text-[#8a3f2b] sm:inline">
              Back to shop
            </Link>
            <HeaderActions />
            <MobileMenu />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[92rem] gap-10 px-3 py-10 sm:px-5 lg:grid-cols-2 lg:px-6">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#eee3d8]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a3f2b]">
            {product.categorySlugs.join(" / ")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{product.name}</h1>
          <p className="mt-4 text-base leading-7 text-[#6d5a51]">{product.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {currencies.map((currency) => (
              <div
                key={currency.code}
                className={`rounded-md border p-4 ${
                  activeCurrency === currency.code
                    ? "border-[#201713] bg-[#201713] text-white"
                    : "border-[#e8ded5] bg-white"
                }`}
              >
                <p
                  className={`text-xs font-semibold ${
                    activeCurrency === currency.code ? "text-[#fff4e7]" : "text-[#6d5a51]"
                  }`}
                >
                  {currency.code}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {formatPrice(product.prices[currency.code], currency.code)}
                </p>
              </div>
            ))}
          </div>

          <PurchaseForm activeCurrency={activeCurrency} variants={product.variants} />
        </div>
      </section>
    </main>
  );
}
