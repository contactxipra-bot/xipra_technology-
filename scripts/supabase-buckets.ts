import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

/**
 * Idempotently creates the Supabase Storage buckets the app uses.
 * Run with: npx tsx scripts/supabase-buckets.ts
 */

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const FILE_SIZE_LIMIT = `${Number(process.env.MAX_UPLOAD_SIZE_MB) || 10}MB`;

const BUCKETS: { id: string; public: boolean; allowedMimeTypes: string[] }[] = [
  // Private — certificate PDFs + optional certificate images.
  { id: "certificates", public: false, allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"] },
  // Public website assets.
  { id: "products", public: true, allowedMimeTypes: IMAGE_MIMES },
  { id: "portfolio", public: true, allowedMimeTypes: IMAGE_MIMES },
  { id: "technology", public: true, allowedMimeTypes: IMAGE_MIMES },
  { id: "hero", public: true, allowedMimeTypes: IMAGE_MIMES },
  { id: "logos", public: true, allowedMimeTypes: IMAGE_MIMES },
  { id: "assets", public: true, allowedMimeTypes: [...IMAGE_MIMES, "application/pdf"] },
];

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY not set in .env");

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  for (const b of BUCKETS) {
    const { error } = await supabase.storage.createBucket(b.id, {
      public: b.public,
      allowedMimeTypes: b.allowedMimeTypes,
      fileSizeLimit: FILE_SIZE_LIMIT,
    });
    if (error) {
      if (/already exists/i.test(error.message)) {
        // Keep policy in sync if the bucket already exists.
        await supabase.storage.updateBucket(b.id, {
          public: b.public,
          allowedMimeTypes: b.allowedMimeTypes,
          fileSizeLimit: FILE_SIZE_LIMIT,
        });
        console.log(`[buckets] "${b.id}" already exists — policy updated.`);
      } else {
        console.error(`[buckets] Failed "${b.id}": ${error.message}`);
        process.exitCode = 1;
      }
    } else {
      console.log(`[buckets] Created "${b.id}" (${b.public ? "public" : "private"}).`);
    }
  }
}

main().catch((err) => {
  console.error("[buckets] Error:", err);
  process.exit(1);
});
