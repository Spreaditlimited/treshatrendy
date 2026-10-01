"use client";

import { useEffect, useState } from "react";
import {
  christmasSale,
  getChristmasSalePhase,
  type ChristmasSalePhase,
} from "@/lib/christmas-sale";

export function ChristmasSaleBanner() {
  const [phase, setPhase] = useState<ChristmasSalePhase>(() =>
    getChristmasSalePhase(),
  );

  useEffect(() => {
    const updatePhase = () => setPhase(getChristmasSalePhase());
    const timer = window.setInterval(updatePhase, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  if (phase === "ended") {
    return null;
  }

  return (
    <aside
      aria-label="Christmas sale announcement"
      className="bg-[#7c1d2d] px-4 py-2.5 text-center text-white"
    >
      <p className="text-[11px] font-semibold uppercase leading-5 tracking-[0.18em] sm:text-xs sm:tracking-[0.24em]">
        <span aria-hidden="true">✦ </span>
        Christmas Sale · {christmasSale.discountPercent}% off sitewide · 5 October–5 November
        {phase === "upcoming" ? " · Starts 5 October" : " · Now on"}
        <span aria-hidden="true"> ✦</span>
      </p>
    </aside>
  );
}
