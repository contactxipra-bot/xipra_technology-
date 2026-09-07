"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Sparkles, 
  X, 
  Rocket, 
  Flame, 
  Code2, 
  Palette, 
  Laptop, 
  ArrowRight, 
  Users, 
  Award, 
  ChevronRight 
} from "lucide-react";

export default function HackathonPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after 1.2s delay on first visit
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* 1. Continuous Floating Teaser Badge (Bottom-Left) */}
      <div 
        className={`fixed bottom-6 left-6 z-40 transition-all duration-500 ${
          isOpen ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <button
          onClick={handleOpen}
          aria-label="Open Gujarat Virtual Hackathon Details"
          className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-card/90 backdrop-blur-xl border border-primary/40 shadow-xl shadow-primary/10 hover:shadow-primary/30 hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95 text-foreground"
        >
          {/* Animated Glow Pill */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-amber-400 to-rose-500"></span>
          </span>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-primary bg-clip-text text-transparent font-bold">
              Gujarat Virtual Hackathon
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider animate-pulse">
              Coming Soon
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Main Announcement Modal Pop-up */}
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-card border border-primary/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header Banner */}
            <div className="relative px-6 pt-6 pb-4 border-b border-border/60 bg-gradient-to-r from-primary/15 via-background to-amber-500/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        <Flame className="w-3 h-3 text-rose-500" /> Mega Event
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">By Xipra Tech & Wiregen AI</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-0.5">
                      Gujarat Virtual Hackathon
                    </h2>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  aria-label="Close popup"
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Highlight Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-amber-500/10 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Prize Pool</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-amber-400 via-rose-400 to-primary bg-clip-text text-transparent">
                    ₹1,00,000+
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✨ Coming Soon
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">Virtual / Online Event</p>
                </div>
              </div>

              {/* 3 Tracks Preview */}
              <div>
                <p className="text-xs font-bold text-foreground/80 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Competition Tracks:
                </p>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/80 flex flex-col items-center">
                    <Palette className="w-4 h-4 text-purple-400 mb-1" />
                    <span className="text-[11px] font-bold text-foreground">Graphics</span>
                    <span className="text-[10px] text-muted-foreground">UI/UX & Video</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/80 flex flex-col items-center">
                    <Code2 className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] font-bold text-foreground">Frontend</span>
                    <span className="text-[10px] text-muted-foreground">Modern Web UI</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/80 flex flex-col items-center">
                    <Laptop className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[11px] font-bold text-foreground">Full Stack</span>
                    <span className="text-[10px] text-muted-foreground">End-to-End Apps</span>
                  </div>
                </div>
              </div>

              {/* Benefits list */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-foreground/80">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-primary" /> Verifiable Certificates
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> Team & Solo Registrations
                </div>
                <div className="flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-primary" /> Live Mentorship & Jury
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-primary" /> Cash Prizes & Swags
                </div>
              </div>

              {/* Actions CTA */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/hackathon"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary via-blue-600 to-primary hover:opacity-95 text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Rocket className="w-4 h-4" />
                  Explore Hackathon Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleClose}
                  className="py-3 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground/80 text-xs font-medium transition-colors"
                >
                  Remind Me Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
