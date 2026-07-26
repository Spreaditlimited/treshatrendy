"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

const allowedOrderStatuses = new Set(Object.values(OrderStatus));
const allowedPaymentStatuses = new Set(Object.values(PaymentStatus));

function readString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();

  if (!prisma) {
    redirect("/admin/orders");
  }

  const orderId = readString(formData, "orderId");
  const status = readString(formData, "status");
  const paymentStatus = readString(formData, "paymentStatus");

  if (
    !orderId ||
    !allowedOrderStatuses.has(status as OrderStatus) ||
    !allowedPaymentStatuses.has(paymentStatus as PaymentStatus)
  ) {
    redirect("/admin/orders");
  }

  const existingOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      paymentStatus: true,
      paidAt: true,
    },
  });

  if (!existingOrder) {
    redirect("/admin/orders");
  }

  const nextPaymentStatus = paymentStatus as PaymentStatus;
  const paidAt =
    nextPaymentStatus === "PAID" && existingOrder.paymentStatus !== "PAID"
      ? new Date()
      : nextPaymentStatus === "PAID"
        ? existingOrder.paidAt
        : null;

  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: status as OrderStatus,
      paymentStatus: nextPaymentStatus,
      paidAt,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}
