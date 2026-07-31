import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface BadgeProps {
  icon?: LucideIcon;
  text: string;
  variant?: "primary" | "secondary" | "success" | "outline";
  className?: string;
}

export default function Badge({ icon: Icon, text, variant = "primary", className }: BadgeProps) {
  const variants = {
    primary: "bg-primary/20 text-primary border-primary/30",
    secondary: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    outline: "bg-foreground/5 text-foreground/80 border-foreground/10",
  };

  return (
    <div className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider backdrop-blur-md", variants[variant], className)}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {text}
    </div>
  );
}
