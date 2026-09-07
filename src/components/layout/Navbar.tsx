"use client";

import Link from "next/link";
import Image from "next/image";
import nextDynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { isValidImageSrc } from "@/lib/image-src";
import type { NavLink } from "./NavMobileMenu";

/*
  Loaded only once the menu is actually opened. This keeps framer-motion — which
  only the overlay needs — out of the initial bundle of every public page, while
  leaving the overlay's animation untouched.
*/
const NavMobileMenu = nextDynamic(() => import("./NavMobileMenu"), { ssr: false });

export default function Navbar({
  companyName = "Xipra Technology",
  logoUrl,
}: {
  companyName?: string;
  logoUrl?: string | null;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Stays true after the first open so the overlay remains mounted and can play
  // its exit animation on close.
  const [menuWasOpened, setMenuWasOpened] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    // passive: the handler never calls preventDefault, so this lets the
    // compositor scroll without waiting on it.
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Technology", href: "/technology" },
    { name: "Products", href: "/products" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Internship", href: "/internship" },
    { name: "Hackathon", href: "https://hackathon.xipra.in/" },
  ];

  return (
    <>
      <nav
        className={`nav-enter fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          isScrolled 
            ? "py-3 bg-background/80 backdrop-blur-2xl border-b border-border shadow-sm" 
            : "py-6 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
          >
            {isValidImageSrc(logoUrl) ? (
              <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border">
                <Image src={logoUrl} alt={companyName} fill sizes="36px" className="object-cover" />
              </div>
            ) : (
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-primary-foreground font-bold text-lg">{companyName.charAt(0)}</span>
              </div>
            )}
            <span className="text-xl font-bold text-foreground tracking-tight">
              {companyName === "Xipra Technology" ? (
                <>Xipra<span className="text-foreground/50 font-normal">Tech</span></>
              ) : (
                companyName
              )}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 border-l border-border pl-6">
              <ThemeToggle />
              <Link 
                href="/verify-certificate" 
                className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold transition-colors hover:bg-primary/10"
              >
                Verify Certificate
              </Link>
              <Link 
                href="/contact" 
                className="px-5 py-2 rounded-full bg-foreground text-background text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              className="text-foreground p-2"
              onClick={() => {
                setMenuWasOpened(true);
                setIsMobileMenuOpen(true);
              }}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay — code-split, see NavMobileMenu */}
      {menuWasOpened && (
        <NavMobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navLinks={navLinks}
        />
      )}
    </>
  );
}

