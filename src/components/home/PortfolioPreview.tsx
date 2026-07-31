import { ArrowRight, Maximize2, ExternalLink, Layers, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";
import type { PublicPortfolioProject } from "@/lib/services/public-catalog.service";
import { isValidImageSrc } from "@/lib/image-src";
import EmptyState from "@/components/ui/EmptyState";

const PREVIEW_COUNT = 4;

export default function PortfolioPreview({
  content = HOME_DEFAULTS.portfolioPreview,
  projects,
}: {
  content?: HomeContent["portfolioPreview"];
  projects: PublicPortfolioProject[];
}) {
  const items = projects.slice(0, PREVIEW_COUNT);
  return (
    <section className="py-24 relative bg-background border-y border-border">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2
              data-reveal
              className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            >
              {content.heading} <span className="text-primary">{content.headingHighlight}</span>
            </h2>
            <p
              data-reveal
              style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
              className="text-foreground/70 text-lg leading-relaxed max-w-xl"
            >
              {content.subtitle}
            </p>
          </div>
          <Link href="/portfolio" className="group flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors pb-2">
            {content.buttonLabel} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Portfolio Coming Soon"
            description="Projects added from the admin panel will appear here automatically."
            actionLabel="Browse Portfolio"
            actionHref="/portfolio"
          />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {items.map((project, idx) => (
            <div
              key={project.id}
              data-reveal="y30"
              style={{ "--reveal-delay": `${idx * 0.1}s`, "--reveal-dur": "0.6s" } as React.CSSProperties}
              className="group flex flex-col gap-5 cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(0,103,184,0.3)] group-hover:border-[#0067b8]/40">
                {isValidImageSrc(project.image) ? (
                  <Image
                    src={project.image!}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-foreground/20" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Link
                      href={`/portfolio/${project.slug}`}
                      aria-label={`View ${project.title} case study`}
                      className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </Link>
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${project.title} live site`}
                        className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors tracking-tight">
                  {project.title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6 flex-grow line-clamp-2">
                  {project.description}
                </p>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary w-fit"
                >
                  View Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
