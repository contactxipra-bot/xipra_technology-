import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { updateInternshipStatusSchema } from "@/lib/validations/internship.schema";
import {
  getInternshipApplicationById,
  updateInternshipStatus,
  deleteInternshipApplication,
} from "@/lib/services/internship.service";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const application = await getInternshipApplicationById(id);
  return apiSuccess(application);
});

export const PATCH = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json();
  const input = updateInternshipStatusSchema.parse(body);
  const application = await updateInternshipStatus(id, input);
  return apiSuccess(application, { message: "Status updated" });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  await deleteInternshipApplication(id);
  return apiSuccess(null, { message: "Application deleted" });
});
