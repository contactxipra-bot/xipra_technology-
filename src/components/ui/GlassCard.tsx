"use client";

import { ReactNode, useRef } from "react";
import clsx from "clsx";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

/*
  The 3D tilt was framer-motion (`useMotionValue` → `useSpring` → `useTransform`
  driving rotateX/rotateY). Because GlassCard is imported by EmptyState,
  CtaBanner, AboutContent, ContactPageClient and the internship and
  verify-certificate pages, that single effect pulled the whole animation runtime
  (~124 kB raw) into the bundle of nearly every route on the site.

  It is now the same effect expressed as CSS: the pointer handler writes two
  custom properties and the compositor interpolates `transform` toward them. The
  previous spring (stiffness 300 / damping 40) is overdamped — it settles in
  roughly 0.2s with no overshoot — so a 0.2s ease-out transition tracks the
  pointer the same way. Rotation range (±10deg) and the 1000px perspective are
  unchanged.

  Writing to a ref's style directly (rather than through state) keeps this off
  React's render path entirely: a mousemove costs two custom-property writes.
*/
const TILT_DEG = 10;

export default function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Spotlight position (used by the radial-gradient overlays below).
    el.style.setProperty("--mouse-x", `${mouseX}px`);
    el.style.setProperty("--mouse-y", `${mouseY}px`);

    if (!hoverEffect) return;

    // Normalised to [-0.5, 0.5], then mapped to the same rotations as before.
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    el.style.setProperty("--tilt-x", `${(yPct * -2 * TILT_DEG).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(xPct * 2 * TILT_DEG).toFixed(2)}deg`);
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  if (!hoverEffect) {
    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className={clsx(
          "glass-panel rounded-3xl border border-foreground/10 relative overflow-hidden group/card",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_var(--mouse-x,0)_var(--mouse-y,0),rgba(var(--primary),0.06),transparent_40%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10 h-full">{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "glass-card-tilt glass-panel rounded-3xl border border-foreground/10 relative overflow-hidden group/card transition-shadow duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] hover:border-primary/40",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_var(--mouse-x,0)_var(--mouse-y,0),rgba(var(--primary),0.08),transparent_40%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Gloss reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ mixBlendMode: 'overlay' }} />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
