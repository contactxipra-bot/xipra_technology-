import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { HOME_DEFAULTS, ABOUT_DEFAULTS, FOOTER_DEFAULTS } from "@/lib/content/defaults";
import type { AboutContent, FooterContent, HomeContent, PageKey } from "@/lib/content/types";
import { CACHE_TAGS, PUBLIC_CACHE_TTL, revalidateContent } from "@/lib/cache";

/**
 * Page content is stored one row per page (keyed by slug) as a JSON blob.
 * Reads merge stored content over the shipped defaults per top-level section,
 * so the public pages always have every field even if a section was never
 * edited or a new field is added to the schema later.
 */

const DEFAULTS = {
  home: HOME_DEFAULTS,
  about: ABOUT_DEFAULTS,
  footer: FOOTER_DEFAULTS,
} as const;

function mergeSections<T extends Record<string, unknown>>(defaults: T, stored: unknown): T {
  if (!stored || typeof stored !== "object") return defaults;
  const merged: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const storedVal = (stored as Record<string, unknown>)[key];
    if (storedVal === undefined) continue;
    const defaultVal = defaults[key];
    // Arrays replace wholesale; nested plain objects merge field-by-field; scalars replace.
    if (
      defaultVal &&
      typeof defaultVal === "object" &&
      !Array.isArray(defaultVal) &&
      storedVal &&
      typeof storedVal === "object" &&
      !Array.isArray(storedVal)
    ) {
      merged[key] = { ...(defaultVal as object), ...(storedVal as object) };
    } else {
      merged[key] = storedVal;
    }
  }
  return merged as T;
}

async function readPageContent<T>(key: PageKey, defaults: T): Promise<T> {
  const row = await prisma.pageContent.findUnique({ where: { key } });
  return mergeSections(defaults as Record<string, unknown>, row?.content) as T;
}

export const getHomeContent = unstable_cache(
  async (): Promise<HomeContent> => readPageContent("home", HOME_DEFAULTS),
  ["public-content-home"],
  { tags: [CACHE_TAGS.content("home")], revalidate: PUBLIC_CACHE_TTL }
);

export const getAboutContent = unstable_cache(
  async (): Promise<AboutContent> => readPageContent("about", ABOUT_DEFAULTS),
  ["public-content-about"],
  { tags: [CACHE_TAGS.content("about")], revalidate: PUBLIC_CACHE_TTL }
);

export const getFooterContent = unstable_cache(
  async (): Promise<FooterContent> => readPageContent("footer", FOOTER_DEFAULTS),
  ["public-content-footer"],
  { tags: [CACHE_TAGS.content("footer")], revalidate: PUBLIC_CACHE_TTL }
);

/** Admin: get the effective content for an editable page (merged with defaults). */
export async function getEditableContent(key: PageKey) {
  return readPageContent(key, DEFAULTS[key]);
}

/** Admin: persist validated content for a page. */
export async function savePageContent(key: PageKey, content: unknown) {
  const json = content as Prisma.InputJsonValue;
  const saved = await prisma.pageContent.upsert({
    where: { key },
    update: { content: json },
    create: { key, content: json },
  });
  // Push the edit to the public ISR cache immediately.
  revalidateContent(key);
  return saved;
}
