import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { AdminTokenPayload } from "@/lib/auth/jwt";

/**
 * Records a sensitive admin action for accountability. Never throws — an
 * audit-log failure must never block the underlying admin action.
 */
export async function logAudit(params: {
  admin?: AdminTokenPayload | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.admin?.sub ?? null,
        adminEmail: params.admin?.email ?? null,
        action: params.action,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null,
        metadata: (params.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err);
  }
}

export async function listAuditLogs(params: { skip: number; take: number }) {
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.auditLog.count(),
  ]);
  return { items, total };
}
