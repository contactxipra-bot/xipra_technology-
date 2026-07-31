import { getCurrentAdmin } from "@/lib/auth/session";
import AdminShell from "@/components/admin/AdminShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts already guarantees a valid session for everything under
  // /admin except /admin/login, so `admin` is expected to be non-null here.
  const admin = await getCurrentAdmin();

  return <AdminShell adminName={admin?.name ?? "Admin"}>{children}</AdminShell>;
}
