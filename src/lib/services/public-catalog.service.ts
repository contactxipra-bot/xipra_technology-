import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS, PUBLIC_CACHE_TTL } from "@/lib/cache";

/**
 * Read-only, public-safe data loaders for the Products / Portfolio / Technology
 * pages. Distinct from the admin services: these only return published/active
 * records, ordered for display, with just the fields the public UI needs.
 *
 * Each loader is wrapped in `unstable_cache` so the results are cached across
 * requests (letting the public pages render statically / from the CDN). Admin
 * mutations call the matching `revalidate*` helper in `@/lib/cache`, so edits
 * appear on the live site immediately.
 */

export type PublicProduct = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string;
  image: string | null;
  images: string[];
  demoUrl: string | null;
  features: string[];
};

export const getPublicProducts = unstable_cache(
  async (): Promise<PublicProduct[]> => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      description: p.description,
      image: p.image,
      images: Array.isArray(p.images) ? (p.images as string[]) : [],
      demoUrl: p.demoUrl,
      features: Array.isArray(p.features) ? (p.features as string[]) : [],
    }));
  },
  ["public-products"],
  { tags: [CACHE_TAGS.products], revalidate: PUBLIC_CACHE_TTL }
);

export type PublicPortfolioProject = {
  id: string;
  title: string;
  slug: string;
  category: string;
  client: string | null;
  description: string;
  image: string | null;
  images: string[];
  projectUrl: string | null;
  isFeatured: boolean;
  technologies: string[];
};

export const getPublicPortfolioProjects = unstable_cache(
  async (): Promise<PublicPortfolioProject[]> => {
    const projects = await prisma.portfolioProject.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { technologies: { select: { name: true } } },
    });

    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      client: p.client,
      description: p.description,
      image: p.image,
      images: Array.isArray(p.images) ? (p.images as string[]) : [],
      projectUrl: p.projectUrl,
      isFeatured: p.isFeatured,
      technologies: p.technologies.map((t) => t.name),
    }));
  },
  ["public-portfolio-projects"],
  { tags: [CACHE_TAGS.portfolio], revalidate: PUBLIC_CACHE_TTL }
);

// The slug is passed via `keyParts` (not as a closure over a module-level
// value) so each project gets its own cache entry keyed by slug.
export function getPublicPortfolioProject(slug: string): Promise<PublicPortfolioProject | null> {
  return unstable_cache(
    async (): Promise<PublicPortfolioProject | null> => {
      const p = await prisma.portfolioProject.findUnique({
        where: { slug },
        include: { technologies: { select: { name: true } } },
      });

      if (!p) return null;

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        client: p.client,
        description: p.description,
        image: p.image,
        images: Array.isArray(p.images) ? (p.images as string[]) : [],
        projectUrl: p.projectUrl,
        isFeatured: p.isFeatured,
        technologies: p.technologies.map((t) => t.name),
      };
    },
    ["public-portfolio-project", slug],
    { tags: [CACHE_TAGS.portfolio], revalidate: PUBLIC_CACHE_TTL }
  )();
}

export type PublicTechnology = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export type PublicTechnologyCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  technologies: PublicTechnology[];
};

export const getPublicTechnologyTree = unstable_cache(
  async (): Promise<PublicTechnologyCategory[]> => {
    const categories = await prisma.technologyCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        technologies: {
          orderBy: [{ order: "asc" }, { name: "asc" }],
        },
      },
    });

    return categories
      .filter((c) => c.technologies.length > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        technologies: c.technologies.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          icon: t.icon,
          description: t.description,
        })),
      }));
  },
  ["public-technology-tree"],
  { tags: [CACHE_TAGS.technology], revalidate: PUBLIC_CACHE_TTL }
);
