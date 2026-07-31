import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/response";
import { slugify } from "@/lib/slugify";
import { revalidateTechnology } from "@/lib/cache";
import type {
  CreateTechnologyCategoryInput,
  UpdateTechnologyCategoryInput,
  CreateTechnologyInput,
  UpdateTechnologyInput,
} from "@/lib/validations/technology.schema";

// ---- Categories ----

export async function listTechnologyCategories() {
  return prisma.technologyCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { technologies: { orderBy: [{ order: "asc" }, { name: "asc" }] } },
  });
}

export async function getTechnologyCategoryById(id: string) {
  const category = await prisma.technologyCategory.findUnique({
    where: { id },
    include: { technologies: true },
  });
  if (!category) throw new HttpError("Category not found", 404);
  return category;
}

async function uniqueCategorySlug(base: string, ignoreId?: string) {
  const root = slugify(base);
  let slug = root;
  let suffix = 1;
  while (
    await prisma.technologyCategory.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    slug = `${root}-${suffix++}`;
  }
  return slug;
}

export async function createTechnologyCategory(data: CreateTechnologyCategoryInput) {
  const slug = await uniqueCategorySlug(data.slug || data.name);
  const created = await prisma.technologyCategory.create({ data: { ...data, slug } });
  revalidateTechnology();
  return created;
}

export async function updateTechnologyCategory(
  id: string,
  data: UpdateTechnologyCategoryInput
) {
  const existing = await getTechnologyCategoryById(id);
  const slug =
    data.slug || data.name
      ? await uniqueCategorySlug(data.slug || data.name || existing.name, id)
      : undefined;
  const updated = await prisma.technologyCategory.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}) },
  });
  revalidateTechnology();
  return updated;
}

export async function deleteTechnologyCategory(id: string) {
  await getTechnologyCategoryById(id);
  await prisma.technologyCategory.delete({ where: { id } });
  revalidateTechnology();
}

// ---- Technologies ----

export async function listTechnologies() {
  return prisma.technology.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { category: true },
  });
}

export async function getTechnologyById(id: string) {
  const technology = await prisma.technology.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!technology) throw new HttpError("Technology not found", 404);
  return technology;
}

async function uniqueTechnologySlug(base: string, ignoreId?: string) {
  const root = slugify(base);
  let slug = root;
  let suffix = 1;
  while (
    await prisma.technology.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    slug = `${root}-${suffix++}`;
  }
  return slug;
}

export async function createTechnology(data: CreateTechnologyInput) {
  const slug = await uniqueTechnologySlug(data.slug || data.name);
  const created = await prisma.technology.create({
    data: { ...data, slug },
    include: { category: true },
  });
  revalidateTechnology();
  return created;
}

export async function updateTechnology(id: string, data: UpdateTechnologyInput) {
  const existing = await getTechnologyById(id);
  const slug =
    data.slug || data.name
      ? await uniqueTechnologySlug(data.slug || data.name || existing.name, id)
      : undefined;
  const updated = await prisma.technology.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}) },
    include: { category: true },
  });
  revalidateTechnology();
  return updated;
}

export async function deleteTechnology(id: string) {
  await getTechnologyById(id);
  await prisma.technology.delete({ where: { id } });
  revalidateTechnology();
}
