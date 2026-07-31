"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";

const FALLBACK_SLIDES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
];

function FuturisticFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full rounded-[20px] bg-gradient-to-b from-black/5 to-black/10 dark:from-white/10 dark:to-white/5 p-[1.5px] shadow-[0_32px_64px_-16px_rgba(0,103,184,0.12)] border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center group pointer-events-auto">
      <style>{`
        @keyframes spin-glow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Soft ambient backlight behind the frame */}
      <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-tr from-cyan-500/5 via-blue-500/5 to-purple-500/5 blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      {/* Thin animated glow trace (subtle, 20s slow rotation) */}
      <div className="absolute inset-0 rounded-[20px] pointer-events-none overflow-hidden opacity-25 dark:opacity-45">
        <div
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,_transparent_0deg,_#22d3ee_120deg,_#3b82f6_240deg,_#8b5cf6_300deg,_transparent_360deg)]"
          style={{
            animation: 'spin-glow 20s linear infinite',
          }}
        />
        <div className="absolute inset-[1.5px] rounded-[18px] bg-white dark:bg-[#070913]" />
      </div>

      {/* Frame content - flush image container */}
      <div className="absolute inset-[1.5px] rounded-[18px] overflow-hidden flex items-center justify-center bg-black/[0.02] dark:bg-black/20">
        {children}
      </div>
    </div>
  );
}

export default function HeroSection({
  content = HOME_DEFAULTS.hero,
}: {
  content?: HomeContent["hero"];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const slides = content.backgroundImages && content.backgroundImages.length > 0
    ? content.backgroundImages
    : FALLBACK_SLIDES;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] as const }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] as const }
    })
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#fafafa] dark:bg-[#0c0f19] text-[#111827] dark:text-[#f3f4f6]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Premium Aurora / Mesh Gradient Background */}
      {/*
        Driven by CSS keyframes (`.aurora-blob-*` in globals.css) rather than
        framer-motion. The motion is unchanged — same offsets, durations and
        easing — but it no longer costs a JavaScript style write per blob per
        frame for as long as the page is open. See globals.css for the mapping.
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="aurora-blob aurora-blob-1 absolute -top-[10%] -left-[10%] w-[50%] h-[60%] bg-[#0067b8] rounded-full blur-[140px] mix-blend-multiply" />
        <div className="aurora-blob aurora-blob-2 absolute -bottom-[10%] -right-[5%] w-[60%] h-[60%] bg-cyan-500 rounded-full blur-[140px] mix-blend-multiply" />
        <div className="aurora-blob aurora-blob-3 absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center min-h-[80vh] lg:min-h-[85vh] relative z-20 pt-24 pb-16 lg:py-24">

        {/* Left Content (Text) */}
        <div className="w-full lg:col-span-5 flex flex-col justify-center z-20 pr-0 lg:pr-6">
          <div
            style={{ animationDelay: "0.2s" }}
            className="hero-rise inline-flex items-center rounded-full px-3.5 py-1 mb-6 text-xs font-semibold bg-[#ffb900]/10 text-[#c28c00] border border-[#ffb900]/25 tracking-wider uppercase w-max"
          >
            {content.badge}
          </div>

          <h1
            style={{ animationDelay: "0.3s" }}
            className="hero-rise text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-[#111827] dark:text-[#f9fafb] mb-6 leading-[1.1]"
          >
            {content.titlePrefix} <span className="text-[#0067b8]">{content.titleHighlight}</span> {content.titleSuffix}
          </h1>

          <p
            style={{ animationDelay: "0.4s" }}
            className="hero-rise text-lg text-[#4b5563] dark:text-[#9ca3af] mb-8 font-normal leading-relaxed max-w-lg"
          >
            {content.description}
          </p>

          <div
            style={{ animationDelay: "0.5s" }}
            className="hero-rise flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href={content.primaryCta.href}
              className="w-full sm:w-auto px-6 py-3 bg-[#0067b8] text-white font-semibold rounded-lg hover:bg-[#005ea6] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center shadow-[0_4px_12px_rgba(0,103,184,0.15)] active:translate-y-0"
            >
              {content.primaryCta.label}
            </Link>
            <Link
              href={content.secondaryCta.href}
              className="w-full sm:w-auto px-6 py-3 bg-transparent text-[#0067b8] font-semibold hover:underline transition-all duration-200 flex items-center justify-center text-center group"
            >
              {content.secondaryCta.label}
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>

        {/* Right Content (Image Slider) */}
        <div className="w-full lg:col-span-7 flex flex-col items-center gap-6 z-10 lg:z-20 relative pointer-events-auto">
          {/* Slider Frame Wrapper */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/10.5]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full flex items-center justify-center"
              >
                <FuturisticFrame>
                  <Image
                    src={slides[currentIndex]}
                    alt="Hero Feature"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    // This image is the LCP element. `priority` alone preloads
                    // it but Lighthouse reported the preload as not priority-
                    // hinted, so it still queued behind the route's scripts.
                    fetchPriority="high"
                    className="object-cover object-center rounded-[18px]"
                  />
                </FuturisticFrame>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimal Elegant Controls - Positioned neatly beneath the image */}
          <div className="flex gap-6 items-center mt-2">
            <button
              onClick={() => paginate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-[#4b5563] dark:text-[#9ca3af] hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2 items-center">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className="group py-2 px-1 flex items-center"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <div
                    className={`transition-all duration-300 rounded-full ${idx === currentIndex
                        ? "w-2.5 h-2.5 bg-[#0067b8] scale-110"
                        : "w-2 h-2 bg-black/20 dark:bg-white/20 group-hover:bg-black/40 dark:group-hover:bg-white/40"
                      }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-[#4b5563] dark:text-[#9ca3af] hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
