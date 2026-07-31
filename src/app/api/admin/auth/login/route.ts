import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth.schema";
import { loginAdmin } from "@/lib/services/auth.service";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { logAudit } from "@/lib/audit";

export const POST = withApiHandler(async (request: NextRequest) => {
  const meta = getRequestMeta(request);
  // Slow down credential-stuffing / brute-force attempts against the one
  // unauthenticated admin endpoint.
  enforceRateLimit({ scope: "admin-login", identifier: meta.ip, limit: 10, windowMs: 60_000 });

  const body = await request.json();
  const input = loginSchema.parse(body);

  try {
    const { token, admin } = await loginAdmin(input);

    await logAudit({
      admin: { sub: admin.id, email: admin.email, name: admin.name, role: admin.role },
      action: "auth.login",
      entityType: "Admin",
      entityId: admin.id,
      ipAddress: meta.ip,
    });

    const response = apiSuccess(admin, { message: "Logged in successfully" });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    await logAudit({
      action: "auth.login.failed",
      entityType: "Admin",
      metadata: { email: input.email },
      ipAddress: meta.ip,
    });
    throw err;
  }
});
