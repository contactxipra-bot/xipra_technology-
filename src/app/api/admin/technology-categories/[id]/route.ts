import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { updateTechnologyCategorySchema } from "@/lib/validations/technology.schema";
import {
  getTechnologyCategoryById,
  updateTechnologyCategory,
  deleteTechnologyCategory,
} from "@/lib/services/technology.service";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const category = await getTechnologyCategoryById(id);
  return apiSuccess(category);
});

export const PUT = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json();
  const input = updateTechnologyCategorySchema.parse(body);
  const category = await updateTechnologyCategory(id, input);
  return apiSuccess(category, { message: "Category updated" });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  await deleteTechnologyCategory(id);
  return apiSuccess(null, { message: "Category deleted" });
});
