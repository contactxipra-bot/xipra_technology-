import { HttpError } from "@/lib/api/response";

/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Suitable for a single-instance deployment (which this app is). For a
 * horizontally-scaled deployment, swap the Map for a shared store such as
 * Redis/Upstash — the `enforceRateLimit` call sites stay identical.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically evict expired buckets so the Map doesn't grow unbounded.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitOptions = {
  /** Unique scope, e.g. "contact" or "verify". */
  scope: string;
  /** Identifier, typically the client IP. */
  identifier: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export function checkRateLimit({
  scope,
  identifier,
  limit,
  windowMs,
}: RateLimitOptions): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  cleanup(now);

  const key = `${scope}:${identifier}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Throws HttpError 429 when the limit is exceeded. */
export function enforceRateLimit(options: RateLimitOptions) {
  const { allowed, retryAfterSeconds } = checkRateLimit(options);
  if (!allowed) {
    throw new HttpError(
      `Too many requests. Please try again in ${retryAfterSeconds}s.`,
      429
    );
  }
}
