import Image from "next/image";
import Link from "next/link";
import { CurrencySwitcher } from "@/app/currency/currency-switcher";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { getActiveCurrency } from "@/lib/currency";
import { mainNavItems } from "@/lib/navigation";
import { getStoreProducts } from "@/lib/products";
import { formatPrice } from "@/lib/store";

type CollectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  categorySlugs: string[];
  shopHref: string;
};

export async function CollectionPage({
  eyebrow,
  title,
  description,
  categorySlugs,
  shopHref,
}: CollectionPageProps) {
  const [activeCurrency, products] = await Promise.all([
    getActiveCurrency(),
    getStoreProducts().catch(() => []),
  ]);
  const featuredProducts = products
    .filter((product) =>
      product.categorySlugs.some((slug) => categorySlugs.includes(slug)),
    )
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#201713]">
      <header className="relative border-b border-[#e8ded5] bg-white">
        <div className="mx-auto flex min-h-16 max-w-[92rem] flex-wrap items-center justify-between gap-4 px-3 py-3 sm:px-5 lg:px-6">
          <Logo />
          <nav className="hidden flex-wrap items-center gap-5 text-sm font-semibold text-[#5c4b42] md:flex">
            {mainNavItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <CurrencySwitcher activeCurrency={activeCurrency} redirectTo={shopHref.split("?")[0]} />
            </div>
            <HeaderActions />
            <MobileMenu />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[92rem] px-3 py-16 sm:px-5 lg:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-[#6d5a51]">{description}</p>
          <Link
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-[#201713] px-6 text-sm font-bold text-white"
            href={shopHref}
          >
            Shop Collection
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <Link
                className="group overflow-hidden rounded-lg border border-[#e8ded5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href={`/products/${product.slug}`}
                key={product.slug}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#eee3d8]">
                  <Image
                    alt={product.name}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={product.imageUrl}
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6d5a51]">
                    {product.shortSummary}
                  </p>
                  <p className="mt-4 font-semibold">
                    {formatPrice(product.prices[activeCurrency], activeCurrency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-lg border border-[#e8ded5] bg-white p-8 text-[#6d5a51]">
            New pieces for this collection will appear here once products are added.
          </div>
        )}
      </section>
    </main>
  );
}
