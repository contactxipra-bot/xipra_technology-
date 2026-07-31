import { z } from "zod";
import { imageSrcField, isValidImageSrc } from "@/lib/image-src";

export const createPortfolioSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  slug: z.string().trim().min(2).optional(),
  category: z.string().trim().min(1, "Category is required"),
  client: z.string().trim().optional().nullable(),
  description: z.string().trim().min(10, "Description is required"),
  image: imageSrcField,
  images: z
    .array(z.string().trim().refine(isValidImageSrc, { message: "Must be a valid image URL" }))
    .optional(),
  projectUrl: z.string().trim().url("Enter a valid URL").optional().nullable(),
  isFeatured: z.boolean().default(false),
  order: z.coerce.number().int().default(0),
  technologyIds: z.array(z.string()).optional(),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
