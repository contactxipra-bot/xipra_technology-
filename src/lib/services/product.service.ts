import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/response";
import { deleteUploadedFile } from "@/lib/upload";
import { slugify } from "@/lib/slugify";
import { revalidateProducts } from "@/lib/cache";
import type { PaginationParams } from "@/lib/api/pagination";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/validations/product.schema";

export async function listProducts({ skip, take, search }: PaginationParams) {
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { category: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new HttpError("Product not found", 404);
  return product;
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base);
  let slug = root;
  let suffix = 1;
  while (
    await prisma.product.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    slug = `${root}-${suffix++}`;
  }
  return slug;
}

export async function createProduct(data: CreateProductInput) {
  const slug = await uniqueSlug(data.slug || data.title);
  const product = await prisma.product.create({ data: { ...data, slug } });
  revalidateProducts();
  return product;
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  const existing = await getProductById(id);
  const slug =
    data.slug || data.title
      ? await uniqueSlug(data.slug || data.title || existing.title, id)
      : undefined;

  if (data.image && existing.image && data.image !== existing.image) {
    await deleteUploadedFile(existing.image);
  }

  // Delete gallery images that were removed in the update
  if (data.images !== undefined) {
    const oldImages = Array.isArray(existing.images) ? (existing.images as string[]) : [];
    const newImages = Array.isArray(data.images) ? (data.images as string[]) : [];
    const removedImages = oldImages.filter(img => !newImages.includes(img));
    await Promise.all(removedImages.map(img => deleteUploadedFile(img)));
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}) },
  });
  revalidateProducts();
  return updated;
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id);
  await deleteUploadedFile(product.image);
  if (Array.isArray(product.images)) {
    const imagePaths = product.images.filter((img): img is string => typeof img === "string");
    await Promise.all(imagePaths.map(img => deleteUploadedFile(img)));
  }
  await prisma.product.delete({ where: { id } });
  revalidateProducts();
}
