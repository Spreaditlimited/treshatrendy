import Link from "next/link";
import { CurrencySwitcher } from "@/app/currency/currency-switcher";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { getActiveCurrency } from "@/lib/currency";
import { mainNavItems } from "@/lib/navigation";

export const metadata = {
  title: "Wholesale African Fashion | Treshatrendy",
  description:
    "Partner with Treshatrendy for curated African fashion wholesale and reseller enquiries.",
};

export default async function WholesalePage() {
  const activeCurrency = await getActiveCurrency();

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
              <CurrencySwitcher activeCurrency={activeCurrency} redirectTo="/wholesale" />
            </div>
            <HeaderActions />
            <MobileMenu />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[92rem] gap-10 px-3 py-16 sm:px-5 lg:grid-cols-[1fr_0.9fr] lg:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
            Wholesale
          </p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight">
            Built for Fashion Entrepreneurs
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#6d5a51]">
            Looking to stock your boutique or grow your fashion business?
          </p>
          <p className="mt-4 text-base leading-8 text-[#6d5a51]">
            Treshatrendy partners with retailers and resellers seeking distinctive
            African fashion that their customers will love. With carefully curated
            collections, dependable service and competitive wholesale pricing,
            we&apos;re proud to support businesses across the world.
          </p>
        </div>

        <form className="rounded-lg border border-[#e8ded5] bg-white p-6">
          <h2 className="text-2xl font-semibold">Wholesale Enquiry</h2>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
              Name
              <input className="h-11 rounded-md border border-[#d6c7b7] px-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
              Email
              <input className="h-11 rounded-md border border-[#d6c7b7] px-3" type="email" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
              Business name
              <input className="h-11 rounded-md border border-[#d6c7b7] px-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
              Tell us what you are looking for
              <textarea className="min-h-32 rounded-md border border-[#d6c7b7] px-3 py-3" />
            </label>
            <button
              className="h-12 rounded-md bg-[#201713] text-sm font-bold text-white"
              type="button"
            >
              Become a Wholesale Partner
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
