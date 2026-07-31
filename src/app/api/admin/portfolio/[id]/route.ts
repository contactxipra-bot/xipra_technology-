import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { updatePortfolioSchema } from "@/lib/validations/portfolio.schema";
import {
  getPortfolioProjectById,
  updatePortfolioProject,
  deletePortfolioProject,
} from "@/lib/services/portfolio.service";
import { logAudit } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const project = await getPortfolioProjectById(id);
  return apiSuccess(project);
});

export const PUT = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json();
  const input = updatePortfolioSchema.parse(body);
  const project = await updatePortfolioProject(id, input);
  return apiSuccess(project, { message: "Project updated" });
});

export const DELETE = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const existing = await getPortfolioProjectById(id);
  await deletePortfolioProject(id);
  await logAudit({
    admin,
    action: "portfolio.delete",
    entityType: "PortfolioProject",
    entityId: id,
    metadata: { title: existing.title },
    ipAddress: getRequestMeta(request).ip,
  });
  return apiSuccess(null, { message: "Project deleted" });
});
