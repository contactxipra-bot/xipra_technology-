import { z } from "zod";

/**
 * Guards every `next/image` `src` prop fed by database/user-entered strings.
 * next/image passes non-relative values straight into `new URL(src)`, which
 * throws a raw runtime error for anything that isn't a real absolute URL or
 * an app-relative path — this is the single source of truth for what counts
 * as renderable, so no call site has to reimplement the check.
 */
export function isValidImageSrc(src: string | null | undefined): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/images/")) return true;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Shared Zod field for any DB column that ends up in a `next/image` `src`.
 * Reuses the exact same predicate as the render-time guard, so a value that
 * passes validation on save is guaranteed to also pass the render check.
 * Empty string / null / undefined are accepted (they mean "no image set").
 */
export const imageSrcField = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((val) => !val || isValidImageSrc(val), {
    message: "Must be a valid image URL (http://, https://, /uploads/..., or /images/...)",
  });
