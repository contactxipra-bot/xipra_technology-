import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/response";
import { deletePrivateFile } from "@/lib/private-storage";
import { getCertificateQrRoute } from "@/lib/qrcode";
import type { PaginationParams } from "@/lib/api/pagination";
import type {
  CreateCertificateInput,
  UpdateCertificateInput,
} from "@/lib/validations/certificate.schema";

export async function listCertificates({ skip, take, search }: PaginationParams) {
  const where = search
    ? {
        OR: [
          { studentName: { contains: search, mode: "insensitive" as const } },
          { certificateNumber: { contains: search, mode: "insensitive" as const } },
          { course: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { files: true },
    }),
    prisma.certificate.count({ where }),
  ]);

  return { items, total };
}

export async function getCertificateById(id: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { files: true },
  });
  if (!certificate) throw new HttpError("Certificate not found", 404);
  return certificate;
}

/**
 * Enforce case-insensitive uniqueness of certificate numbers. MySQL gave this
 * for free via its collation; PostgreSQL is case-sensitive, so we check here to
 * preserve the exact behaviour ("XIPRA-1" and "xipra-1" are the same number).
 */
async function assertCertificateNumberUnique(certificateNumber: string, ignoreId?: string) {
  const existing = await prisma.certificate.findFirst({
    where: {
      certificateNumber: { equals: certificateNumber, mode: "insensitive" },
      ...(ignoreId ? { id: { not: ignoreId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    throw new HttpError("A certificate with this number already exists", 409);
  }
}

export async function createCertificate(data: CreateCertificateInput) {
  await assertCertificateNumberUnique(data.certificateNumber);
  // The QR route is deterministic from the certificate number — store it up front.
  return prisma.certificate.create({
    data: { ...data, qrCodePath: getCertificateQrRoute(data.certificateNumber) },
    include: { files: true },
  });
}

export async function updateCertificate(id: string, data: UpdateCertificateInput) {
  await getCertificateById(id);
  if (data.certificateNumber) {
    await assertCertificateNumberUnique(data.certificateNumber, id);
  }
  // If the number changed, the QR's encoded verify URL changes too — keep it in sync.
  const qrCodePath = data.certificateNumber
    ? getCertificateQrRoute(data.certificateNumber)
    : undefined;
  return prisma.certificate.update({
    where: { id },
    data: { ...data, ...(qrCodePath ? { qrCodePath } : {}) },
    include: { files: true },
  });
}

export async function regenerateCertificateQr(id: string) {
  const certificate = await getCertificateById(id);
  return prisma.certificate.update({
    where: { id },
    data: { qrCodePath: getCertificateQrRoute(certificate.certificateNumber) },
    include: { files: true },
  });
}

export async function deleteCertificate(id: string) {
  const certificate = await getCertificateById(id);
  await Promise.all([
    ...certificate.files.map((f) => deletePrivateFile(f.filePath)),
    deletePrivateFile(certificate.imagePath),
    deletePrivateFile(certificate.studentPhotoPath),
  ]);
  await prisma.certificate.delete({ where: { id } });
}

export async function attachCertificateFile(
  certificateId: string,
  file: { fileName: string; filePath: string; fileType: string; fileSize: number }
) {
  const certificate = await getCertificateById(certificateId);
  // Ensure the QR route is set once a certificate has its document (legacy rows).
  if (!certificate.qrCodePath) {
    await prisma.certificate.update({
      where: { id: certificateId },
      data: { qrCodePath: getCertificateQrRoute(certificate.certificateNumber) },
    });
  }
  return prisma.certificateFile.create({
    data: { ...file, certificateId },
  });
}

export async function deleteCertificateFile(certificateId: string, fileId: string) {
  const file = await prisma.certificateFile.findFirst({
    where: { id: fileId, certificateId },
  });
  if (!file) throw new HttpError("File not found", 404);
  await deletePrivateFile(file.filePath);
  await prisma.certificateFile.delete({ where: { id: fileId } });
}

export async function setCertificateImage(
  certificateId: string,
  image: { filePath: string; fileType: string }
) {
  const existing = await getCertificateById(certificateId);
  if (existing.imagePath) await deletePrivateFile(existing.imagePath);
  return prisma.certificate.update({
    where: { id: certificateId },
    data: { imagePath: image.filePath, imageType: image.fileType },
    include: { files: true },
  });
}

export async function deleteCertificateImage(certificateId: string) {
  const existing = await getCertificateById(certificateId);
  if (existing.imagePath) await deletePrivateFile(existing.imagePath);
  return prisma.certificate.update({
    where: { id: certificateId },
    data: { imagePath: null, imageType: null },
    include: { files: true },
  });
}

export async function setStudentPhoto(
  certificateId: string,
  image: { filePath: string; fileType: string }
) {
  const existing = await getCertificateById(certificateId);
  if (existing.studentPhotoPath) await deletePrivateFile(existing.studentPhotoPath);
  return prisma.certificate.update({
    where: { id: certificateId },
    data: { studentPhotoPath: image.filePath, studentPhotoType: image.fileType },
    include: { files: true },
  });
}

export async function deleteStudentPhoto(certificateId: string) {
  const existing = await getCertificateById(certificateId);
  if (existing.studentPhotoPath) await deletePrivateFile(existing.studentPhotoPath);
  return prisma.certificate.update({
    where: { id: certificateId },
    data: { studentPhotoPath: null, studentPhotoType: null },
    include: { files: true },
  });
}
