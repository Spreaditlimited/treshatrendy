import Image from "next/image";
import Link from "next/link";
import { CurrencySwitcher } from "@/app/currency/currency-switcher";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { SiteFooter } from "@/components/site-footer";
import { SalePrice } from "@/components/sale-price";
import { getActiveCurrency } from "@/lib/currency";
import { mainNavItems } from "@/lib/navigation";
import { getStoreProducts } from "@/lib/products";

const collections = [
  {
    title: "Women's Collection",
    href: "/women",
    imageUrl: "/images/collection-women.png",
    copy: "Elegant silhouettes and timeless pieces designed to inspire confidence.",
  },
  {
    title: "Men's Collection",
    href: "/men",
    imageUrl: "/images/collection-men.png",
    copy: "Refined African fashion combining exceptional comfort and contemporary style.",
  },
  {
    title: "Children's Collection",
    href: "/children",
    imageUrl: "/images/collection-children.png",
    copy: "Beautifully made outfits that celebrate culture and joyful self-expression.",
  },
];

const testimonials = [
  "Every outfit feels special. The quality, the finish and the attention to detail are exceptional.",
  "Our boutique customers always ask when the next Treshatrendy collection is arriving.",
];

export default async function Home() {
  const [activeCurrency, products] = await Promise.all([
    getActiveCurrency(),
    getStoreProducts().catch(() => []),
  ]);
  const featuredProducts = products.slice(0, 4); // Premium brands favor cleaner numbers (e.g., 4 items per row or grid)

  return (
    <main className="min-h-screen bg-[#FCFBFA] text-neutral-900 font-sans selection:bg-neutral-200">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-100 bg-[#FCFBFA]/90 backdrop-blur-md">
        <div className="relative mx-auto flex h-20 max-w-[96rem] items-center justify-between px-6 lg:px-12">
          <Logo />
          <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 md:flex">
            {mainNavItems.map((item) => (
              <Link
                className={`transition-colors duration-300 hover:text-neutral-900 ${
                  item.href === "/" ? "text-neutral-900 font-semibold" : ""
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-xs uppercase tracking-wider">
              <CurrencySwitcher activeCurrency={activeCurrency} redirectTo="/" />
            </div>
            <HeaderActions />
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-neutral-900">
        <Image
          src="/images/treshatrendy-hero-copyspace-v2.png"
          alt="Contemporary African Fashion"
          fill
          priority
          className="object-cover object-[62%_top] brightness-[0.85] md:object-[center_top]"
          sizes="100vw"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-20 mx-auto w-full max-w-[96rem] px-6 lg:px-12 text-white">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-neutral-300">
              Curated for every generation
            </p>
            <h1 className="text-4xl font-light tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
              Contemporary African Fashion, <br />Beautifully Curated
            </h1>
            <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-neutral-200">
              For individuals who appreciate timeless style, vibrant craftsmanship, and clothing that leaves an impression.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center bg-white px-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                Explore Shop
              </Link>
              <Link
                href="/wholesale"
                className="inline-flex h-12 items-center justify-center border border-white/40 px-8 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
              >
                Wholesale Enquiries
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="mx-auto max-w-[96rem] px-6 py-12 lg:px-12 border-t border-neutral-100">
        <div className="flex flex-col justify-between items-baseline gap-4 sm:flex-row mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
              Latest Additions
            </p>
            <h2 className="mt-2 text-3xl font-light tracking-tight">New Arrivals</h2>
          </div>
          <Link 
            href="/shop?sort=newest" 
            className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-900 pb-1 transition-opacity hover:opacity-70"
          >
            View All
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                className="group block"
                href={`/products/${product.slug}`}
                key={product.slug}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="mt-4 space-y-1 text-center sm:text-left">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                    {product.categorySlugs.join(" / ")}
                  </p>
                  <h3 className="text-sm font-normal text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4">
                    {product.name}
                  </h3>
                  <SalePrice
                    amount={product.prices[activeCurrency]}
                    className="mt-1 text-sm font-medium text-neutral-800"
                    currency={activeCurrency}
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs uppercase tracking-widest text-neutral-400 border border-dashed border-neutral-200">
            Collections arriving shortly.
          </div>
        )}
      </section>

      {/* Editorial Intro */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-12">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
          The House of Treshatrendy
        </p>
        <h2 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl text-neutral-900">
          Where Tradition Meets Modern Elegance
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-600">
          Treshatrendy is a destination for contemporary African fashion that honours heritage while embracing modern style.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-relaxed text-neutral-500">
          Our collections are carefully curated for those who value exceptional craftsmanship, distinctive prints, and effortless sophistication.
        </p>
      </section>

      {/* Collections Grid */}
      <section className="bg-neutral-50 py-16 border-y border-neutral-100">
        <div className="mx-auto max-w-[96rem] px-6 lg:px-12">
          <div className="text-center mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
              A Collection of Style
            </p>
            <h2 className="mt-2 text-3xl font-light tracking-tight">Discover the Collections</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {collections.map((collection) => (
              <Link
                className="group block bg-[#FCFBFA] border border-neutral-100 p-3 transition-all duration-300 hover:border-neutral-300"
                href={collection.href}
                key={collection.href}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
                  <Image
                    alt={collection.title}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    src={collection.imageUrl}
                  />
                </div>
                <div className="pt-6 pb-2 px-2">
                  <h3 className="text-lg font-normal tracking-tight text-neutral-900">{collection.title}</h3>
                  <p className="mt-2 text-xs font-light leading-relaxed text-neutral-500">
                    {collection.copy}
                  </p>
                  <p className="mt-4 inline-block text-[11px] font-medium uppercase tracking-[0.2em] border-b border-transparent group-hover:border-neutral-900 pb-0.5 transition-all">
                    Explore →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Ethos Statement */}
      <section className="mx-auto grid max-w-[96rem] gap-10 px-6 py-16 sm:px-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
            Our Philosophy
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight">Curated with Intention</h2>
        </div>
        <div className="text-base font-light leading-relaxed text-neutral-600 space-y-6">
          <p>
            Every piece in our collection is chosen with singular focus on its craftsmanship, quality, and enduring cultural appeal.
          </p>
          <p>
            We believe clothing should transcend visual aesthetics. It should narrate history, celebrate lineage, and comfortably frame life&apos;s most memorable milestones.
          </p>
        </div>
      </section>

      {/* Wholesale & Brand Statement Hybrid Banner */}
      <section className="bg-neutral-900 text-white">
        <div className="mx-auto grid max-w-[96rem] gap-10 px-6 py-16 lg:grid-cols-2 lg:px-12 items-center">
          <div className="lg:pr-12">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
              Partnerships
            </p>
            <h2 className="mt-3 text-4xl font-light tracking-tight leading-tight">Built for Fashion Entrepreneurs</h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-neutral-300">
              Treshatrendy partners globally with premier retailers and independent boutiques seeking distinctive African fashion built to scale.
            </p>
            <Link
              className="mt-8 inline-flex h-12 items-center justify-center bg-white px-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-neutral-100"
              href="/wholesale"
            >
              Become a Partner
            </Link>
          </div>
          <div className="border border-neutral-800 bg-neutral-950/40 p-10 lg:p-14">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
              The Lineage
            </p>
            <h3 className="mt-3 text-2xl font-light tracking-tight">Fashion That Connects Generations</h3>
            <p className="mt-4 text-sm font-light leading-relaxed text-neutral-300">
              From fluid womenswear and sharp tailoring to intentional children&apos;s collections, we blend heritage seamlessly into modern silhouettes.
            </p>
            <div className="mt-8 pt-6 border-t border-neutral-800 space-y-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              <p className="text-white">Designed to celebrate culture.</p>
              <p>Created to inspire confidence.</p>
              <p>Made to be remembered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#FCFBFA] py-16 border-b border-neutral-100">
        <div className="mx-auto max-w-[96rem] px-6 lg:px-12">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400 text-center">
            Client Voices
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            {testimonials.map((quote, index) => (
              <blockquote
                className="text-center px-4"
                key={index}
              >
                <p className="text-lg font-light italic leading-relaxed text-neutral-700">
                  &ldquo;{quote}&rdquo;
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Final Editorial CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-12">
        <h2 className="text-3xl font-light tracking-tight sm:text-4xl">The Art of Dressing Beautifully</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-neutral-500">
          Whether updating your private collection or sourcing seasonal wholesale runs, explore curation built with exceptional luxury guidelines.
        </p>
        <Link
          className="mt-8 inline-flex h-12 items-center justify-center bg-neutral-900 px-8 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800"
          href="/shop"
        >
          Shop The Collection
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
