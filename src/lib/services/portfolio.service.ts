import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/response";
import { deleteUploadedFile } from "@/lib/upload";
import { slugify } from "@/lib/slugify";
import { revalidatePortfolio } from "@/lib/cache";
import type { PaginationParams } from "@/lib/api/pagination";
import type {
  CreatePortfolioInput,
  UpdatePortfolioInput,
} from "@/lib/validations/portfolio.schema";

export async function listPortfolioProjects({ skip, take, search }: PaginationParams) {
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { category: { contains: search, mode: "insensitive" as const } },
          { client: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.portfolioProject.findMany({
      where,
      skip,
      take,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { technologies: true },
    }),
    prisma.portfolioProject.count({ where }),
  ]);

  return { items, total };
}

export async function getPortfolioProjectById(id: string) {
  const project = await prisma.portfolioProject.findUnique({
    where: { id },
    include: { technologies: true },
  });
  if (!project) throw new HttpError("Project not found", 404);
  return project;
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base);
  let slug = root;
  let suffix = 1;
  while (
    await prisma.portfolioProject.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    slug = `${root}-${suffix++}`;
  }
  return slug;
}

export async function createPortfolioProject(data: CreatePortfolioInput) {
  const { technologyIds, ...rest } = data;
  const slug = await uniqueSlug(data.slug || data.title);
  const created = await prisma.portfolioProject.create({
    data: {
      ...rest,
      slug,
      technologies: technologyIds?.length
        ? { connect: technologyIds.map((id) => ({ id })) }
        : undefined,
    },
    include: { technologies: true },
  });
  revalidatePortfolio();
  return created;
}

export async function updatePortfolioProject(id: string, data: UpdatePortfolioInput) {
  const existing = await getPortfolioProjectById(id);
  const { technologyIds, ...rest } = data;
  const slug =
    data.slug || data.title
      ? await uniqueSlug(data.slug || data.title || existing.title, id)
      : undefined;

  if (data.image && existing.image && data.image !== existing.image) {
    await deleteUploadedFile(existing.image);
  }

  const updated = await prisma.portfolioProject.update({
    where: { id },
    data: {
      ...rest,
      ...(slug ? { slug } : {}),
      technologies: technologyIds
        ? { set: technologyIds.map((tid) => ({ id: tid })) }
        : undefined,
    },
    include: { technologies: true },
  });
  revalidatePortfolio();
  return updated;
}

export async function deletePortfolioProject(id: string) {
  const project = await getPortfolioProjectById(id);
  await deleteUploadedFile(project.image);
  await prisma.portfolioProject.delete({ where: { id } });
  revalidatePortfolio();
}
