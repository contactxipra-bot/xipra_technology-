import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import GlassCard from "./GlassCard";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div data-reveal className={`max-w-xl mx-auto ${className || ""}`}>
      <GlassCard hoverEffect={false} className="text-center py-16 px-8 md:px-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h3>
        <p className="text-foreground/60 leading-relaxed mb-8 max-w-md mx-auto">{description}</p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-foreground font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)]"
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </GlassCard>
    </div>
  );
}
