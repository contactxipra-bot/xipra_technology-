"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/*
  The two icons cross-fade with rotate + scale + opacity over 0.3s. This was a
  pair of framer-motion elements with `initial={false}`; as CSS transitions the
  behaviour is the same (no animation on first paint, animate on theme change)
  but the component no longer needs framer-motion to hydrate — and this control
  renders twice in the Navbar, on every page.

  `ease-[cubic-bezier(0.42,0,0.58,1)]` is framer-motion's `easeInOut`.
*/
const ICON_BASE =
  "absolute transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.42,0,0.58,1)]";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center opacity-0" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center overflow-hidden hover:bg-foreground/10 hover:border-primary/30 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:scale-105"
      aria-label="Toggle theme"
    >
      <div
        className={`${ICON_BASE} ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      >
        <Moon className="w-5 h-5 text-foreground/80" />
      </div>
      <div
        className={`${ICON_BASE} ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      >
        <Sun className="w-5 h-5 text-yellow-500" />
      </div>
    </button>
  );
}
