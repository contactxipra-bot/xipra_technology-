interface SectionHeaderProps {
  title: string;
  highlight: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}

export default function SectionHeader({ title, highlight, subtitle, align = "center" }: SectionHeaderProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  };

  return (
    <div className={`mb-16 ${alignClasses[align]}`}>
      <h2
        data-reveal
        className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight"
      >
        {title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{highlight}</span>
      </h2>
      {subtitle && (
        <p
          data-reveal
          style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
          className={`text-foreground/60 text-lg max-w-2xl ${
            align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
