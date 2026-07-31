import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { updateTechnologySchema } from "@/lib/validations/technology.schema";
import {
  getTechnologyById,
  updateTechnology,
  deleteTechnology,
} from "@/lib/services/technology.service";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const technology = await getTechnologyById(id);
  return apiSuccess(technology);
});

export const PUT = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json();
  const input = updateTechnologySchema.parse(body);
  const technology = await updateTechnology(id, input);
  return apiSuccess(technology, { message: "Technology updated" });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  await deleteTechnology(id);
  return apiSuccess(null, { message: "Technology deleted" });
});
