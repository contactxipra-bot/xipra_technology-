import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { clearSessionCookie, getCurrentAdmin } from "@/lib/auth/session";
import { getRequestMeta } from "@/lib/request-meta";
import { logAudit } from "@/lib/audit";

export const POST = withApiHandler(async (request: NextRequest) => {
  const admin = await getCurrentAdmin();
  if (admin) {
    await logAudit({
      admin,
      action: "auth.logout",
      entityType: "Admin",
      entityId: admin.sub,
      ipAddress: getRequestMeta(request).ip,
    });
  }

  const response = apiSuccess(null, { message: "Logged out successfully" });
  clearSessionCookie(response);
  return response;
});
