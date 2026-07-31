import { z } from "zod";
import { imageSrcField, isValidImageSrc } from "@/lib/image-src";

export const createProductSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  slug: z.string().trim().min(2).optional(),
  category: z.string().trim().optional().nullable(),
  description: z.string().trim().min(10, "Description is required"),
  image: imageSrcField,
  demoUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Demo URL must be a valid URL",
    }),
  images: z
    .array(z.string().trim().refine(isValidImageSrc, { message: "Must be a valid image URL" }))
    .optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

// `.partial()` alone still leaves `isActive`/`order` defaulted (Zod applies
// `.default()` to any field that parses as `undefined`, partial or not), so a
// partial update omitting either field would silently reset it. Overriding
// them here with plain optional (no-default) versions fixes that for updates
// while createProductSchema keeps sensible defaults for new products.
export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
