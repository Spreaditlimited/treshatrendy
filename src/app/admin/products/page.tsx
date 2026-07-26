import Link from "next/link";
import Image from "next/image";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getCanadaStock, getNigeriaStock } from "@/lib/regional-stock";
import { formatPrice } from "@/lib/store";
import { deleteProductAction } from "./actions";

export const metadata = {
  title: "Products | Treshatrendy Admin",
};

export default async function AdminProductsPage() {
  const admin = await requireAdmin();

  const products = prisma
    ? await prisma.product.findMany({
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          images: {
            orderBy: {
              sortOrder: "asc",
            },
            take: 1,
          },
          prices: true,
          variants: true,
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
              Catalog
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#201713]">
              Products
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d5a51]">
              Manage product content, publishing status, prices, and regional stock.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8a3f2b] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d3222]"
            href="/admin/products/new"
          >
            Add product
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e8ded5] bg-[#fffdf9] shadow-sm">
          <div className="grid grid-cols-[88px_1fr] gap-4 border-b border-[#e8ded5] bg-[#fbfaf7] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6e5b4f] md:grid-cols-[88px_1.6fr_1fr_1fr_120px_90px_100px]">
            <span>Image</span>
            <span>Product</span>
            <span className="hidden md:block">Categories</span>
            <span className="hidden md:block">Price</span>
            <span className="hidden md:block">Stock</span>
            <span className="hidden md:block">Status</span>
            <span className="hidden md:block">Actions</span>
          </div>
          {products.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#6e5b4f]">
              No products yet.
            </div>
          ) : (
            <div className="divide-y divide-[#e8ded5]">
              {products.map((product) => {
                const ngnPrice = product.prices.find(
                  (price) => price.currency === "NGN",
                );
                const totalStock = product.variants.reduce(
                  (sum, variant) => sum + variant.stock,
                  0,
                );
                const nigeriaStock = product.variants.reduce(
                  (sum, variant) => sum + getNigeriaStock(variant),
                  0,
                );
                const canadaStock = product.variants.reduce(
                  (sum, variant) => sum + getCanadaStock(variant),
                  0,
                );

                return (
                  <article
                    className="grid grid-cols-[88px_1fr] gap-4 px-4 py-4 transition hover:bg-[#f7efe7] md:grid-cols-[88px_1.6fr_1fr_1fr_120px_90px_100px]"
                    key={product.id}
                  >
                    <Image
                      alt={product.name}
                      className="aspect-[4/5] w-20 rounded-md border border-[#e6d8ca] object-cover"
                      height={100}
                      src={product.images[0]?.url ?? "/images/treshatrendy-hero.png"}
                      width={80}
                    />
                    <div>
                      <Link
                        className="font-semibold text-[#201713] transition hover:text-[#8a3f2b]"
                        href={`/admin/products/${product.id}/edit`}
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-[#6e5b4f]">/{product.slug}</p>
                      <p className="mt-2 text-sm text-[#6e5b4f] md:hidden">
                        {product.status} · NG {nigeriaStock} · CA {canadaStock}
                      </p>
                      <div className="mt-3 flex gap-2 md:hidden">
                        <Link
                          className="rounded-md border border-[#d6c7b7] px-3 py-2 text-xs font-semibold text-[#201713]"
                          href={`/admin/products/${product.id}/edit`}
                        >
                          Edit
                        </Link>
                        <form action={deleteProductAction}>
                          <input name="productId" type="hidden" value={product.id} />
                          <button
                            className="rounded-md border border-[#e2b4a9] px-3 py-2 text-xs font-semibold text-[#8d2f1d]"
                            type="submit"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                    <p className="hidden text-sm text-[#6e5b4f] md:block">
                      {product.categories
                        .map(({ category }) => category.name)
                        .join(", ")}
                    </p>
                    <p className="hidden text-sm font-semibold text-[#201713] md:block">
                      {ngnPrice ? formatPrice(Number(ngnPrice.amount), "NGN") : "-"}
                    </p>
                    <p className="hidden text-sm text-[#6e5b4f] md:block">
                      {totalStock}
                      <br />
                      <span className="text-xs">
                        NG {nigeriaStock} · CA {canadaStock}
                      </span>
                    </p>
                    <p className="hidden text-sm font-semibold text-[#201713] md:block">
                      {product.status}
                    </p>
                    <div className="hidden items-start gap-2 md:flex">
                      <Link
                        className="rounded-md border border-[#d6c7b7] px-3 py-2 text-xs font-semibold text-[#201713] transition hover:border-[#8a3f2b]"
                        href={`/admin/products/${product.id}/edit`}
                      >
                        Edit
                      </Link>
                      <form action={deleteProductAction}>
                        <input name="productId" type="hidden" value={product.id} />
                        <button
                          className="rounded-md border border-[#e2b4a9] px-3 py-2 text-xs font-semibold text-[#8d2f1d] transition hover:bg-[#fff3ef]"
                          type="submit"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
