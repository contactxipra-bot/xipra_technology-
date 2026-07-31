import { Users, DollarSign, Zap, ShieldCheck, Cpu, Headphones, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";

// Icons are fixed by position (matches the original 6 features); content (title/desc) is editable.
const ICONS: LucideIcon[] = [Users, DollarSign, Zap, ShieldCheck, Cpu, Headphones];

export default function WhyChooseUsSection({
  content = HOME_DEFAULTS.whyChooseUs,
}: {
  content?: HomeContent["whyChooseUs"];
}) {
  return (
    <section className="py-24 relative bg-secondary/20 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">

          <div className="lg:w-1/3">
            <div data-reveal="x-30" className="sticky top-32">
              <div className="inline-block px-4 py-1.5 rounded-md bg-secondary text-secondary-foreground font-semibold text-xs tracking-widest uppercase mb-6 border border-border">
                {content.eyebrow}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                {content.heading} <br/> <span className="text-primary">{content.headingHighlight}</span>
              </h2>
              <p className="text-foreground/70 text-lg leading-relaxed mb-8">
                {content.description}
              </p>
              <Link
                href={content.buttonHref}
                className="inline-block px-8 py-3.5 rounded-full bg-foreground text-background font-semibold hover:scale-105 transition-transform shadow-md"
              >
                {content.buttonLabel}
              </Link>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.items.map((feature, idx) => {
                const Icon = ICONS[idx % ICONS.length];
                return (
                    <div
                      key={`${feature.title}-${idx}`}
                      data-reveal="y30"
                      style={{ "--reveal-delay": `${idx * 0.1}s` } as React.CSSProperties}
                      className="p-8 rounded-2xl bg-[#f0f8ff] dark:bg-[#f0f8ff]/5 border border-border group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                    <div className="flex flex-col gap-5">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary transition-colors">
                        <Icon className="w-6 h-6 text-secondary-foreground group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                        <p className="text-foreground/70 leading-relaxed text-sm">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
