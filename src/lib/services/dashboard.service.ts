import { prisma } from "@/lib/db";

export async function getDashboardStats() {
  const [
    certificates,
    internshipApplications,
    contactMessages,
    products,
    portfolioProjects,
    technologies,
  ] = await Promise.all([
    prisma.certificate.count(),
    prisma.internshipApplication.count(),
    prisma.contactMessage.count(),
    prisma.product.count(),
    prisma.portfolioProject.count(),
    prisma.technology.count(),
  ]);

  return {
    certificates,
    internshipApplications,
    contactMessages,
    products,
    portfolioProjects,
    technologies,
  };
}

export async function getCertificateStatusBreakdown() {
  const [active, revoked, expired] = await Promise.all([
    prisma.certificate.count({ where: { status: "ACTIVE" } }),
    prisma.certificate.count({ where: { status: "REVOKED" } }),
    prisma.certificate.count({ where: { status: "EXPIRED" } }),
  ]);
  return { active, revoked, expired };
}

export async function getContactStatusBreakdown() {
  const [unread, read, replied] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.contactMessage.count({ where: { status: "READ" } }),
    prisma.contactMessage.count({ where: { status: "REPLIED" } }),
  ]);
  return { unread, read, replied };
}

export async function getInternshipStatusBreakdown() {
  const [pending, reviewed, accepted, rejected] = await Promise.all([
    prisma.internshipApplication.count({ where: { status: "PENDING" } }),
    prisma.internshipApplication.count({ where: { status: "REVIEWED" } }),
    prisma.internshipApplication.count({ where: { status: "ACCEPTED" } }),
    prisma.internshipApplication.count({ where: { status: "REJECTED" } }),
  ]);
  return { pending, reviewed, accepted, rejected };
}

/** Certificates issued per month for the last `months` months (oldest first). */
export async function getCertificatesIssuedByMonth(months = 6) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const certificates = await prisma.certificate.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
  });

  const buckets: { key: string; label: string; value: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString(undefined, { month: "short" }),
      value: 0,
    });
  }

  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const c of certificates) {
    const key = `${c.createdAt.getFullYear()}-${c.createdAt.getMonth()}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.value += 1;
  }

  return buckets.map((b) => ({ label: b.label, value: b.value }));
}

export async function getLatestCertificates(limit = 5) {
  const certificates = await prisma.certificate.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { files: { select: { id: true } } },
  });

  return certificates.map((c) => ({
    id: c.id,
    certificateNumber: c.certificateNumber,
    studentName: c.studentName,
    course: c.course,
    status: c.status,
    hasFile: c.files.length > 0,
    hasQr: Boolean(c.qrCodePath),
    createdAt: c.createdAt,
  }));
}

type ActivityItem = {
  type: "certificate" | "internship" | "contact";
  id: string;
  title: string;
  subtitle: string;
  createdAt: Date;
};

export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  const [certificates, applications, messages] = await Promise.all([
    prisma.certificate.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, studentName: true, certificateNumber: true, createdAt: true },
    }),
    prisma.internshipApplication.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, domain: true, createdAt: true },
    }),
    prisma.contactMessage.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, subject: true, createdAt: true },
    }),
  ]);

  const activity: ActivityItem[] = [
    ...certificates.map((c) => ({
      type: "certificate" as const,
      id: c.id,
      title: `Certificate issued to ${c.studentName}`,
      subtitle: c.certificateNumber,
      createdAt: c.createdAt,
    })),
    ...applications.map((a) => ({
      type: "internship" as const,
      id: a.id,
      title: `New internship application from ${a.fullName}`,
      subtitle: a.domain,
      createdAt: a.createdAt,
    })),
    ...messages.map((m) => ({
      type: "contact" as const,
      id: m.id,
      title: `New message from ${m.name}`,
      subtitle: m.subject || "No subject",
      createdAt: m.createdAt,
    })),
  ];

  return activity
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}
