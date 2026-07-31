import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { sanitizeText } from "@/lib/sanitize";
import type { UpdateSettingsInput } from "@/lib/validations/settings.schema";
import { CACHE_TAGS, PUBLIC_CACHE_TTL, revalidateSettings } from "@/lib/cache";

const SETTINGS_ID = 1;

async function fetchSiteSettings() {
  const existing = await prisma.siteSetting.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.siteSetting.create({ data: { id: SETTINGS_ID } });
}

// Site settings are read on every public page (root layout's generateMetadata +
// body, footer, nav) and change only when an admin saves them. `unstable_cache`
// serves them from the cross-request cache so pages render without a per-request
// DB round-trip; `updateSiteSettings` revalidates the tag on save so changes
// appear immediately.
export const getSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings"], {
  tags: [CACHE_TAGS.settings],
  revalidate: PUBLIC_CACHE_TTL,
});

function sanitizeSettingsInput(data: UpdateSettingsInput): UpdateSettingsInput {
  return {
    ...data,
    companyName: data.companyName ? sanitizeText(data.companyName) : data.companyName,
    companyDescription:
      data.companyDescription != null ? sanitizeText(data.companyDescription) : data.companyDescription,
    businessHours: data.businessHours != null ? sanitizeText(data.businessHours) : data.businessHours,
    copyrightText: data.copyrightText != null ? sanitizeText(data.copyrightText) : data.copyrightText,
    seoTitle: data.seoTitle != null ? sanitizeText(data.seoTitle) : data.seoTitle,
    seoDescription: data.seoDescription != null ? sanitizeText(data.seoDescription) : data.seoDescription,
    seoKeywords: data.seoKeywords != null ? sanitizeText(data.seoKeywords) : data.seoKeywords,
    addresses: data.addresses?.map(sanitizeText),
  };
}

export async function updateSiteSettings(data: UpdateSettingsInput) {
  const clean = sanitizeSettingsInput(data);
  // Upsert instead of ensure-then-update: the settings row is a singleton
  // (id=1) that may not exist yet on a fresh database, and an atomic upsert
  // can never fail with "record not found" the way a plain update could.
  const saved = await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...clean } as Prisma.SiteSettingCreateInput,
    update: clean as Prisma.SiteSettingUpdateInput,
  });
  // Settings appear in every page's header/footer/metadata — refresh the cache
  // for the whole site immediately.
  revalidateSettings();
  return saved;
}
