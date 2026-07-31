import { randomUUID } from "crypto";
import path from "path";
import { HttpError } from "@/lib/api/response";
import { getSupabaseAdmin, getPublicUrl, parsePublicUrl } from "@/lib/supabase";
import { isValidImageSignature } from "@/lib/file-signature";

/**
 * Public image uploads, backed by public Supabase Storage buckets.
 *
 * The stored `filePath` is now a Supabase public URL (served over CDN) rather
 * than a local `/uploads/...` path. Callers keep working unchanged — they store
 * the returned `filePath` in the DB and render it via <Image>. Buckets are
 * chosen from the logical `subdir` the app already uses.
 */

export type UploadSubdir = "certificates" | "products" | "portfolio" | "settings" | "content";

// Map the app's existing subdirs to public asset buckets.
const SUBDIR_BUCKET: Record<Exclude<UploadSubdir, "certificates">, string> = {
  products: "products",
  portfolio: "portfolio",
  settings: "logos",
  content: "assets",
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const PDF_TYPES = ["application/pdf"];

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

function getMaxSizeBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB) || 10;
  return mb * 1024 * 1024;
}

export type SavedFile = {
  fileName: string;
  /** Supabase public URL, e.g. https://<ref>.supabase.co/storage/v1/object/public/products/xxx.jpg */
  filePath: string;
  fileType: string;
  fileSize: number;
};

export async function saveUploadedFile(
  file: File,
  subdir: UploadSubdir,
  options?: { allowedTypes?: "image" | "pdf" | "any" }
): Promise<SavedFile> {
  const allowed =
    options?.allowedTypes === "pdf"
      ? PDF_TYPES
      : options?.allowedTypes === "any"
        ? [...IMAGE_TYPES, ...PDF_TYPES]
        : IMAGE_TYPES;

  if (!allowed.includes(file.type)) {
    throw new HttpError(
      `Unsupported file type "${file.type}". Allowed: ${allowed.join(", ")}`,
      415
    );
  }
  if (file.size <= 0) throw new HttpError("Uploaded file is empty", 400);
  if (file.size > getMaxSizeBytes()) throw new HttpError("File is too large", 413);

  const bucket = SUBDIR_BUCKET[subdir as Exclude<UploadSubdir, "certificates">] || "assets";
  const ext = EXT_BY_MIME[file.type] || path.extname(file.name) || "";
  const objectPath = `${randomUUID()}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  // Confirm the bytes actually match the declared image type (PDF already
  // magic-byte-checked elsewhere; this only applies when images are allowed).
  if (IMAGE_TYPES.includes(file.type) && !isValidImageSignature(buffer, file.type)) {
    throw new HttpError("File content does not match its declared image type", 415);
  }

  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .upload(objectPath, buffer, { contentType: file.type, upsert: true });
  if (error) throw new HttpError(`Storage upload failed: ${error.message}`, 500);

  return {
    fileName: objectPath,
    filePath: getPublicUrl(bucket, objectPath),
    fileType: file.type,
    fileSize: file.size,
  };
}

export async function deleteUploadedFile(publicUrl: string | null | undefined) {
  const parsed = parsePublicUrl(publicUrl);
  if (!parsed) return; // legacy local path, external URL, or empty — nothing to delete
  await getSupabaseAdmin().storage.from(parsed.bucket).remove([parsed.path]).catch(() => {});
}
