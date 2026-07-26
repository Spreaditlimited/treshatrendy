import Link from "next/link";
import { getCartSummary } from "@/lib/cart";

export async function HeaderActions() {
  const cart = await getCartSummary().catch(() => ({
    itemCount: 0,
  }));
  const itemCount = cart.itemCount;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        className="inline-flex h-10 items-center justify-center rounded-md border border-[#e8ded5] bg-white px-4 text-sm font-semibold text-[#201713] transition hover:border-[#8a3f2b] hover:text-[#8a3f2b]"
        href="/shop"
      >
        Search
      </Link>
      <Link
        aria-label={`Cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ded5] bg-white text-[#201713] transition hover:border-[#8a3f2b] hover:text-[#8a3f2b]"
        href="/cart"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M6.5 8h11l-1 11h-9z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
        {itemCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8a3f2b] px-1 text-[10px] font-bold leading-none text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
