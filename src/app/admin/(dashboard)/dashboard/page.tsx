import Link from "next/link";
import {
  Award,
  GraduationCap,
  Mail,
  Box,
  Layers,
  Code2,
  Plus,
  FileBadge2,
  HardDrive,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import DonutChart from "@/components/admin/charts/DonutChart";
import BarChart from "@/components/admin/charts/BarChart";
import {
  getDashboardStats,
  getRecentActivity,
  getLatestCertificates,
  getCertificateStatusBreakdown,
  getContactStatusBreakdown,
  getInternshipStatusBreakdown,
  getCertificatesIssuedByMonth,
} from "@/lib/services/dashboard.service";
import { getBucketUsage, getCertificateStorageUsage } from "@/lib/services/media.service";
import { formatBytes } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTIVITY_ICON = {
  certificate: Award,
  internship: GraduationCap,
  contact: Mail,
} as const;

const QUICK_ACTIONS = [
  { href: "/admin/certificates", label: "New Certificate", icon: FileBadge2 },
  { href: "/admin/products", label: "New Product", icon: Box },
  { href: "/admin/portfolio", label: "New Project", icon: Layers },
  { href: "/admin/technology", label: "New Technology", icon: Code2 },
];

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
  ];
  let value = seconds;
  for (const [amount, unit] of units) {
    if (value < amount) return `${Math.max(1, Math.floor(value))} ${unit}${value >= 2 ? "s" : ""} ago`;
    value = value / amount;
  }
  return `${Math.floor(value)} years ago`;
}

export default async function AdminDashboardPage() {
  const [
    stats,
    recentActivity,
    latestCertificates,
    certStatus,
    contactStatus,
    internshipStatus,
    issuedByMonth,
    publicUsage,
    certUsage,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(8),
    getLatestCertificates(5),
    getCertificateStatusBreakdown(),
    getContactStatusBreakdown(),
    getInternshipStatusBreakdown(),
    getCertificatesIssuedByMonth(6),
    getBucketUsage(),
    getCertificateStorageUsage(),
  ]);

  const totalStorageBytes = publicUsage.grandTotalBytes + certUsage.totalBytes;
  const totalStorageCount = publicUsage.grandTotalCount + certUsage.count;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of everything happening on Xipra Technology.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Certificates" value={stats.certificates} icon={Award} />
        <StatCard label="Internship Applications" value={stats.internshipApplications} icon={GraduationCap} />
        <StatCard label="Contact Messages" value={stats.contactMessages} icon={Mail} />
        <StatCard label="Products" value={stats.products} icon={Box} />
        <StatCard label="Portfolio Projects" value={stats.portfolioProjects} icon={Layers} />
        <StatCard label="Technologies" value={stats.technologies} icon={Code2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nothing yet.</p>
          ) : (
            <ul className="space-y-1">
              {recentActivity.map((item) => {
                const Icon = ACTIVITY_ICON[item.type];
                return (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {timeAgo(item.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 hover:border-primary/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {label}
                <Plus className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Uploaded Certificates */}
      <div className="glass-panel rounded-2xl p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Latest Certificates</h2>
          <Link href="/admin/certificates" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {latestCertificates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No certificates yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {latestCertificates.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileBadge2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">
                    {c.studentName}{" "}
                    <span className="text-muted-foreground">· {c.certificateNumber}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{c.course}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  {c.hasFile && (
                    <span className="text-[10px] font-medium text-green-500 border border-green-500/20 bg-green-500/10 rounded-full px-2 py-0.5">
                      PDF
                    </span>
                  )}
                  {c.hasQr && (
                    <span className="text-[10px] font-medium text-primary border border-primary/20 bg-primary/10 rounded-full px-2 py-0.5">
                      QR
                    </span>
                  )}
                </div>
                <StatusBadge status={c.status} />
                <span className="text-xs text-muted-foreground shrink-0 hidden md:inline">
                  {timeAgo(c.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Charts & Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <BarChart
          title="Certificates Issued"
          points={issuedByMonth}
        />

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Storage Usage</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {totalStorageCount} files &middot; {formatBytes(totalStorageBytes)}
            </span>
          </div>
          <div className="space-y-2.5">
            {[...publicUsage.buckets.map((b) => ({ label: b.bucket, bytes: b.totalBytes, count: b.count })), { label: "certificates (private)", bytes: certUsage.totalBytes, count: certUsage.count }].map((b) => {
              const pct = totalStorageBytes > 0 ? Math.round((b.bytes / totalStorageBytes) * 100) : 0;
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground capitalize">{b.label}</span>
                    <span className="text-muted-foreground tabular-nums">{formatBytes(b.bytes)} &middot; {b.count} files</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DonutChart
          title="Certificate Status"
          segments={[
            { label: "Active", value: certStatus.active, colorClass: "text-green-500" },
            { label: "Revoked", value: certStatus.revoked, colorClass: "text-destructive" },
            { label: "Expired", value: certStatus.expired, colorClass: "text-yellow-500" },
          ]}
        />

        <DonutChart
          title="Contact Messages"
          segments={[
            { label: "Unread", value: contactStatus.unread, colorClass: "text-primary" },
            { label: "Read", value: contactStatus.read, colorClass: "text-blue-500" },
            { label: "Replied", value: contactStatus.replied, colorClass: "text-green-500" },
          ]}
        />

        <DonutChart
          title="Internship Applications"
          segments={[
            { label: "Pending", value: internshipStatus.pending, colorClass: "text-yellow-500" },
            { label: "Reviewed", value: internshipStatus.reviewed, colorClass: "text-blue-500" },
            { label: "Accepted", value: internshipStatus.accepted, colorClass: "text-green-500" },
            { label: "Rejected", value: internshipStatus.rejected, colorClass: "text-destructive" },
          ]}
        />
      </div>
    </div>
  );
}
