import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";

export default function CtaSection({
  content = HOME_DEFAULTS.cta,
}: {
  content?: HomeContent["cta"];
}) {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <div className="relative rounded-[2rem] overflow-hidden bg-foreground">
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none opacity-50" />
          
          <div className="relative z-10 py-24 px-6 md:px-12 text-center max-w-4xl mx-auto">
            <h2
              data-reveal="y30"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-8 tracking-tight"
            >
              {content.heading} <br className="hidden md:block"/> <span className="text-primary">{content.headingHighlight}</span> Your Business?
            </h2>

            <p
              data-reveal="y30"
              style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
              className="text-xl text-background/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              {content.description}
            </p>

            <div
              data-reveal="y30"
              style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href={content.primaryHref}
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform w-full sm:w-auto shadow-xl shadow-primary/20"
              >
                {content.primaryLabel}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={content.tertiaryHref}
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-background/10 text-background font-medium hover:bg-background/20 transition-colors border border-background/20 backdrop-blur-md w-full sm:w-auto"
              >
                <ShieldCheck className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                {content.tertiaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
