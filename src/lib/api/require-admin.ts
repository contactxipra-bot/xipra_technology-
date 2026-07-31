import { HttpError } from "@/lib/api/response";
import { getCurrentAdmin } from "@/lib/auth/session";
import type { AdminRole } from "@/generated/prisma/enums";

/**
 * Defense-in-depth: middleware already blocks unauthenticated requests to
 * /api/admin/**, but each handler re-checks so it never depends solely on
 * middleware being wired up correctly.
 */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new HttpError("Unauthorized", 401);
  return admin;
}

/**
 * Role-gated variant for the small set of actions that should be restricted
 * to SUPER_ADMIN (site-wide settings, footer content, permanently deleting
 * shared media). Everything else remains accessible to any authenticated
 * admin, matching how the app has operated so far.
 */
export async function requireRole(...roles: AdminRole[]) {
  const admin = await requireAdmin();
  if (!roles.includes(admin.role)) {
    throw new HttpError("You do not have permission to perform this action", 403);
  }
  return admin;
}
