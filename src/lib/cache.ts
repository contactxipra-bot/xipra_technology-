import { revalidateTag } from "next/cache";

/**
 * Cache tags for the public (ISR-cached) read paths.
 *
 * Public pages read their data through `unstable_cache`d loaders tagged with
 * these constants, which lets the pages be served from the static/full-route
 * cache (instant navigation, CDN-friendly) instead of re-querying the database
 * on every request. Whenever an admin mutates the underlying data, the matching
 * `revalidate*` helper below is called so the change appears on the live site
 * immediately — not after a delay. The time-based TTL is only a self-heal
 * fallback in case a revalidation is ever missed.
 */
export const CACHE_TAGS = {
  products: "public:products",
  portfolio: "public:portfolio",
  technology: "public:technology",
  settings: "public:settings",
  content: (key: string) => `public:content:${key}`,
} as const;

/**
 * Time-based self-heal fallback (seconds) for cached public data. Tag
 * revalidation is the primary, immediate mechanism; this simply guarantees the
 * cache can never be permanently stale even if a revalidation is missed.
 */
export const PUBLIC_CACHE_TTL = 3600;

export function revalidateProducts(): void {
  revalidateTag(CACHE_TAGS.products);
}

export function revalidatePortfolio(): void {
  revalidateTag(CACHE_TAGS.portfolio);
}

export function revalidateTechnology(): void {
  revalidateTag(CACHE_TAGS.technology);
  // Portfolio projects embed technology names, so a technology change can also
  // affect the portfolio pages — revalidate both to keep them consistent.
  revalidateTag(CACHE_TAGS.portfolio);
}

export function revalidateSettings(): void {
  revalidateTag(CACHE_TAGS.settings);
}

export function revalidateContent(key: string): void {
  revalidateTag(CACHE_TAGS.content(key));
}
