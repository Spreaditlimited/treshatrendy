import Link from "next/link";
import { mainNavItems } from "@/lib/navigation";

type MainNavigationProps = {
  activeHref?: string;
};

export function MainNavigation({ activeHref }: MainNavigationProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="hidden flex-1 items-center justify-center gap-4 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-600 xl:flex"
    >
      {mainNavItems.map((item) => (
        <Link
          aria-current={item.href === activeHref ? "page" : undefined}
          className={`transition-colors duration-300 hover:text-neutral-900 ${
            item.href === activeHref ? "font-semibold text-neutral-900" : ""
          }`}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
