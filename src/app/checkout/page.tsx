import Image from "next/image";
import Link from "next/link";
import { CurrencySwitcher } from "@/app/currency/currency-switcher";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { getCartSummary } from "@/lib/cart";
import { getShippingOptionsForCurrency } from "@/lib/shipping";
import { formatPrice } from "@/lib/store";
import { PaymentCheckout } from "./payment-checkout";

export const metadata = {
  title: "Checkout | Treshatrendy",
};

export default async function CheckoutPage() {
  const cart = await getCartSummary();
  const shippingOptions = getShippingOptionsForCurrency(cart.currency);

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <header className="relative border-b border-[#e8ded5] bg-white">
        <div className="mx-auto flex min-h-16 max-w-[92rem] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <CurrencySwitcher activeCurrency={cart.currency} redirectTo="/checkout" />
            </div>
            <Link href="/cart" className="hidden text-sm font-semibold text-[#8a3f2b] sm:inline">
              Back to cart
            </Link>
            <HeaderActions />
            <MobileMenu />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[82rem] gap-8 px-3 py-10 sm:px-5 lg:grid-cols-[1fr_420px] lg:px-6">
        <div className="rounded-lg border border-[#e8ded5] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a3f2b]">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Customer details</h1>
          <PaymentCheckout
            currency={cart.currency}
            itemCount={cart.itemCount}
            shippingOptions={shippingOptions}
            subtotal={cart.subtotal}
          />
        </div>

        <aside className="h-fit rounded-lg border border-[#e8ded5] bg-white p-5">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-5 divide-y divide-[#e8ded5]">
            {cart.lines.length === 0 ? (
              <p className="py-6 text-sm text-[#6d5a51]">Your cart is empty.</p>
            ) : (
              cart.lines.map((line) => (
                <div className="flex gap-3 py-4" key={line.id}>
                  <Image
                    alt={line.name}
                    className="aspect-[4/5] w-16 rounded-md object-cover"
                    height={80}
                    src={line.imageUrl}
                    width={64}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#201713]">{line.name}</p>
                    <p className="mt-1 text-sm text-[#6d5a51]">
                      {line.quantity} × {line.colorName}, size {line.size}
                    </p>
                    <p
                      className={`mt-2 text-xs font-semibold ${
                        line.availabilityTone === "ready"
                          ? "text-[#23562b]"
                          : line.availabilityTone === "delayed"
                            ? "text-[#785015]"
                            : "text-[#8d2f1d]"
                      }`}
                    >
                      {line.availabilityLabel}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(line.lineTotal, cart.currency)}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="mt-5 flex justify-between border-t border-[#e8ded5] pt-5">
            <span>Subtotal</span>
            <span className="font-semibold">
              {formatPrice(cart.subtotal, cart.currency)}
            </span>
          </div>
          {cart.saleActive ? (
            <p className="mt-3 text-sm font-semibold text-[#a4233a]">
              Christmas sale discount applied (20% off products).
            </p>
          ) : null}
          <p className="mt-3 text-xs leading-5 text-[#6d5a51]">
            Shipping is selected in the checkout form and added before payment.
          </p>
        </aside>
      </section>
    </main>
  );
}
