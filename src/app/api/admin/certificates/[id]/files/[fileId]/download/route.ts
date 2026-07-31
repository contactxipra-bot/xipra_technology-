import { NextRequest, NextResponse } from "next/server";
import { withApiHandler, HttpError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { prisma } from "@/lib/db";
import { readPrivateFile } from "@/lib/private-storage";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; fileId: string }> };

/**
 * Authenticated admin access to a certificate PDF held in private storage.
 * Used by the admin panel for preview/download regardless of certificate status
 * (admins can inspect revoked/expired certificate files too).
 */
export const GET = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id, fileId } = await context.params;

  const file = await prisma.certificateFile.findFirst({
    where: { id: fileId, certificateId: id },
  });
  if (!file) throw new HttpError("File not found", 404);

  const buffer = await readPrivateFile(file.filePath);
  const isDownload = request.nextUrl.searchParams.get("download") === "1";
  const disposition = isDownload ? "attachment" : "inline";

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": file.fileType || "application/pdf",
      "Content-Length": String(buffer.length),
      "Content-Disposition": `${disposition}; filename="${file.fileName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
