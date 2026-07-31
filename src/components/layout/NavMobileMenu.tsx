"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/*
  The mobile menu overlay, split out of Navbar so it can be code-split.

  Navbar lives in the site layout, so its framer-motion import put the whole
  animation runtime (~43 kB transferred) into the initial bundle of every public
  page — to animate an overlay most visits never open. The animation itself is
  kept exactly as it was (fade + backdrop-blur, with the exit transition that
  needs AnimatePresence); it is simply loaded on demand, the first time the menu
  is opened.
*/
export interface NavLink {
  name: string;
  href: string;
}

export default function NavMobileMenu({
  isOpen,
  onClose,
  navLinks,
}: {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 z-[200] bg-background/95 lg:hidden flex flex-col justify-center px-6"
        >
          <button
            className="absolute top-6 right-6 p-2 text-foreground/50 hover:text-foreground"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="flex flex-col gap-8 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className="text-2xl font-semibold text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/verify-certificate"
              onClick={onClose}
              className="text-2xl font-bold text-foreground mt-4"
            >
              Verify Certificate
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="text-2xl font-bold text-primary mt-2"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
