import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { ProductForm } from "../../product-form";

export const metadata = {
  title: "Edit Product | Treshatrendy Admin",
};

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const admin = await requireAdmin();

  if (!prisma) {
    notFound();
  }

  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        categories: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        prices: true,
        variants: {
          orderBy: [{ colorName: "asc" }, { size: "asc" }],
        },
      },
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

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
              Edit product
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d5a51]">
              {product.name}
            </p>
          </div>
        </div>
        <ProductForm categories={categories} product={product} />
      </section>
    </AdminShell>
  );
}
