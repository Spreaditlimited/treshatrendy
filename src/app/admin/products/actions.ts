"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadProductImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { createSlug } from "@/lib/slug";
import { currencies, sizes } from "@/lib/store";
import type { CurrencyCode } from "@/lib/store";

export type ProductFormState = {
  error?: string;
};

type ColorInput = {
  name: string;
  hex: string | null;
  index: number;
};

function readString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function readNumber(formData: FormData, name: string) {
  const value = Number(readString(formData, name));
  return Number.isFinite(value) ? value : 0;
}

function readColors(formData: FormData): ColorInput[] {
  return Array.from({ length: 6 }, (_, index) => {
    const name = readString(formData, `color-name-${index}`);
    const hex = readString(formData, `color-hex-${index}`);
    return {
      name,
      hex: hex || null,
      index,
    };
  }).filter((color) => color.name);
}

function readCategoryIds(formData: FormData) {
  return formData
    .getAll("categoryIds")
    .map(String)
    .filter(Boolean);
}

function readPrices(formData: FormData) {
  return currencies.map((currency) => ({
    currency: currency.code as CurrencyCode,
    amount: readNumber(formData, `price-${currency.code}`),
  }));
}

function readProductStatus(formData: FormData) {
  const submitStatus = readString(formData, "submitStatus");
  const selectedStatus = readString(formData, "status");
  const status = submitStatus || selectedStatus;

  return status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
}

async function hasPairedSizes(formData: FormData) {
  if (!prisma) {
    return false;
  }

  const pairedSlugs = new Set(["mr-mrs", "mom-daughter"]);
  const categories = await prisma.category.findMany({
    where: {
      id: { in: readCategoryIds(formData) },
    },
    select: { slug: true },
  });

  return categories.some((category) => pairedSlugs.has(category.slug));
}

function readVariants(
  formData: FormData,
  colors: ColorInput[],
  pairedSizes: boolean,
) {
  return colors.flatMap((color) => {
    const sizePairs = pairedSizes
      ? sizes.flatMap((size) => sizes.map((secondSize) => ({ size, secondSize })))
      : sizes.map((size) => ({ size, secondSize: "" }));

    return sizePairs.map(({ size, secondSize }) => {
      const stockKey = secondSize
        ? `${color.index}-${size}-${secondSize}`
        : `${color.index}-${size}`;
      const nigeriaStock = Math.max(
        0,
        Math.floor(readNumber(formData, `nigeria-stock-${stockKey}`)),
      );
      const canadaStock = Math.max(
        0,
        Math.floor(readNumber(formData, `canada-stock-${stockKey}`)),
      );
      const stock = nigeriaStock + canadaStock;
      const skuPrefix = `${readString(formData, "slug") || readString(formData, "name")}-${color.name}`;

      return {
        sku: createSlug(
          secondSize
            ? `${skuPrefix}-${size}-${secondSize}`
            : `${skuPrefix}-${size}`,
        ),
        size,
        secondSize,
        colorName: color.name,
        colorHex: color.hex,
        stock,
        nigeriaStock,
        canadaStock,
        isActive: true,
      };
    });
  });
}

async function saveUploadedImages(files: File[], slug: string) {
  const validFiles = files.filter(
    (file) => file.size > 0 && file.type.startsWith("image/"),
  );

  if (validFiles.length === 0) {
    return [];
  }

  return Promise.all(
    validFiles.map(async (file, index) => {
      const uploadedImage = await uploadProductImage(file, slug, index);

      return {
        url: uploadedImage.secure_url,
        altText: readImageAlt(slug),
        sortOrder: index,
      };
    }),
  );
}

