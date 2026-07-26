import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { clearCurrentCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { formatPrice, type CurrencyCode } from "@/lib/store";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export const metadata = {
  title: "Order Confirmed | Treshatrendy",
};

function money(amount: unknown, currency: CurrencyCode) {
  return formatPrice(Number(amount), currency);
}

function formatOrderDate(date?: Date | null) {
  if (!date) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { order: orderNumber } = await searchParams;

  if (orderNumber) {
    await clearCurrentCart();
  }

  const order = orderNumber && prisma
    ? await prisma.order.findUnique({
        where: {
          orderNumber,
        },
        include: {
          addresses: true,
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: {
                      sortOrder: "asc",
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      })
    : null;

  const currency = (order?.currency ?? "USD") as CurrencyCode;
  const shippingAddress = order?.addresses.find((address) => address.type === "SHIPPING");
  const displayOrderNumber = order?.orderNumber ?? orderNumber;
  const paymentLabel = order?.paymentProvider
    ? order.paymentProvider.charAt(0) + order.paymentProvider.slice(1).toLowerCase()
    : "Payment";
  const isPaid = order?.paymentStatus === "PAID";

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#201713]">
      <section className="mx-auto max-w-[92rem] px-4 py-10 sm:px-6 lg:px-10">
        <div className="overflow-hidden rounded-lg border border-[#e8ded5] bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5c56f] text-2xl font-semibold text-[#201713]">
                ✓
              </div>
              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.24em] text-[#8a3f2b]">
                Order confirmed
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Thank you for shopping with Treshatrendy.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#6d5a51]">
                We have received your order and will begin preparing it. A member
                of our team will contact you if we need any extra delivery details.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[#e8ded5] bg-[#fbfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a3f2b]">
                    Order number
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold">
                    {displayOrderNumber ?? "Processing"}
                  </p>
                </div>
                <div className="rounded-lg border border-[#e8ded5] bg-[#fbfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a3f2b]">
                    Payment
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {isPaid ? "Paid" : "Processing"} via {paymentLabel}
                  </p>
                </div>
                <div className="rounded-lg border border-[#e8ded5] bg-[#fbfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a3f2b]">
                    Ordered
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {formatOrderDate(order?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[#201713] px-6 text-sm font-semibold text-white transition hover:bg-[#3b2a22]"
                  href="/shop"
                >
                  Continue shopping
                </Link>
                <a
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[#201713]/20 px-6 text-sm font-semibold text-[#201713] transition hover:border-[#201713]"
                  href="https://wa.me/16475533167"
                  rel="noreferrer"
                  target="_blank"
                >
                  Chat with us
                </a>
              </div>
            </div>

            <aside className="border-t border-[#e8ded5] bg-[#201713] px-6 py-8 text-white sm:px-10 lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f5c56f]">
                Order summary
              </p>

              {order ? (
                <>
                  <div className="mt-7 space-y-5">
                    {order.items.map((item) => (
                      <div className="flex gap-4" key={item.id}>
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-white/10">
                          <Image
                            alt={item.productName}
                            className="object-cover"
                            fill
                            sizes="64px"
                            src={item.product.images[0]?.url ?? "/images/treshatrendy-hero-copyspace-v2.png"}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">{item.productName}</p>
                          <p className="mt-1 text-xs leading-5 text-[#f4dfc8]">
                            Size {item.size} · {item.colorName} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {money(item.lineTotalAmount, currency)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-white/15 pt-5 text-sm">
                    <div className="flex justify-between gap-4 py-2 text-[#f4dfc8]">
                      <span>Subtotal</span>
                      <span>{money(order.subtotalAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between gap-4 py-2 text-[#f4dfc8]">
                      <span>Shipping</span>
                      <span>{money(order.shippingAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-white/15 pt-4 text-base font-semibold text-white">
                      <span>Total</span>
                      <span>{money(order.totalAmount, currency)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-sm leading-7 text-[#f4dfc8]">
                  Your order has been received. We could not load the full order
                  summary on this page, but your confirmation number is saved.
                </p>
              )}
            </aside>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-lg border border-[#e8ded5] bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
              What happens next
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-base font-semibold">1. Order review</p>
                <p className="mt-2 text-sm leading-6 text-[#6d5a51]">
                  We check your selected sizes, colours and stock before packing.
                </p>
              </div>
              <div>
                <p className="text-base font-semibold">2. Delivery prep</p>
                <p className="mt-2 text-sm leading-6 text-[#6d5a51]">
                  Your delivery details are confirmed and prepared for dispatch.
                </p>
              </div>
              <div>
                <p className="text-base font-semibold">3. Updates</p>
                <p className="mt-2 text-sm leading-6 text-[#6d5a51]">
                  We will contact you by email or phone if anything needs attention.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#e8ded5] bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
              Delivery details
            </p>
            {shippingAddress ? (
              <div className="mt-5 text-sm leading-7 text-[#6d5a51]">
                <p className="font-semibold text-[#201713]">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 ? <p>{shippingAddress.line2}</p> : null}
                <p>
                  {shippingAddress.city}
                  {shippingAddress.state ? `, ${shippingAddress.state}` : ""}{" "}
                  {shippingAddress.postalCode}
                </p>
                <p>{shippingAddress.countryCode}</p>
                {shippingAddress.phone ? <p>{shippingAddress.phone}</p> : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-[#6d5a51]">
                Your delivery address has been saved with your order.
              </p>
            )}
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
