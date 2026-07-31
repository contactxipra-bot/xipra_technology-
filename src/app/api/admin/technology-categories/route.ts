import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { createTechnologyCategorySchema } from "@/lib/validations/technology.schema";
import {
  listTechnologyCategories,
  createTechnologyCategory,
} from "@/lib/services/technology.service";

export const GET = withApiHandler(async () => {
  await requireAdmin();
  const categories = await listTechnologyCategories();
  return apiSuccess(categories);
});

export const POST = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createTechnologyCategorySchema.parse(body);
  const category = await createTechnologyCategory(input);
  return apiSuccess(category, { message: "Category created", status: 201 });
});
