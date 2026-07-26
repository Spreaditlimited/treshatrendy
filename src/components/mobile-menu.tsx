"use client";

import Link from "next/link";
import { useState } from "react";
import { mainNavItems } from "@/lib/navigation";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-expanded={isOpen}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-md border border-tresha-border bg-white text-tresha-ink"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="grid gap-1">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full border-b border-tresha-border bg-tresha-bg px-4 py-4 shadow-lg">
          <nav className="grid gap-2">
            {mainNavItems.map((item) => (
              <Link
                className="rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wider text-tresha-ink hover:bg-white hover:text-tresha-brown"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-tresha-border pt-4">
              <Link
                className="rounded-md border border-tresha-border bg-white px-3 py-3 text-center text-sm font-semibold uppercase tracking-wider text-tresha-ink"
                href="/shop"
                onClick={() => setIsOpen(false)}
              >
                Search
              </Link>
              <Link
                className="rounded-md bg-tresha-ink px-3 py-3 text-center text-sm font-semibold uppercase tracking-wider text-white"
                href="/cart"
                onClick={() => setIsOpen(false)}
              >
                Cart
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
