import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/store";

export const metadata = {
  title: "Orders | Treshatrendy Admin",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function badgeClass(status: string) {
  if (status === "PAID" || status === "DELIVERED") {
    return "border-[#b9d8be] bg-[#f0fff3] text-[#23562b]";
  }

  if (status === "CANCELLED" || status === "REFUNDED" || status === "FAILED") {
    return "border-[#e2b4a9] bg-[#fff3ef] text-[#8d2f1d]";
  }

  return "border-[#e8ded5] bg-[#fbfaf7] text-[#6d5a51]";
}

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();

  const orders = prisma
    ? await prisma.order.findMany({
        include: {
          items: true,
          addresses: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return (
    <AdminShell admin={admin}>
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8ded5] pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a3f2b]">
              Fulfilment
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#201713]">
              Orders
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d5a51]">
              Review customer orders, payment status, shipping details, and
              fulfilment progress.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#e8ded5] bg-white px-5 text-sm font-semibold text-[#201713] transition hover:border-[#8a3f2b]"
            href="/admin/products"
          >
            Products
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e8ded5] bg-[#fffdf9] shadow-sm">
          <div className="grid gap-4 border-b border-[#e8ded5] bg-[#fbfaf7] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6e5b4f] md:grid-cols-[1fr_1.3fr_1fr_1fr_110px]">
            <span>Order</span>
            <span className="hidden md:block">Customer</span>
            <span className="hidden md:block">Total</span>
            <span className="hidden md:block">Status</span>
            <span className="hidden md:block">Items</span>
          </div>

          {orders.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#6e5b4f]">
              No orders yet.
            </div>
          ) : (
            <div className="divide-y divide-[#e8ded5]">
              {orders.map((order) => (
                <Link
                  className="grid gap-3 px-4 py-4 transition hover:bg-[#f7efe7] md:grid-cols-[1fr_1.3fr_1fr_1fr_110px]"
                  href={`/admin/orders/${order.id}`}
                  key={order.id}
                >
                  <div>
                    <p className="font-semibold text-[#201713]">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-[#6e5b4f]">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-sm text-[#6e5b4f]">
                    <p className="font-medium text-[#201713]">
                      {order.firstName} {order.lastName}
                    </p>
                    <p>{order.email}</p>
                  </div>
                  <p className="font-semibold text-[#201713]">
                    {formatPrice(Number(order.totalAmount), order.currency)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${badgeClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${badgeClass(
                        order.paymentStatus,
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-sm text-[#6e5b4f]">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
