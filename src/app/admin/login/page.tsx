import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Login | Treshatrendy",
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-lg border border-[#e6d8ca] bg-[#fffdf9] p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d4931]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#201713]">
            Sign in
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6e5b4f]">
            Manage products, stock, prices, and orders for the store.
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
