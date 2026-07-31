import { randomUUID } from "crypto";
import { HttpError } from "@/lib/api/response";
import { getSupabaseAdmin, CERT_BUCKET } from "@/lib/supabase";
import { isValidImageSignature, isValidPdfSignature } from "@/lib/file-signature";

/**
 * Private file storage for sensitive documents (certificate PDFs + optional
 * certificate images), backed by a PRIVATE Supabase Storage bucket.
 *
 * These objects are never public — they are read back only through
 * access-gated routes (authenticated admin, or verified public verification).
 * `filePath` values stored in the DB are bucket-relative object keys (e.g.
 * "certificates/<uuid>.pdf") and are never public URLs.
 */

const PDF_TYPE = "application/pdf";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export type PrivateSubdir = "certificates" | "certificate-images";

function getMaxSizeBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB) || 10;
  return mb * 1024 * 1024;
}

export type SavedPrivateFile = {
  fileName: string;
  /** Bucket-relative object key, e.g. "certificates/<uuid>.pdf" — NOT a public URL. */
  filePath: string;
  fileType: string;
  fileSize: number;
};

async function uploadToCertBucket(objectKey: string, buffer: Buffer, contentType: string) {
  const { error } = await getSupabaseAdmin()
    .storage.from(CERT_BUCKET)
    .upload(objectKey, buffer, { contentType, upsert: true });
  if (error) throw new HttpError(`Storage upload failed: ${error.message}`, 500);
}

export async function savePrivatePdf(
  file: File,
  subdir: PrivateSubdir
): Promise<SavedPrivateFile> {
  if (file.type !== PDF_TYPE) {
    throw new HttpError(`Only PDF files are allowed (got "${file.type || "unknown"}")`, 415);
  }
  if (file.size <= 0) throw new HttpError("Uploaded file is empty", 400);
  if (file.size > getMaxSizeBytes()) throw new HttpError("File is too large", 413);

  // Magic-byte check — genuine PDFs start with "%PDF-".
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isValidPdfSignature(buffer)) {
    throw new HttpError("File does not appear to be a valid PDF", 415);
  }

  const objectKey = `${subdir}/${randomUUID()}.pdf`;
  await uploadToCertBucket(objectKey, buffer, PDF_TYPE);

  return { fileName: objectKey.split("/").pop()!, filePath: objectKey, fileType: PDF_TYPE, fileSize: file.size };
}

export async function savePrivateImage(
  file: File,
  subdir: PrivateSubdir
): Promise<SavedPrivateFile> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new HttpError(
      `Unsupported image type "${file.type || "unknown"}". Allowed: JPG, PNG, WEBP`,
      415
    );
  }
  if (file.size <= 0) throw new HttpError("Uploaded file is empty", 400);
  if (file.size > getMaxSizeBytes()) throw new HttpError("File is too large", 413);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isValidImageSignature(buffer, file.type)) {
    throw new HttpError("File content does not match its declared image type", 415);
  }
  const objectKey = `${subdir}/${randomUUID()}${IMAGE_EXT[file.type]}`;
  await uploadToCertBucket(objectKey, buffer, file.type);

  return { fileName: objectKey.split("/").pop()!, filePath: objectKey, fileType: file.type, fileSize: file.size };
}

/**
 * Reads a private object back. Uses a short-lived SIGNED URL rather than the
 * persistent service-role `download()` call — the signed URL is scoped to this
 * one object for 60s, which limits the blast radius if this code path were
 * ever misused, without changing the function's contract for any caller (all
 * existing public/admin routes keep proxying identical bytes/headers to the
 * client — only the internal retrieval mechanism changed).
 */
export async function readPrivateFile(objectKey: string): Promise<Buffer> {
  const { data: signed, error: signError } = await getSupabaseAdmin()
    .storage.from(CERT_BUCKET)
    .createSignedUrl(objectKey, 60);
  if (signError || !signed?.signedUrl) throw new HttpError("File not found", 404);

  const res = await fetch(signed.signedUrl);
  if (!res.ok) throw new HttpError("File not found", 404);
  return Buffer.from(await res.arrayBuffer());
}

export async function deletePrivateFile(objectKey: string | null | undefined) {
  if (!objectKey) return;
  // Best-effort — a missing object on delete is not an error.
  await getSupabaseAdmin().storage.from(CERT_BUCKET).remove([objectKey]).catch(() => {});
}
