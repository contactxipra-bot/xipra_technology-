import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { getAdminById } from "@/lib/services/auth.service";
import { HttpError } from "@/lib/api/response";

export const GET = withApiHandler(async () => {
  const session = await requireAdmin();
  const admin = await getAdminById(session.sub);
  if (!admin) throw new HttpError("Admin not found", 404);
  return apiSuccess(admin);
});
