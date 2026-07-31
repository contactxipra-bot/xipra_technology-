import { ArrowRight, Box } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HOME_DEFAULTS } from "@/lib/content/defaults";
import type { HomeContent } from "@/lib/content/types";
import type { PublicProduct } from "@/lib/services/public-catalog.service";
import EmptyState from "@/components/ui/EmptyState";
import { isValidImageSrc } from "@/lib/image-src";

const PREVIEW_COUNT = 6;

export default function ProductsPreview({
  content = HOME_DEFAULTS.productsPreview,
  products,
}: {
  content?: HomeContent["productsPreview"];
  products: PublicProduct[];
}) {
  const items = products.slice(0, PREVIEW_COUNT);

  return (
    <section className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-3xl">
            <h2
              data-reveal
              className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            >
              {content.heading} <span className="text-primary">{content.headingHighlight}</span>
            </h2>
            <p
              data-reveal
              style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
              className="text-foreground/70 text-lg leading-relaxed max-w-2xl"
            >
              {content.subtitle}
            </p>
          </div>
          <Link 
            href={content.buttonHref} 
            className="group flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors pb-2"
          >
            {content.buttonLabel}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Box}
            title="Products Coming Soon"
            description="Products added from the admin panel will appear here automatically."
            actionLabel="Browse Products"
            actionHref="/products"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((product, idx) => (
              <div
                key={product.id}
                data-reveal="y30"
                style={{ "--reveal-delay": `${idx * 0.1}s` } as React.CSSProperties}
                className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,103,184,0.3)] hover:border-[#0067b8]/40"
              >
                <div className="relative w-full h-64 bg-muted overflow-hidden flex items-center justify-center p-4">
                  {isValidImageSrc(product.image) ? (
                    <Image 
                      src={product.image!} 
                      alt={product.title} 
                      fill 
                      className="object-contain p-6 transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Box className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    {product.category && (
                      <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-foreground/70 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                    {product.description}
                  </p>
                  
                  <Link
                    href={`/products#${product.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary"
                  >
                    Explore Solution <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
