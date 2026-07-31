"use client";

import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";

/**
 * The context holds a ref *container* rather than the Lenis instance itself.
 *
 * The instance can only be constructed in an effect (it needs `window`), so
 * publishing it directly meant the context value changed from `null` to the
 * instance one tick after mount — re-rendering every consumer, which here is
 * the entire page tree, immediately after hydration. A ref container has a
 * stable identity for the life of the provider, so that second render is gone
 * while consumers still reach the live instance through `.current`.
 */
const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

/** Ref to the active Lenis smooth-scroll instance (`.current` is null before mount). */
export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Lenis is configured for wheel smoothing only (`smoothWheel`, with
    // `syncTouch` left at its default of false), so on a touch device it
    // smooths nothing — scrolling there is already the browser's native
    // implementation. Instantiating it anyway cost a permanent 60fps rAF loop
    // on exactly the hardware least able to afford it, for no visible effect.
    // Same reasoning for reduced-motion: the animated easing is the thing that
    // preference asks us not to do.
    const wantsSmooth =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!wantsSmooth) return;

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      // Lenis drives its own requestAnimationFrame loop and cancels it in
      // destroy(). The hand-rolled loop this replaces re-scheduled itself
      // unconditionally, so it kept running at 60fps against a destroyed
      // instance after unmount — one leaked loop per client-side navigation
      // away from the site layout, never reclaimed.
      autoRaf: true,
    });
    lenisRef.current = instance;

    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
