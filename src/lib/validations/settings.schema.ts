import { z } from "zod";
import { imageSrcField } from "@/lib/image-src";

export const socialLinkSchema = z.object({
  platform: z.string().trim().min(1),
  url: z.string().trim().url(),
});

export const updateSettingsSchema = z.object({
  companyName: z.string().trim().min(1).optional(),
  companyDescription: z.string().trim().optional().nullable(),
  logoUrl: imageSrcField,
  faviconUrl: imageSrcField,
  phones: z.array(z.string().trim().min(1)).optional(),
  emails: z.array(z.string().trim().email()).optional(),
  addresses: z.array(z.string().trim().min(1)).optional(),
  businessHours: z.string().trim().optional().nullable(),
  whatsappNumber: z.string().trim().optional().nullable(),
  googleMapUrl: z.string().trim().optional().nullable(),
  socialLinks: z.array(socialLinkSchema).optional(),
  copyrightText: z.string().trim().optional().nullable(),
  themeSettings: z.record(z.string(), z.unknown()).optional(),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  seoKeywords: z.string().trim().optional().nullable(),
  ogImageUrl: imageSrcField,
  twitterCard: z.string().trim().optional().nullable(),
  canonicalUrl: z.string().trim().optional().nullable(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
