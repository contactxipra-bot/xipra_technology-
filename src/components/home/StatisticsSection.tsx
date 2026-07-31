"use client";

import { useEffect, useRef, useState } from "react";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";

/*
  The count-up used framer-motion's `useSpring` + `useTransform`, which pulled
  the whole animation runtime in for what is a single number ticking upward.
  This is the same effect from a plain requestAnimationFrame loop: ~2s, ease-out
  so it decelerates into the final value exactly as the damped spring did, and it
  stops itself on the last frame rather than leaving a motion value subscribed.

  The card entrance is the shared CSS reveal (`data-reveal`), same as every other
  section on the site.
*/
const DURATION_MS = 2000;
// easeOutCubic — visually matches the previous spring's settle.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function AnimatedCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion, and degrade safely where IO is unavailable:
    // in both cases just show the final number.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / DURATION_MS);
      setDisplay(Math.floor(easeOut(t) * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect(); // `once: true`
        raf = requestAnimationFrame(tick);
      },
      // matches the previous useInView margin
      { rootMargin: "-100px" }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <div
      ref={ref}
      data-reveal
      style={
        {
          "--reveal-from": "translateY(20px) scale(0.9)",
          "--reveal-dur": "0.6s",
        } as React.CSSProperties
      }
      className="p-8 relative group flex flex-col items-center"
    >
      <div className="flex items-baseline text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-500 tracking-tight">
        <span>{display}</span>
        <span className="text-primary ml-1">+</span>
      </div>
      <div className="text-foreground/70 font-semibold text-sm tracking-widest uppercase text-center">
        {label}
      </div>
    </div>
  );
}

export default function StatisticsSection({
  stats = HOME_DEFAULTS.stats,
}: {
  stats?: HomeContent["stats"];
}) {
  return (
    <section className="py-24 relative bg-background border-y border-border overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-x divide-border">
          {stats.map((stat, idx) => (
            <AnimatedCounter key={`${stat.label}-${idx}`} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
