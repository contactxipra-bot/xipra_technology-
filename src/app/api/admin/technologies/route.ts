import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { createTechnologySchema } from "@/lib/validations/technology.schema";
import { listTechnologies, createTechnology } from "@/lib/services/technology.service";

export const GET = withApiHandler(async () => {
  await requireAdmin();
  const technologies = await listTechnologies();
  return apiSuccess(technologies);
});

export const POST = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createTechnologySchema.parse(body);
  const technology = await createTechnology(input);
  return apiSuccess(technology, { message: "Technology created", status: 201 });
});
