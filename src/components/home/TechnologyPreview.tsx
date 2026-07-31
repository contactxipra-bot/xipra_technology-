import { Cpu } from "lucide-react";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";
import type { PublicTechnologyCategory } from "@/lib/services/public-catalog.service";
import EmptyState from "@/components/ui/EmptyState";

const PREVIEW_COUNT = 14;

export default function TechnologyPreview({
  content = HOME_DEFAULTS.technologyPreview,
  categories,
}: {
  content?: HomeContent["technologyPreview"];
  categories: PublicTechnologyCategory[];
}) {
  const items = categories.flatMap((c) => c.technologies).slice(0, PREVIEW_COUNT);
  return (
    <section className="py-24 relative bg-[#f8fbff] dark:bg-[#f8fbff]/5 border-y border-border overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2
          data-reveal
          className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
        >
          {content.heading} <span className="text-primary">{content.headingHighlight}</span>
        </h2>
        <p
          data-reveal
          style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
          className="text-foreground/70 text-lg max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          {content.subtitle}
        </p>

        {items.length === 0 ? (
          <EmptyState
            icon={Cpu}
            title="Technology Stack Coming Soon"
            description="Technologies added from the admin panel will appear here automatically."
            actionLabel="View Technology"
            actionHref="/technology"
          />
        ) : (
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {items.map((tech, idx) => (
              <div
                key={tech.id}
                data-reveal="s90y10"
                style={{ "--reveal-delay": `${idx * 0.03}s`, "--reveal-dur": "0.4s" } as React.CSSProperties}
                className="hover:scale-105 px-6 py-3 bg-[#f0f8ff] dark:bg-[#f0f8ff]/5 border border-border shadow-sm rounded-full flex items-center justify-center cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300"
              >
                <span className="text-foreground/90 font-medium tracking-wide text-sm">{tech.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
