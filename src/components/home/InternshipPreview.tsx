import { GraduationCap, Briefcase, Award, ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";

// Icons for the 3 highlight chips are fixed by position; the chip text is editable.
const HIGHLIGHT_ICONS: LucideIcon[] = [Briefcase, Award, GraduationCap];

export default function InternshipPreview({
  content = HOME_DEFAULTS.internshipPreview,
}: {
  content?: HomeContent["internshipPreview"];
}) {
  return (
    <section className="py-24 relative bg-background border-t border-border">
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-card rounded-2xl p-8 md:p-16 border border-border overflow-hidden relative shadow-sm">
          <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div data-reveal>
                <div className="inline-flex px-4 py-1.5 rounded-md bg-secondary text-secondary-foreground font-semibold text-xs tracking-widest uppercase mb-6 items-center gap-2 border border-border">
                  <GraduationCap className="w-4 h-4" /> {content.badge}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                  {content.heading} <br className="hidden md:block"/> <span className="text-primary">{content.headingHighlight}</span>
                </h2>
                <p className="text-foreground/70 text-lg mb-10 leading-relaxed max-w-lg">
                  {content.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-10">
                  {content.highlights.map((text, idx) => {
                    const Icon = HIGHLIGHT_ICONS[idx % HIGHLIGHT_ICONS.length];
                    return (
                      <div key={`${text}-${idx}`} className="flex items-center gap-2 text-foreground/80 bg-secondary px-4 py-2 rounded-full border border-border">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{text}</span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/internship"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:scale-105 transition-all shadow-md w-full sm:w-auto"
                >
                  {content.buttonLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div
                data-reveal="s95"
                className="relative aspect-video rounded-xl overflow-hidden border border-border shadow-lg"
              >
                {content.image && (
                  <Image
                    src={content.image}
                    alt="Students working on laptops"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
                
                {/* Minimalist overlay stat */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-background/90 border border-border backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-primary font-bold text-xl">{content.statValue}</span>
                    </div>
                    <div>
                      <div className="text-foreground font-bold tracking-tight">{content.statLabel}</div>
                      <div className="text-foreground/70 text-sm">For our certified interns</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
