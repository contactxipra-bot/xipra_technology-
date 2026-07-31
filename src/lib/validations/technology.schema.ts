import { z } from "zod";

export const createTechnologyCategorySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z.string().trim().min(2).optional(),
  icon: z.string().trim().optional().nullable(),
  order: z.coerce.number().int().default(0),
});

export const updateTechnologyCategorySchema = createTechnologyCategorySchema.partial();

export const createTechnologySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z.string().trim().min(2).optional(),
  icon: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  order: z.coerce.number().int().default(0),
});

export const updateTechnologySchema = createTechnologySchema.partial();

export type CreateTechnologyCategoryInput = z.infer<typeof createTechnologyCategorySchema>;
export type UpdateTechnologyCategoryInput = z.infer<typeof updateTechnologyCategorySchema>;
export type CreateTechnologyInput = z.infer<typeof createTechnologySchema>;
export type UpdateTechnologyInput = z.infer<typeof updateTechnologySchema>;
