import Image from "next/image";
import Link from "next/link";
import { CurrencySwitcher } from "@/app/currency/currency-switcher";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { getCartSummary } from "@/lib/cart";
import { formatPrice } from "@/lib/store";
import { removeCartItemAction, updateCartItemAction } from "./actions";

export const metadata = {
  title: "Cart | Treshatrendy",
};

export default async function CartPage() {
  const cart = await getCartSummary();

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <header className="relative border-b border-[#e8ded5] bg-white">
        <div className="mx-auto flex min-h-16 max-w-[92rem] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <CurrencySwitcher activeCurrency={cart.currency} redirectTo="/cart" />
            </div>
            <Link href="/shop" className="hidden text-sm font-semibold text-[#8a3f2b] sm:inline">
              Continue shopping
            </Link>
            <HeaderActions />
            <MobileMenu />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-3 py-10 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a3f2b]">
              Cart
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Your selected pieces</h1>
          </div>
          <p className="text-sm text-[#6d5a51]">
            {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
          </p>
        </div>

        {cart.lines.length === 0 ? (
          <div className="mt-8 rounded-lg border border-[#e8ded5] bg-white p-10 text-center">
            <p className="text-lg font-semibold">Your cart is empty.</p>
            <Link
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[#201713] px-5 text-sm font-semibold text-white"
              href="/shop"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="divide-y divide-[#e8ded5] rounded-lg border border-[#e8ded5] bg-white">
              {cart.lines.map((line) => (
                <article
                  className="grid gap-4 p-4 sm:grid-cols-[112px_1fr_auto]"
                  key={line.id}
                >
                  <Image
                    alt={line.name}
                    className="aspect-[4/5] w-28 rounded-md object-cover"
                    height={140}
                    src={line.imageUrl}
                    width={112}
                  />
                  <div>
                    <Link
                      className="text-lg font-semibold text-[#201713]"
                      href={`/products/${line.slug}`}
                    >
                      {line.name}
                    </Link>
                    <p className="mt-1 text-sm text-[#6d5a51]">
                      {line.colorName} · Size {line.size}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#201713]">
                      {formatPrice(line.unitPrice, cart.currency)}
                    </p>
                    <div
                      className={`mt-3 rounded-md border px-3 py-2 text-xs ${
                        line.availabilityTone === "ready"
                          ? "border-[#b9d8be] bg-[#f0fff3] text-[#23562b]"
                          : line.availabilityTone === "delayed"
                            ? "border-[#ead39b] bg-[#fff8e2] text-[#785015]"
                            : "border-[#e2b4a9] bg-[#fff3ef] text-[#8d2f1d]"
                      }`}
                    >
                      <p className="font-semibold">{line.availabilityLabel}</p>
                      <p className="mt-1 leading-5">{line.availabilityDetail}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <form action={updateCartItemAction} className="flex gap-2">
                        <input name="itemId" type="hidden" value={line.id} />
                        <input
                          className="h-10 w-20 rounded-md border border-[#d6c7b7] px-3 text-sm"
                          defaultValue={line.quantity}
                          max={line.stock}
                          min="1"
                          name="quantity"
                          type="number"
                        />
                        <button
                          className="h-10 rounded-md border border-[#d6c7b7] px-3 text-sm font-semibold"
                          type="submit"
                        >
                          Update
                        </button>
                      </form>
                      <form action={removeCartItemAction}>
                        <input name="itemId" type="hidden" value={line.id} />
                        <button
                          className="h-10 rounded-md border border-[#e2b4a9] px-3 text-sm font-semibold text-[#8d2f1d]"
                          type="submit"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="font-semibold text-[#201713] sm:text-right">
                    {formatPrice(line.lineTotal, cart.currency)}
                  </p>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-[#e8ded5] bg-white p-5">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-5 flex justify-between border-t border-[#e8ded5] pt-5 text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {formatPrice(cart.subtotal, cart.currency)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#6d5a51]">
                Shipping and taxes will be confirmed during checkout.
              </p>
              <Link
                className="mt-5 flex h-12 items-center justify-center rounded-md bg-[#201713] text-sm font-bold text-white"
                href="/checkout"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
