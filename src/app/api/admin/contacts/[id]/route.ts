import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { updateContactStatusSchema } from "@/lib/validations/contact.schema";
import {
  getContactMessageById,
  updateContactStatus,
  deleteContactMessage,
} from "@/lib/services/contact.service";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const message = await getContactMessageById(id);
  return apiSuccess(message);
});

export const PATCH = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json();
  const input = updateContactStatusSchema.parse(body);
  const message = await updateContactStatus(id, input);
  return apiSuccess(message, { message: "Status updated" });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  await deleteContactMessage(id);
  return apiSuccess(null, { message: "Message deleted" });
});
