import path from "path";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Supabase Storage host (public bucket objects) — also allowed in the CSP img-src below.
// Derived from SUPABASE_URL so this config never needs a hardcoded project ref.
const SUPABASE_HOST = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).hostname
  : "";

/**
 * Content-Security-Policy. Kept practical rather than maximally strict:
 * - 'unsafe-inline'/'unsafe-eval' on script-src in dev only (Turbopack HMR needs them).
 * - style-src allows 'unsafe-inline' because Framer Motion sets inline style
 *   attributes at runtime and Tailwind's output is a single stylesheet.
 * - frame-src 'self' is required for the certificate PDF <iframe> preview,
 *   which is always same-origin (served by our own /api routes).
 */
function buildCsp(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": isDev
      ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
      : ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      SUPABASE_HOST ? `https://${SUPABASE_HOST}` : "",
      "https://images.unsplash.com",
    ].filter(Boolean),
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      SUPABASE_HOST ? `https://${SUPABASE_HOST}` : "",
      isDev ? "ws:" : "",
    ].filter(Boolean),
    "frame-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: buildCsp() },
];

if (!isDev) {
  SECURITY_HEADERS.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  poweredByHeader: false,
  compress: true,
  // Rewrite barrel imports (`import { motion } from "framer-motion"`,
  // `import { FaX } from "react-icons/fa"`, lucide-react) into direct
  // per-icon/per-export module imports, so only what's actually used is
  // pulled into each client bundle instead of the whole library index.
  experimental: {
    optimizePackageImports: ["framer-motion", "react-icons", "lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimized images were being sent with `max-age=3600`, so every visitor
    // re-fetched (or at best revalidated) the hero and catalogue images once an
    // hour. Uploads are stored under a generated UUID filename, so a replaced
    // image is always a new URL and can never be served stale from this cache.
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(SUPABASE_HOST
        ? [
            {
              // Supabase Storage public bucket objects (product/portfolio/logo/etc. images)
              protocol: "https" as const,
              hostname: SUPABASE_HOST,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        // Applies to every route, including the admin panel and all APIs.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // Public catalog/content read endpoints are safe to cache briefly at
        // the edge/CDN — they change only when an admin edits content.
        source: "/api/public/verify",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        // app/favicon.ico is served with `max-age=0, must-revalidate`, which
        // costs a conditional request on every navigation. A day of caching with
        // a week of stale-while-revalidate removes that round trip while still
        // picking up a replaced icon quickly.
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
