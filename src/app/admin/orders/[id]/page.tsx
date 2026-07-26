import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/store";
import { updateOrderStatusAction } from "../actions";

type AdminOrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = {
  title: "Order Details | Treshatrendy Admin",
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const admin = await requireAdmin();

  if (!prisma) {
    notFound();
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
      addresses: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = order.addresses.find(
    (address) => address.type === "SHIPPING",
  );

  return (
    <AdminShell admin={admin}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8ded5] pb-6">
          <div>
            <Link
              className="text-sm font-semibold text-[#8a3f2b]"
              href="/admin/orders"
            >
              Orders
            </Link>
            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a3f2b]">
                Order detail
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#201713]">
                {order.orderNumber}
              </h1>
              <p className="mt-2 text-sm text-[#6e5b4f]">
                Created {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#e8ded5] bg-white px-5 text-sm font-semibold text-[#201713] transition hover:border-[#8a3f2b]"
            href="/admin/orders"
          >
            All orders
          </Link>
        </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-6">
          <section className="rounded-lg border border-[#e6d8ca] bg-[#fffdf9] p-6">
            <h2 className="text-lg font-semibold text-[#201713]">Items</h2>
            <div className="mt-5 divide-y divide-[#e6d8ca]">
              {order.items.map((item) => (
                <div
                  className="grid gap-3 py-4 sm:grid-cols-[1fr_120px_120px]"
                  key={item.id}
                >
                  <div>
                    <p className="font-semibold text-[#201713]">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-[#6e5b4f]">
                      {item.colorName} · Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[#201713]">
                    {formatPrice(Number(item.unitPriceAmount), order.currency)}
                  </p>
                  <p className="text-sm font-semibold text-[#201713] sm:text-right">
                    {formatPrice(Number(item.lineTotalAmount), order.currency)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 border-t border-[#e6d8ca] pt-5 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {formatPrice(Number(order.subtotalAmount), order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {formatPrice(Number(order.shippingAmount), order.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#e6d8ca] pt-3 font-semibold">
                <span>Total</span>
                <span>{formatPrice(Number(order.totalAmount), order.currency)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#e6d8ca] bg-[#fffdf9] p-6">
            <h2 className="text-lg font-semibold text-[#201713]">Customer</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="font-semibold text-[#6e5b4f]">Name</dt>
                <dd className="mt-1 text-[#201713]">
                  {order.firstName} {order.lastName}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6e5b4f]">Email</dt>
                <dd className="mt-1 text-[#201713]">{order.email}</dd>
              </div>
              {order.phone ? (
                <div>
                  <dt className="font-semibold text-[#6e5b4f]">Phone</dt>
                  <dd className="mt-1 text-[#201713]">{order.phone}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>

        <aside className="grid h-fit gap-6">
          <section className="rounded-lg border border-[#e6d8ca] bg-[#fffdf9] p-6">
            <h2 className="text-lg font-semibold text-[#201713]">Status</h2>
            <form action={updateOrderStatusAction} className="mt-5 grid gap-4">
              <input name="orderId" type="hidden" value={order.id} />
              <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
                Order status
                <select
                  className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3"
                  defaultValue={order.status}
                  name="status"
                >
                  {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
                Payment status
                <select
                  className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3"
                  defaultValue={order.paymentStatus}
                  name="paymentStatus"
                >
                  {Object.values(PaymentStatus).map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="h-11 rounded-md bg-[#201713] text-sm font-semibold text-white"
                type="submit"
              >
                Save status
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-[#e6d8ca] bg-[#fffdf9] p-6">
            <h2 className="text-lg font-semibold text-[#201713]">Payment</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="font-semibold text-[#6e5b4f]">Provider</dt>
                <dd className="mt-1 text-[#201713]">{order.paymentProvider}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6e5b4f]">PayPal order ID</dt>
                <dd className="mt-1 break-all text-[#201713]">
                  {order.paypalOrderId ?? "Not set"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6e5b4f]">PayPal capture ID</dt>
                <dd className="mt-1 break-all text-[#201713]">
                  {order.paypalCaptureId ?? "Not set"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6e5b4f]">
                  Stripe checkout session
                </dt>
                <dd className="mt-1 break-all text-[#201713]">
                  {order.stripeCheckoutSessionId ?? "Not set"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6e5b4f]">
                  Stripe payment intent
                </dt>
                <dd className="mt-1 break-all text-[#201713]">
                  {order.stripePaymentIntentId ?? "Not set"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6e5b4f]">Paystack reference</dt>
                <dd className="mt-1 break-all text-[#201713]">
                  {order.paystackReference ?? "Not set"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6e5b4f]">Paid at</dt>
                <dd className="mt-1 text-[#201713]">{formatDate(order.paidAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-[#e6d8ca] bg-[#fffdf9] p-6">
            <h2 className="text-lg font-semibold text-[#201713]">Shipping</h2>
            {shippingAddress ? (
              <address className="mt-5 not-italic text-sm leading-6 text-[#201713]">
                {shippingAddress.firstName} {shippingAddress.lastName}
                <br />
                {shippingAddress.line1}
                <br />
                {shippingAddress.line2 ? (
                  <>
                    {shippingAddress.line2}
                    <br />
                  </>
                ) : null}
                {shippingAddress.city}
                {shippingAddress.state ? `, ${shippingAddress.state}` : ""}{" "}
                {shippingAddress.postalCode}
                <br />
                {shippingAddress.countryCode}
                {shippingAddress.phone ? (
                  <>
                    <br />
                    {shippingAddress.phone}
                  </>
                ) : null}
              </address>
            ) : (
              <p className="mt-5 text-sm text-[#6e5b4f]">
                No shipping address on this order.
              </p>
            )}
          </section>
        </aside>
      </section>
      </div>
    </AdminShell>
  );
}
