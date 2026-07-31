import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/response";
import { getSupabaseAdmin, getPublicUrl, PUBLIC_BUCKETS, CERT_BUCKET, type PublicBucket } from "@/lib/supabase";
import { isValidImageSignature } from "@/lib/file-signature";

/**
 * Media Library — a thin, storage-native layer over the public Supabase
 * Storage buckets. There is no separate database table: the bucket contents
 * ARE the library, so uploads/replaces/deletes here are immediately reflected
 * everywhere else in the app (and vice versa — every existing upload field
 * writes into the same buckets this module reads from).
 */

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

function getMaxSizeBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB) || 10;
  return mb * 1024 * 1024;
}

function assertBucket(bucket: string): asserts bucket is PublicBucket {
  if (!PUBLIC_BUCKETS.includes(bucket as PublicBucket)) {
    throw new HttpError(`Unknown media bucket "${bucket}"`, 400);
  }
}

export type MediaObject = {
  bucket: PublicBucket;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string | null;
  isImage: boolean;
  isPdf: boolean;
};

export async function listMediaObjects(params: {
  bucket: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  assertBucket(params.bucket);
  const { data, error } = await getSupabaseAdmin()
    .storage
    .from(params.bucket)
    .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

  if (error) throw new HttpError(`Failed to list media: ${error.message}`, 500);

  const search = (params.search || "").trim().toLowerCase();
  let objects = (data || []).filter((o) => o.name && o.id !== null);
  if (search) {
    objects = objects.filter((o) => o.name.toLowerCase().includes(search));
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 24));
  const total = objects.length;
  const paged = objects.slice((page - 1) * limit, page * limit);

  const items: MediaObject[] = paged.map((o) => {
    const mimeType = (o.metadata?.mimetype as string) || "application/octet-stream";
    return {
      bucket: params.bucket as PublicBucket,
      name: o.name,
      url: getPublicUrl(params.bucket, o.name),
      size: (o.metadata?.size as number) || 0,
      mimeType,
      createdAt: o.created_at ?? null,
      isImage: mimeType.startsWith("image/"),
      isPdf: mimeType === "application/pdf",
    };
  });

  return { items, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function getBucketUsage() {
  const results = await Promise.all(
    PUBLIC_BUCKETS.map(async (bucket) => {
      const { data, error } = await getSupabaseAdmin().storage.from(bucket).list("", { limit: 1000 });
      if (error) return { bucket, count: 0, totalBytes: 0 };
      const objects = (data || []).filter((o) => o.id !== null);
      const totalBytes = objects.reduce((sum, o) => sum + ((o.metadata?.size as number) || 0), 0);
      return { bucket, count: objects.length, totalBytes };
    })
  );

  const grandTotalBytes = results.reduce((sum, r) => sum + r.totalBytes, 0);
  const grandTotalCount = results.reduce((sum, r) => sum + r.count, 0);

  return { buckets: results, grandTotalBytes, grandTotalCount };
}

/** Total size of the private certificates bucket (PDFs + certificate images). */
export async function getCertificateStorageUsage() {
  async function listAll(prefix: string) {
    const { data, error } = await getSupabaseAdmin().storage.from(CERT_BUCKET).list(prefix, { limit: 1000 });
    if (error || !data) return { count: 0, totalBytes: 0 };
    const objects = data.filter((o) => o.id !== null);
    return {
      count: objects.length,
      totalBytes: objects.reduce((sum, o) => sum + ((o.metadata?.size as number) || 0), 0),
    };
  }
  const [pdfs, images] = await Promise.all([listAll("certificates"), listAll("certificate-images")]);
  return { count: pdfs.count + images.count, totalBytes: pdfs.totalBytes + images.totalBytes };
}

export async function uploadMediaObject(file: File, bucket: string, replacePath?: string) {
  assertBucket(bucket);

  if (file.size <= 0) throw new HttpError("Uploaded file is empty", 400);
  if (file.size > getMaxSizeBytes()) throw new HttpError("File is too large", 413);

  const allowed = bucket === "assets" ? [...IMAGE_TYPES, "application/pdf"] : IMAGE_TYPES;
  if (!allowed.includes(file.type)) {
    throw new HttpError(`Unsupported file type "${file.type}"`, 415);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (IMAGE_TYPES.includes(file.type) && !isValidImageSignature(buffer, file.type)) {
    throw new HttpError("File content does not match its declared image type", 415);
  }

  // Replacing keeps the same object name/URL so every reference to it updates
  // automatically; a fresh upload gets a new random name.
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const objectName = replacePath || `${randomUUID()}${ext}`;

  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .upload(objectName, buffer, { contentType: file.type, upsert: true });
  if (error) throw new HttpError(`Upload failed: ${error.message}`, 500);

  return {
    bucket: bucket as PublicBucket,
    name: objectName,
    url: getPublicUrl(bucket, objectName),
    size: file.size,
    mimeType: file.type,
  };
}

export async function deleteMediaObject(bucket: string, name: string) {
  assertBucket(bucket);
  const { error } = await getSupabaseAdmin().storage.from(bucket).remove([name]);
  if (error) throw new HttpError(`Delete failed: ${error.message}`, 500);
}

export type MediaUsage = { type: string; label: string };

/**
 * Best-effort reverse lookup: which records currently reference this URL.
 * Scans the tables that store Supabase public URLs directly.
 */
export async function findMediaUsage(url: string): Promise<MediaUsage[]> {
  const usage: MediaUsage[] = [];

  const [products, portfolioByImage, settings, pages] = await Promise.all([
    prisma.product.findMany({ where: { image: url }, select: { id: true, title: true } }),
    prisma.portfolioProject.findMany({ where: { image: url }, select: { id: true, title: true } }),
    prisma.siteSetting.findFirst({
      where: { OR: [{ logoUrl: url }, { faviconUrl: url }, { ogImageUrl: url }] },
    }),
    prisma.pageContent.findMany({ select: { key: true, content: true } }),
  ]);

  for (const p of products) usage.push({ type: "Product", label: p.title });
  for (const p of portfolioByImage) usage.push({ type: "Portfolio Project", label: p.title });

  if (settings) {
    if (settings.logoUrl === url) usage.push({ type: "Site Settings", label: "Company Logo" });
    if (settings.faviconUrl === url) usage.push({ type: "Site Settings", label: "Favicon" });
    if (settings.ogImageUrl === url) usage.push({ type: "Site Settings", label: "Open Graph Image" });
  }

  // Portfolio gallery images (JSON array) — not directly queryable, so scan in memory.
  const portfolioAll = await prisma.portfolioProject.findMany({ select: { id: true, title: true, images: true } });
  for (const p of portfolioAll) {
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    if (images.includes(url)) usage.push({ type: "Portfolio Gallery", label: p.title });
  }

  // Page content (Home/About/Footer) — the URL may appear anywhere in the JSON blob.
  for (const page of pages) {
    if (JSON.stringify(page.content).includes(url)) {
      usage.push({ type: "Page Content", label: page.key === "home" ? "Home Page" : page.key === "about" ? "About Page" : "Footer" });
    }
  }

  return usage;
}
