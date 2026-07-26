"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setActiveCurrency } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/store";

const allowedCurrencies = new Set(["NGN", "CAD", "USD"]);

export async function updateCurrencyAction(formData: FormData) {
  const currency = String(formData.get("currency") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/shop");

  if (allowedCurrencies.has(currency)) {
    await setActiveCurrency(currency as CurrencyCode);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/shop");
}
