import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, HttpError } from "@/lib/api/response";
import { requireAdmin, requireRole } from "@/lib/api/require-admin";
import { CONTENT_SCHEMAS, type ContentKey } from "@/lib/validations/content.schema";
import { getEditableContent, savePageContent } from "@/lib/services/content.service";
import { logAudit } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ key: string }> };

function assertKey(key: string): asserts key is ContentKey {
  if (!(key in CONTENT_SCHEMAS)) {
    throw new HttpError(`Unknown content page "${key}"`, 404);
  }
}

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { key } = await context.params;
  assertKey(key);
  const content = await getEditableContent(key);
  return apiSuccess(content);
});

export const PUT = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  const { key } = await context.params;
  assertKey(key);

  // Footer is shared, site-wide navigation — restrict editing to SUPER_ADMIN.
  // Home/About stay open to any authenticated admin, as before.
  const admin = key === "footer" ? await requireRole("SUPER_ADMIN") : await requireAdmin();

  const body = await request.json();
  const content = CONTENT_SCHEMAS[key].parse(body);
  await savePageContent(key, content);
  await logAudit({
    admin,
    action: "content.update",
    entityType: "PageContent",
    entityId: key,
    ipAddress: getRequestMeta(request).ip,
  });

  return apiSuccess(content, { message: "Content saved" });
});
