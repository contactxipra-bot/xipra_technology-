import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(60),
  href: z.string().trim().min(1, "Link is required").max(300),
});

const cardSchema = z.object({
  title: z.string().trim().min(1).max(120),
  desc: z.string().trim().max(600),
});

export const homeContentSchema = z.object({
  hero: z.object({
    badge: z.string().trim().max(120),
    titlePrefix: z.string().trim().max(120),
    titleHighlight: z.string().trim().max(120),
    titleSuffix: z.string().trim().max(120),
    description: z.string().trim().max(600),
    backgroundImages: z.array(z.string().trim().max(600)).optional(),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
  }),
  stats: z
    .array(
      z.object({
        value: z.coerce.number().int().min(0).max(1_000_000),
        label: z.string().trim().min(1).max(60),
      })
    )
    .max(8),
  services: z.object({
    heading: z.string().trim().max(60),
    headingHighlight: z.string().trim().max(60),
    subtitle: z.string().trim().max(300),
    items: z.array(cardSchema).max(9),
  }),
  whyChooseUs: z.object({
    eyebrow: z.string().trim().max(60),
    heading: z.string().trim().max(120),
    headingHighlight: z.string().trim().max(120),
    description: z.string().trim().max(500),
    buttonLabel: z.string().trim().max(60),
    buttonHref: z.string().trim().max(300),
    items: z.array(cardSchema).max(9),
  }),
  technologyPreview: z.object({
    heading: z.string().trim().max(60),
    headingHighlight: z.string().trim().max(60),
    subtitle: z.string().trim().max(300),
  }),
  productsPreview: z.object({
    heading: z.string().trim().max(60),
    headingHighlight: z.string().trim().max(60),
    subtitle: z.string().trim().max(300),
    buttonLabel: z.string().trim().max(60),
    buttonHref: z.string().trim().max(300),
  }),
  portfolioPreview: z.object({
    heading: z.string().trim().max(60),
    headingHighlight: z.string().trim().max(60),
    subtitle: z.string().trim().max(300),
    buttonLabel: z.string().trim().max(60),
  }),
  internshipPreview: z.object({
    badge: z.string().trim().max(60),
    heading: z.string().trim().max(120),
    headingHighlight: z.string().trim().max(60),
    description: z.string().trim().max(600),
    highlights: z.array(z.string().trim().max(60)).max(6),
    buttonLabel: z.string().trim().max(60),
    image: z.string().trim().max(600),
    statValue: z.string().trim().max(12),
    statLabel: z.string().trim().max(60),
  }),
  cta: z.object({
    heading: z.string().trim().max(60),
    headingHighlight: z.string().trim().max(60),
    description: z.string().trim().max(400),
    primaryLabel: z.string().trim().max(60),
    primaryHref: z.string().trim().max(300),
    secondaryLabel: z.string().trim().max(60),
    secondaryHref: z.string().trim().max(300),
    tertiaryLabel: z.string().trim().max(60),
    tertiaryHref: z.string().trim().max(300),
  }),
});

export const aboutContentSchema = z.object({
  hero: z.object({
    badge: z.string().trim().max(120),
    titlePrefix: z.string().trim().max(160),
    titleHighlight: z.string().trim().max(160),
    description: z.string().trim().max(800),
  }),
  intro: z.object({
    imageUrl: z.string().trim().max(600),
    yearsBadgeValue: z.string().trim().max(20),
    yearsBadgeLabel: z.string().trim().max(60),
    headingTitle: z.string().trim().max(60),
    headingHighlight: z.string().trim().max(60),
    subtitle: z.string().trim().max(400),
    paragraphs: z.array(z.string().trim().max(1200)).max(6),
  }),
  mission: z.string().trim().max(1200),
  vision: z.string().trim().max(1200),
  journey: z
    .array(
      z.object({
        year: z.string().trim().max(12),
        title: z.string().trim().max(120),
        desc: z.string().trim().max(600),
      })
    )
    .max(20),
  achievements: z
    .array(
      z.object({
        title: z.string().trim().max(120),
        desc: z.string().trim().max(300),
      })
    )
    .max(12),
  whyChooseUs: z.array(z.string().trim().max(300)).max(12),
});

export const footerContentSchema = z.object({
  description: z.string().trim().max(400),
  copyrightText: z.string().trim().max(200),
  newsletterText: z.string().trim().max(300).optional().default(""),
  columns: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(60),
        links: z
          .array(
            z.object({
              name: z.string().trim().min(1).max(80),
              href: z.string().trim().min(1).max(300),
            })
          )
          .max(20),
      })
    )
    .max(8),
});

export const CONTENT_SCHEMAS = {
  home: homeContentSchema,
  about: aboutContentSchema,
  footer: footerContentSchema,
} as const;

export type ContentKey = keyof typeof CONTENT_SCHEMAS;
