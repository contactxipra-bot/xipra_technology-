"use client";

import { useEffect } from "react";

/**
 * Drives every `[data-reveal]` scroll entrance on the site from one shared
 * IntersectionObserver.
 *
 * This replaces framer-motion's `whileInView`, which attached an observer and a
 * JS-driven animation per element — around 30 of them on the homepage alone,
 * all doing their work while the user was actively scrolling. Here the only
 * per-element work is adding a class; the transition itself is declared in CSS
 * (see `[data-reveal]` in globals.css) and runs off the main thread.
 *
 * Rendered from (site)/template.tsx, which Next.js remounts on every
 * navigation, so each newly rendered page gets its elements picked up. The
 * MutationObserver covers nodes that appear later within a page — client-side
 * filtering, "load more" lists, and modal content.
 */
export default function RevealObserver() {
  useEffect(() => {
    const selector = "[data-reveal]:not(.is-revealing)";

    // Once the entrance has played, drop every trace of it: the element keeps
    // its final painted state from normal styles, and — importantly — no longer
    // carries an animation that would outrank a `hover:` transform.
    const settle = (el: Element) => {
      el.classList.remove("is-revealing");
      el.removeAttribute("data-reveal");
    };

    const revealNow = (el: Element) => {
      el.classList.add("is-revealing");
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        settle(el);
      };
      el.addEventListener("animationend", finish, { once: true });
      // Fallback for the cases where animationend never arrives (element hidden
      // mid-animation, animation skipped): the delay and duration are bounded,
      // so clean up shortly after the longest possible entrance.
      window.setTimeout(finish, 1600);
    };

    // Without IntersectionObserver support, or when the visitor prefers reduced
    // motion, show everything immediately rather than risk hiding content.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.querySelectorAll("[data-reveal]").forEach(settle);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealNow(entry.target);
          // `viewport={{ once: true }}` on every call site it replaces: reveal
          // once, then stop watching so scrolling costs nothing afterwards.
          io.unobserve(entry.target);
        }
      },
      // Matches framer-motion's default in-view threshold closely enough that
      // elements trigger at the same point in the scroll.
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    const observeAll = () =>
      document.querySelectorAll(selector).forEach((el) => io.observe(el));

    observeAll();

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(selector)) io.observe(node);
          node.querySelectorAll?.(selector).forEach((el) => io.observe(el));
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
