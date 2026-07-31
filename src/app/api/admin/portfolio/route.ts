import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createPortfolioSchema } from "@/lib/validations/portfolio.schema";
import { listPortfolioProjects, createPortfolioProject } from "@/lib/services/portfolio.service";

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();

  const pagination = parsePagination(request.nextUrl.searchParams);
  const { items, total } = await listPortfolioProjects(pagination);

  return apiSuccess(items, { meta: buildPaginationMeta(total, pagination) });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();

  const body = await request.json();
  const input = createPortfolioSchema.parse(body);
  const project = await createPortfolioProject(input);

  return apiSuccess(project, { message: "Project created", status: 201 });
});