function readImageAlt(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function validateProductInput(formData: FormData, colors: ColorInput[]) {
  const name = readString(formData, "name");
  const description = readString(formData, "description");
  const categoryIds = readCategoryIds(formData);
  const prices = readPrices(formData);

  if (!name) {
    return "Product name is required.";
  }

  if (!description) {
    return "Product description is required.";
  }

  if (categoryIds.length === 0) {
    return "Choose at least one category.";
  }

  if (prices.some((price) => price.amount <= 0)) {
    return "Enter prices for NGN, CAD, and USD.";
  }

  if (colors.length === 0) {
    return "Add at least one colour.";
  }

  return null;
}

export async function createProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  if (!prisma) {
    return { error: "The database is not configured yet." };
  }

  const colors = readColors(formData);
  const validationError = validateProductInput(formData, colors);

  if (validationError) {
    return { error: validationError };
  }

  const name = readString(formData, "name");
  const slug = createSlug(readString(formData, "slug") || name);
  const status = readProductStatus(formData);
  const pairedSizes = await hasPairedSizes(formData);
  const images = await saveUploadedImages(
    formData.getAll("images").filter((file): file is File => file instanceof File),
    slug,
  );

  if (images.length === 0) {
    return { error: "Upload at least one product image." };
  }

  await prisma.product.create({
    data: {
      name,
      slug,
      shortSummary: readString(formData, "shortSummary"),
      description: readString(formData, "description"),
      careNotes: readString(formData, "careNotes") || null,
      status,
      seoTitle: readString(formData, "seoTitle") || null,
      seoDescription: readString(formData, "seoDescription") || null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      categories: {
        create: readCategoryIds(formData).map((categoryId) => ({
          category: {
            connect: {
              id: categoryId,
            },
          },
        })),
      },
      prices: {
        create: readPrices(formData),
      },
      images: {
        create: images,
      },
      variants: {
        create: readVariants(formData, colors, pairedSizes),
      },
    },
  });

  redirect("/admin/products");
}

export async function updateProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  if (!prisma) {
    return { error: "The database is not configured yet." };
  }

  const productId = readString(formData, "productId");
  const colors = readColors(formData);
  const validationError = validateProductInput(formData, colors);

  if (!productId) {
    return { error: "Product is missing." };
  }

  if (validationError) {
    return { error: validationError };
  }

  const name = readString(formData, "name");
  const slug = createSlug(readString(formData, "slug") || name);
  const status = readProductStatus(formData);
  const pairedSizes = await hasPairedSizes(formData);
  const replaceImages = readString(formData, "replaceImages") === "yes";
  const uploadedImages = await saveUploadedImages(
    formData.getAll("images").filter((file): file is File => file instanceof File),
    slug,
  );

  await prisma.$transaction(async (tx) => {
    await tx.productCategory.deleteMany({ where: { productId } });
    await tx.productPrice.deleteMany({ where: { productId } });
    await tx.productVariant.deleteMany({ where: { productId } });

    if (replaceImages && uploadedImages.length > 0) {
      await tx.productImage.deleteMany({ where: { productId } });
    }

    await tx.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        shortSummary: readString(formData, "shortSummary"),
        description: readString(formData, "description"),
        careNotes: readString(formData, "careNotes") || null,
        status,
        seoTitle: readString(formData, "seoTitle") || null,
        seoDescription: readString(formData, "seoDescription") || null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        categories: {
          create: readCategoryIds(formData).map((categoryId) => ({
            category: {
              connect: {
                id: categoryId,
              },
            },
          })),
        },
        prices: {
          create: readPrices(formData),
        },
        variants: {
          create: readVariants(formData, colors, pairedSizes),
        },
        images:
          uploadedImages.length > 0
            ? {
                create: uploadedImages,
              }
            : undefined,
      },
    });
  });

  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  if (!prisma) {
    redirect("/admin/products");
  }

  const productId = readString(formData, "productId");

  if (!productId) {
    redirect("/admin/products");
  }

  const [orderItemCount, cartItemCount] = await Promise.all([
    prisma.orderItem.count({
      where: {
        productId,
      },
    }),
    prisma.cartItem.count({
      where: {
        productId,
      },
    }),
  ]);

  if (orderItemCount > 0 || cartItemCount > 0) {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: "ARCHIVED",
        publishedAt: null,
      },
    });
  } else {
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}
