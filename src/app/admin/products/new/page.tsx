import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { ProductForm } from "../product-form";

export const metadata = {
  title: "Add Product | Treshatrendy Admin",
};

export default async function NewProductPage() {
  const admin = await requireAdmin();

  const categories = prisma
    ? await prisma.category.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      })
    : [];

  return (
    <AdminShell admin={admin}>
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8ded5] pb-6">
          <div>
            <Link
              className="text-sm font-semibold text-[#8a3f2b]"
              href="/admin/products"
            >
              Products
            </Link>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#201713]">
              Add product
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d5a51]">
              Create a product with multi-currency pricing, imagery, SEO, and
              Nigeria/Canada stock by size and colour.
            </p>
          </div>
        </div>
        <ProductForm categories={categories} />
      </section>
    </AdminShell>
  );
}
