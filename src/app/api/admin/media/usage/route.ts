import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { getBucketUsage } from "@/lib/services/media.service";

export const runtime = "nodejs";

export const GET = withApiHandler(async () => {
  await requireAdmin();
  const usage = await getBucketUsage();
  return apiSuccess(usage);
});
