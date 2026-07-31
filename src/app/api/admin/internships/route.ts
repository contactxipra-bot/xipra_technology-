import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { listInternshipApplications } from "@/lib/services/internship.service";

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();

  const pagination = parsePagination(request.nextUrl.searchParams);
  const { items, total } = await listInternshipApplications(pagination);

  return apiSuccess(items, { meta: buildPaginationMeta(total, pagination) });
});
