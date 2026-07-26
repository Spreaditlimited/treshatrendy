"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sizes } from "@/lib/store";

type ShopFilterFormProps = {
  colors: string[];
  defaults: {
    category: string;
    q: string;
    color: string;
    size: string;
    sort: string;
  };
};

export function ShopFilterForm({ colors, defaults }: ShopFilterFormProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaults.q);
  const [color, setColor] = useState(defaults.color);
  const [size, setSize] = useState(defaults.size);
  const [sort, setSort] = useState(defaults.sort);

  function applyFilters() {
    const params = new URLSearchParams();

    if (defaults.category) {
      params.set("category", defaults.category);
    }

    if (q.trim()) {
      params.set("q", q.trim());
    }

    if (color) {
      params.set("color", color);
    }

    if (size) {
      params.set("size", size);
    }

    if (sort && sort !== "newest") {
      params.set("sort", sort);
    }

    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="mt-8 rounded-lg border border-[#e8ded5] bg-white p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_180px_150px_170px_auto]">
        <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
          Search
          <input
            className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
            onChange={(event) => setQ(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFilters();
              }
            }}
            placeholder="Search dresses, tops, prints"
            value={q}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
          Colour
          <select
            className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931]"
            onChange={(event) => setColor(event.target.value)}
            value={color}
          >
            <option value="">All colours</option>
            {colors.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
          Size
          <select
            className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931]"
            onChange={(event) => setSize(event.target.value)}
            value={size}
          >
            <option value="">All sizes</option>
            {sizes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
          Sort
          <select
            className="h-11 rounded-md border border-[#d6c7b7] bg-white px-3 outline-none focus:border-[#8d4931]"
            onChange={(event) => setSort(event.target.value)}
            value={sort}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            className="h-11 rounded-md bg-[#201713] px-5 text-sm font-semibold text-white"
            onClick={applyFilters}
            type="button"
          >
            Apply
          </button>
          <button
            className="h-11 rounded-md border border-[#d6c7b7] px-4 text-sm font-semibold text-[#201713]"
            onClick={() => router.push("/shop")}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
