import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin, requireRole } from "@/lib/api/require-admin";
import { updateSettingsSchema } from "@/lib/validations/settings.schema";
import { getSiteSettings, updateSiteSettings } from "@/lib/services/settings.service";
import { logAudit } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";

export const GET = withApiHandler(async () => {
  await requireAdmin();
  const settings = await getSiteSettings();
  return apiSuccess(settings);
});

export const PUT = withApiHandler(async (request: NextRequest) => {
  // Site-wide settings affect every visitor — restrict to SUPER_ADMIN.
  const admin = await requireRole("SUPER_ADMIN");
  const body = await request.json();
  const input = updateSettingsSchema.parse(body);
  const settings = await updateSiteSettings(input);
  await logAudit({
    admin,
    action: "settings.update",
    entityType: "SiteSetting",
    entityId: "1",
    ipAddress: getRequestMeta(request).ip,
  });
  return apiSuccess(settings, { message: "Settings updated" });
});
