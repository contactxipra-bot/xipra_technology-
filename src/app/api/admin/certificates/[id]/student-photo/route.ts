import { NextRequest, NextResponse } from "next/server";
import { withApiHandler, apiSuccess, HttpError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { savePrivateImage, readPrivateFile } from "@/lib/private-storage";
import { prisma } from "@/lib/db";
import {
  setStudentPhoto,
  deleteStudentPhoto,
} from "@/lib/services/certificate.service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// View the optional student photo (authenticated admin, private storage).
export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const certificate = await prisma.certificate.findUnique({ where: { id } });
  if (!certificate?.studentPhotoPath) throw new HttpError("Image not found", 404);

  const buffer = await readPrivateFile(certificate.studentPhotoPath);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": certificate.studentPhotoType || "image/png",
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
  const certificate = await setStudentPhoto(id, saved);
  return apiSuccess(certificate, { message: "Student photo uploaded", status: 201 });
});

export const DELETE = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const certificate = await deleteStudentPhoto(id);
  return apiSuccess(certificate, { message: "Student photo removed" });
});
