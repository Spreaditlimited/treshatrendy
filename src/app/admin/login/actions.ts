"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!prisma) {
    return {
      error: "The database is not configured yet.",
    };
  }

  if (!email || !password) {
    return {
      error: "Enter your admin email and password.",
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: {
      email,
    },
  });

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return {
      error: "The email or password is incorrect.",
    };
  }

  await createAdminSession(admin);
  redirect("/admin");
}
