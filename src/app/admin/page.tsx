import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Admin Dashboard | Treshatrendy",
};

async function getDashboardStats() {
  if (!prisma) {
    return {
      products: 0,
      categories: 0,
      orders: 0,
      drafts: 0,
    };
  }

  const [products, categories, orders, drafts] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.product.count({
      where: {
        status: "DRAFT",
      },
    }),
  ]);

  return {
    products,
    categories,
    orders,
    drafts,
  };
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Total Products", value: stats.products, subtext: "Catalog items" },
    { label: "Drafts", value: stats.drafts, subtext: "Unpublished pieces" },
    { label: "Categories", value: stats.categories, subtext: "Shop collections" },
    { label: "Orders", value: stats.orders, subtext: "Lifetime total" },
  ];

  return (
    <AdminShell admin={admin}>
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#e8ded5] pb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a3f2b]">
              Overview
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#201713]">
              Welcome, {admin.name || "Admin"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d5a51]">
              Manage Treshatrendy products, regional inventory, orders, and
              storefront readiness from one clean workspace.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8a3f2b] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d3222]"
            href="/admin/products/new"
          >
            Add new product
          </Link>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              className="relative overflow-hidden rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm transition hover:border-[#8a3f2b]/40"
              key={card.label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d5a51]">
                {card.label}
              </p>
              <p className="mt-3 font-serif text-5xl font-bold text-[#201713]">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-[#6d5a51]">{card.subtext}</p>
              <div className="absolute right-5 top-5 h-2 w-10 rounded-full bg-[#f5c56f]" />
            </article>
          ))}
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6d5a51]">
            Management Hub
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Link
              className="group rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm transition hover:border-[#8a3f2b] hover:shadow-md"
              href="/admin/products"
            >
              <h2 className="text-lg font-semibold text-[#201713] group-hover:text-[#8a3f2b]">
                Product Catalog
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6d5a51]">
                Add, edit, publish, and manage Nigeria and Canada stock.
              </p>
            </Link>
            <Link
              className="group rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm transition hover:border-[#8a3f2b] hover:shadow-md"
              href="/admin/orders"
            >
              <h2 className="text-lg font-semibold text-[#201713] group-hover:text-[#8a3f2b]">
                Order Management
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6d5a51]">
                Review checkout details, payment references, and fulfilment status.
              </p>
            </Link>
            <Link
              className="group rounded-xl border border-[#e8ded5] bg-[#fffdf9] p-6 shadow-sm transition hover:border-[#8a3f2b] hover:shadow-md"
              href="/shop"
              target="_blank"
            >
              <h2 className="text-lg font-semibold text-[#201713] group-hover:text-[#8a3f2b]">
                Live Storefront
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6d5a51]">
                Preview the boutique experience from the customer perspective.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
