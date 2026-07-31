import { ArrowRight } from "lucide-react";
import Link from "next/link";
import GlassCard from "./GlassCard";

interface CtaBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
}

export default function CtaBanner({ title, subtitle, buttonText, buttonHref }: CtaBannerProps) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <GlassCard hoverEffect={false} className="text-center md:py-16 md:px-12 border-primary/20 bg-background/40">
          <div
            data-reveal
            style={{ "--reveal-from": "scale(0.9)" } as React.CSSProperties}
            /* The `-translate-x-1/2 -translate-y-1/2` classes that used to be
               here never took effect: framer-motion wrote an inline
               `transform: scale(...)` on this element, which outranks them. They
               are dropped rather than preserved so this decorative glow keeps
               the exact position it renders at today. */
            className="absolute top-1/2 left-1/2 w-full h-full bg-primary/10 blur-[100px] rounded-full pointer-events-none"
          />
          <h2
            data-reveal
            className="text-3xl md:text-5xl font-bold text-foreground mb-6 relative z-10"
          >
            {title}
          </h2>
          <p
            data-reveal
            style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
            className="text-xl text-foreground/60 mb-10 max-w-2xl mx-auto relative z-10"
          >
            {subtitle}
          </p>
          <div
            data-reveal
            style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}
            className="relative z-10"
          >
            <Link
              href={buttonHref}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-foreground font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)]"
            >
              {buttonText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
