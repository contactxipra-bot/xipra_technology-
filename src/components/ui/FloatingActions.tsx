"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";

/*
  Previously framer-motion (`whileHover`/`whileTap` on the WhatsApp link, and an
  AnimatePresence-wrapped back-to-top button). Both are now CSS:

  - hover/tap scaling is `hover:scale-110 active:scale-90` on a transform
    transition, which the compositor handles without any JS;
  - the back-to-top button stays mounted and toggles a class instead of being
    added/removed from the tree. That keeps the exit animation AnimatePresence
    provided — CSS transitions run in both directions — while removing the
    mount/unmount React work. `visibility` is transitioned alongside opacity so
    the hidden button is neither clickable nor focusable.

  This component renders on every page of the site.
*/
export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    // passive: the handler never calls preventDefault, so this lets the
    // compositor scroll without waiting on it.
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919033387254?text=*Hello%20Xipra%20Technology!*%20%F0%9F%91%8B%0A%0AI%20recently%20visited%20your%20website%20and%20I%20am%20very%20interested%20in%20your%20services.%20%F0%9F%9A%80%0A%0A*I%20would%20like%20to%20know%20more%20about%3A*%0A%F0%9F%8C%90%20Web%20Development%0A%F0%9F%93%B1%20Mobile%20App%20Development%0A%F0%9F%8E%A8%20UI%2FUX%20Design%0A%0APlease%20let%20me%20know%20a%20good%20time%20to%20connect!%20%E2%9C%A8"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="w-12 h-12 rounded-full bg-[#25D366] text-foreground flex items-center justify-center shadow-lg hover:shadow-[#25D366]/50 transition-[box-shadow,transform] duration-200 hover:scale-110 active:scale-90"
      >
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
      </a>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        className={`w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-md border border-foreground/20 text-foreground flex items-center justify-center shadow-lg hover:bg-foreground/20 mt-2 transition-[opacity,transform,visibility,background-color] duration-200 ease-out hover:scale-110 active:scale-90 ${
          showBackToTop
            ? "opacity-100 translate-y-0 scale-100 visible"
            : "opacity-0 translate-y-5 scale-50 invisible pointer-events-none"
        }`}
      >
        <ArrowUp className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
