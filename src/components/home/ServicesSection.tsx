import { Globe, PenTool, Smartphone, Database, Code2, GraduationCap, ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";

// Icons are fixed by position (matches the original 6 services); content (title/desc) is editable.
const ICONS: LucideIcon[] = [Globe, PenTool, Smartphone, Database, Code2, GraduationCap];

export default function ServicesSection({
  content = HOME_DEFAULTS.services,
}: {
  content?: HomeContent["services"];
}) {
  return (
    <section className="py-24 relative bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2
            data-reveal
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
          >
            {content.heading} <span className="text-primary">{content.headingHighlight}</span>
          </h2>
          <p
            data-reveal
            style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
            className="text-foreground/70 text-lg leading-relaxed"
          >
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items.map((service, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <div
                key={`${service.title}-${idx}`}
                data-reveal="y30"
                style={{ "--reveal-delay": `${idx * 0.1}s` } as React.CSSProperties}
                className="group p-10 bg-card border border-border rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-8 transition-colors group-hover:bg-primary">
                  <Icon className="w-6 h-6 text-secondary-foreground group-hover:text-primary-foreground transition-colors" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight group-hover:text-primary transition-colors">
                  {service.title}
                </h3>

                <p className="text-foreground/70 leading-relaxed mb-8 h-20 line-clamp-3">
                  {service.desc}
                </p>

                <Link
                  href="/contact"
                  aria-label={`Learn more about ${service.title}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors cursor-pointer"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
