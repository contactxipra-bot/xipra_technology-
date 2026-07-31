import { NextRequest, NextResponse } from "next/server";
import { withApiHandler, apiSuccess, HttpError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { savePrivateImage, readPrivateFile } from "@/lib/private-storage";
import { prisma } from "@/lib/db";
import {
  setCertificateImage,
  deleteCertificateImage,
} from "@/lib/services/certificate.service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// View the optional certificate image (authenticated admin, private storage).
export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const certificate = await prisma.certificate.findUnique({ where: { id } });
  if (!certificate?.imagePath) throw new HttpError("Image not found", 404);

  const buffer = await readPrivateFile(certificate.imagePath);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": certificate.imageType || "image/png",
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

export const POST = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new HttpError("No file provided", 400);

  const saved = await savePrivateImage(file, "certificate-images");
  const certificate = await setCertificateImage(id, saved);
  return apiSuccess(certificate, { message: "Certificate image uploaded", status: 201 });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const certificate = await deleteCertificateImage(id);
  return apiSuccess(certificate, { message: "Certificate image removed" });
});
