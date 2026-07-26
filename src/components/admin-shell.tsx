import Link from "next/link";
import { Logo } from "@/components/logo";
import type { AdminUser } from "@/generated/prisma/client";
import { logoutAction } from "@/app/admin/actions";

type AdminShellProps = {
  admin: Pick<AdminUser, "email" | "name">;
  children: React.ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/admin", marker: "01" },
  { label: "Products", href: "/admin/products", marker: "02" },
  { label: "Orders", href: "/admin/orders", marker: "03" },
  { label: "View Storefront", href: "/shop", marker: "04" },
];

export function AdminShell({ admin, children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#201713]">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-between border-r border-white/10 bg-[#201713] text-[#fbfaf7] lg:flex">
          <div className="p-6">
            <Logo
              adminLabel
              className="text-white [&_span]:text-white [&_svg_text]:fill-white"
              href="/admin"
            />
            <p className="mt-5 border-t border-white/10 pt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#f5c56f]">
              Admin Console
            </p>

            <nav className="mt-8 grid gap-2">
              {navItems.map((item) => (
                <Link
                  className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#e8ded5] transition hover:bg-white/10 hover:text-white"
                  href={item.href}
                  key={item.href}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-[11px] font-semibold text-[#f5c56f] group-hover:border-[#f5c56f]/40">
                    {item.marker}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/10 p-5">
            <p className="truncate text-sm font-semibold text-white">
              {admin.name || "Administrator"}
            </p>
            <p className="mt-1 truncate text-xs text-[#d8c7b8]">{admin.email}</p>
            <form action={logoutAction} className="mt-4">
              <button
                className="h-10 w-full rounded-md border border-white/15 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8ded5] transition hover:border-[#f5c56f] hover:bg-[#f5c56f] hover:text-[#201713]"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#e8ded5] bg-[#fffdf9] px-4 py-4 sm:px-6 lg:hidden">
            <Logo adminLabel href="/admin" />
            <form action={logoutAction}>
              <button className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a3f2b]">
                Sign out
              </button>
            </form>
          </header>
          <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
