import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { getDashboardStats, getRecentActivity } from "@/lib/services/dashboard.service";

export const GET = withApiHandler(async () => {
  await requireAdmin();

  const [stats, recentActivity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(8),
  ]);

  return apiSuccess({ stats, recentActivity });
});
