export type Cta = { label: string; href: string };

export type HomeContent = {
  hero: {
    badge: string;
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    description: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    backgroundImages?: string[];
  };
  stats: { value: number; label: string }[];
  services: {
    heading: string;
    headingHighlight: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  whyChooseUs: {
    eyebrow: string;
    heading: string;
    headingHighlight: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
    items: { title: string; desc: string }[];
  };
  // Item lists for these three sections come live from the Products,
  // Portfolio, and Technology tables (see public-catalog.service.ts) — only
  // the surrounding heading/subtitle/button copy is admin-editable content.
  technologyPreview: {
    heading: string;
    headingHighlight: string;
    subtitle: string;
  };
  productsPreview: {
    heading: string;
    headingHighlight: string;
    subtitle: string;
    buttonLabel: string;
    buttonHref: string;
  };
  portfolioPreview: {
    heading: string;
    headingHighlight: string;
    subtitle: string;
    buttonLabel: string;
  };
  internshipPreview: {
    badge: string;
    heading: string;
    headingHighlight: string;
    description: string;
    highlights: string[];
    buttonLabel: string;
    image: string;
    statValue: string;
    statLabel: string;
  };
  cta: {
    heading: string;
    headingHighlight: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    tertiaryLabel: string;
    tertiaryHref: string;
  };
};

export type AboutContent = {
  hero: {
    badge: string;
    titlePrefix: string;
    titleHighlight: string;
    description: string;
  };
  intro: {
    imageUrl: string;
    yearsBadgeValue: string;
    yearsBadgeLabel: string;
    headingTitle: string;
    headingHighlight: string;
    subtitle: string;
    paragraphs: string[];
  };
  mission: string;
  vision: string;
  journey: { year: string; title: string; desc: string }[];
  achievements: { title: string; desc: string }[];
  whyChooseUs: string[];
};

export type FooterContent = {
  description: string;
  columns: { title: string; links: { name: string; href: string }[] }[];
  copyrightText: string;
  newsletterText: string;
};

export type PageKey = "home" | "about" | "footer";
