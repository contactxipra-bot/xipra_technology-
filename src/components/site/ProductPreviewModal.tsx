"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { PublicProduct } from "@/lib/services/public-catalog.service";
import { isValidImageSrc } from "@/lib/image-src";
import { useLenis } from "@/components/ui/SmoothScrollProvider";

const SWIPE_THRESHOLD_PX = 40;
const FADE_DURATION_S = 0.18; // 180ms, within the requested 150-200ms range

// Keys whose default behavior scrolls the page — blocked while the modal is
// open so they can't scroll the background out from behind it.
const SCROLL_KEYS = new Set([" ", "Spacebar", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);

type ThumbnailProps = {
  src: string;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
};

const Thumbnail = memo(function Thumbnail({ src, index, isActive, onSelect }: ThumbnailProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Show image ${index + 1}`}
      aria-current={isActive}
      className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border transition-all ${
        isActive
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent"
          : "border-foreground/10 opacity-60 hover:opacity-100"
      }`}
    >
      <Image src={src} alt="" fill sizes="64px" loading="lazy" className="object-cover" />
    </button>
  );
});

export default function ProductPreviewModal({
  product,
  onClose,
}: {
  product: PublicProduct | null;
  onClose: () => void;
}) {
  const validImages = product?.images?.filter(isValidImageSrc) ?? [];
  const hasValidImage = isValidImageSrc(product?.image);
  const hasGallery = validImages.length > 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const lenis = useLenis();

  // Start at the first image whenever a (new) product is opened.
  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  const isOpen = Boolean(product);

  // Lock background scroll while the modal is open. Uses the fixed-body
  // technique (not just overflow: hidden) because that's what reliably stops
  // touch scrolling on iOS Safari too, and it naturally preserves the exact
  // scroll position to restore on close without any layout jump.
  useEffect(() => {
    if (!isOpen) return;

    // The site drives scrolling through Lenis (see SmoothScrollProvider),
    // which intercepts wheel/touch input at the document level and keeps
    // animating on its own rAF loop — `body.style.overflow` alone doesn't
    // stop it. It has to be paused explicitly, in addition to the CSS lock
    // below (which is what stops native scroll — keyboard, scrollbar, and
    // acts as a backstop on any page Lenis isn't controlling).
    // Captured once so the cleanup resumes the same instance it paused, even if
    // the provider swapped instances while the modal was open.
    const lenisInstance = lenis?.current;
    lenisInstance?.stop();

    const scrollY = window.scrollY;
    const body = document.body.style;
    const html = document.documentElement.style;
    const prev = {
      bodyOverflow: body.overflow,
      bodyPosition: body.position,
      bodyTop: body.top,
      bodyWidth: body.width,
      htmlOverflow: html.overflow,
    };

    body.overflow = "hidden";
    body.position = "fixed";
    body.top = `-${scrollY}px`;
    body.width = "100%";
    html.overflow = "hidden";

    function blockScrollKeys(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (!isEditable && SCROLL_KEYS.has(e.key)) {
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", blockScrollKeys, { passive: false });

    return () => {
      body.overflow = prev.bodyOverflow;
      body.position = prev.bodyPosition;
      body.top = prev.bodyTop;
      body.width = prev.bodyWidth;
      html.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", blockScrollKeys);
      lenisInstance?.start();
    };
  }, [isOpen, lenis]);

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < validImages.length - 1;

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(validImages.length - 1, i + 1));
  }, [validImages.length]);

  // Keyboard navigation while the modal is open.
  useEffect(() => {
    if (!product || !hasGallery || validImages.length <= 1) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, hasGallery, validImages.length, goPrev, goNext]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (delta < -SWIPE_THRESHOLD_PX) goNext();
    else if (delta > SWIPE_THRESHOLD_PX) goPrev();
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-background/80 backdrop-blur-md overscroll-none"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl h-[85vh] bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-foreground/10 bg-foreground/5 shrink-0">
              <div>
                <h3 className="font-bold text-foreground">{product.title}</h3>
                <p className="text-xs text-foreground/60">Live Preview</p>
              </div>
              <div className="flex items-center gap-3">
                {hasGallery && validImages.length > 1 && (
                  <span className="text-xs font-medium text-foreground/60 tabular-nums">
                    {activeIndex + 1} / {validImages.length}
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 min-h-0 bg-foreground/5 relative overflow-hidden flex flex-col">
              {product.demoUrl ? (
                <iframe
                  src={product.demoUrl}
                  title={product.title}
                  className="w-full h-full border-none bg-white"
                  loading="lazy"
                  allowFullScreen
                />
              ) : hasGallery ? (
                <>
                  {/* Image viewer */}
                  <div
                    className="relative flex-1 min-h-0"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    <AnimatePresence>
                      <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: FADE_DURATION_S }}
                        className="absolute inset-0 p-4 sm:p-8"
                      >
                        <Image
                          src={validImages[activeIndex]}
                          alt={`${product.title} screenshot ${activeIndex + 1}`}
                          fill
                          className="object-contain"
                          priority={activeIndex === 0}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {validImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goPrev}
                          disabled={!canPrev}
                          aria-label="Previous image"
                          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background/60 backdrop-blur-md border border-foreground/10 flex items-center justify-center text-foreground shadow-lg transition-all hover:scale-110 hover:bg-background/80 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          disabled={!canNext}
                          aria-label="Next image"
                          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background/60 backdrop-blur-md border border-foreground/10 flex items-center justify-center text-foreground shadow-lg transition-all hover:scale-110 hover:bg-background/80 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {validImages.length > 1 && (
                    <div className="shrink-0 flex flex-wrap justify-center gap-2 p-3 sm:p-4 border-t border-foreground/10 bg-background/40">
                      {validImages.map((img, i) => (
                        <Thumbnail key={img} src={img} index={i} isActive={i === activeIndex} onSelect={setActiveIndex} />
                      ))}
                    </div>
                  )}
                </>
              ) : hasValidImage ? (
                <div className="relative w-full h-full p-8">
                  <Image
                    src={product.image as string}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-foreground/50">Preview not available</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
