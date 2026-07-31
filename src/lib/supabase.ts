import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the SECRET (service-role) key.
 * This bypasses RLS and must NEVER be imported into client components —
 * it lives only in server code (route handlers, services, scripts).
 */

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.");
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

// ---- Buckets ----

// Private: certificate PDFs and optional certificate images. Never public —
// served only through access-gated API routes (verified public / authed admin).
export const CERT_BUCKET = "certificates";

// Public website asset buckets.
export const PUBLIC_BUCKETS = [
  "products",
  "portfolio",
  "technology",
  "hero",
  "logos",
  "assets",
] as const;

export type PublicBucket = (typeof PUBLIC_BUCKETS)[number];

export function getPublicUrl(bucket: string, objectPath: string): string {
  return getSupabaseAdmin().storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}

/**
 * Parse a stored Supabase public URL back into its { bucket, path } so the
 * object can be removed. Returns null for anything that isn't a Supabase
 * public-object URL (e.g. legacy local paths or external URLs).
 */
export function parsePublicUrl(url: string | null | undefined): { bucket: string; path: string } | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rest = url.slice(idx + marker.length);
  const slash = rest.indexOf("/");
  if (slash === -1) return null;
  return { bucket: rest.slice(0, slash), path: decodeURIComponent(rest.slice(slash + 1)) };
}
