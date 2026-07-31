import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/response";
import { readPrivateFile } from "@/lib/private-storage";
import type { RequestMeta } from "@/lib/request-meta";

/**
 * Public certificate verification.
 *
 * Matching is an EXACT whole-string equality on `certificateNumber`. MySQL's
 * default case-insensitive collation makes this case-insensitive, which also
 * means the unique constraint enforces global case-insensitive uniqueness.
 * Every attempt (hit or miss) is written to the verification audit log with
 * the client IP, user agent, and timestamp.
 */

export type PublicCertificate = {
  certificateNumber: string;
  studentName: string;
  course: string;
  duration: string;
  issueDate: Date;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  hasFile: boolean;
  fileUrl: string | null;
  hasImage: boolean;
  imageUrl: string | null;
  hasStudentPhoto: boolean;
  studentPhotoUrl: string | null;
};

export type VerifyResult =
  | { found: false }
  | { found: true; certificate: PublicCertificate };

export async function verifyCertificate(
  rawNumber: string,
  meta: RequestMeta
): Promise<VerifyResult> {
  const number = rawNumber.trim();

  const certificate = await prisma.certificate.findFirst({
    // Case-insensitive exact match (PostgreSQL is case-sensitive by default;
    // this preserves the MySQL collation behaviour the app relied on).
    where: { certificateNumber: { equals: number, mode: "insensitive" } },
    include: { files: { orderBy: { uploadedAt: "desc" }, take: 1 } },
  });

  // Audit log — record both successful and failed verification attempts.
  await prisma.verificationLog.create({
    data: {
      certificateNumber: number,
      certificateId: certificate?.id ?? null,
      success: Boolean(certificate),
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    },
  });

  if (!certificate) return { found: false };

  const isActive = certificate.status === "ACTIVE";
  const hasFile = isActive && certificate.files.length > 0;
  const hasImage = isActive && Boolean(certificate.imagePath);
  const hasStudentPhoto = isActive && Boolean(certificate.studentPhotoPath);
  const encoded = encodeURIComponent(certificate.certificateNumber);

  return {
    found: true,
    certificate: {
      certificateNumber: certificate.certificateNumber,
      studentName: certificate.studentName,
      course: certificate.course,
      duration: certificate.duration,
      issueDate: certificate.issueDate,
      status: certificate.status,
      hasFile,
      fileUrl: hasFile ? `/api/public/certificates/${encoded}/file` : null,
      hasImage,
      imageUrl: hasImage ? `/api/public/certificates/${encoded}/image` : null,
      hasStudentPhoto,
      studentPhotoUrl: hasStudentPhoto ? `/api/public/certificates/${encoded}/student-photo` : null,
    },
  };
}

/**
 * Read the optional certificate image — only for ACTIVE certificates that have
 * one. Mirrors the PDF access policy so images are never publicly reachable for
 * revoked/expired/non-existent certificates.
 */
export async function getVerifiedCertificateImage(rawNumber: string) {
  const number = rawNumber.trim();
  const certificate = await prisma.certificate.findFirst({
    where: { certificateNumber: { equals: number, mode: "insensitive" }, status: "ACTIVE" },
  });
  if (!certificate?.imagePath) {
    throw new HttpError("Certificate image not available", 404);
  }
  const buffer = await readPrivateFile(certificate.imagePath);
  return { buffer, imageType: certificate.imageType || "image/png" };
}

/**
 * Read a certificate PDF for public download/preview. Only ACTIVE certificates
 * with an attached file are served — revoked/expired/non-existent certificates
 * return 404 so their PDFs are never publicly accessible.
 */
export async function getVerifiedCertificateFile(rawNumber: string) {
  const number = rawNumber.trim();

  const certificate = await prisma.certificate.findFirst({
    where: { certificateNumber: { equals: number, mode: "insensitive" }, status: "ACTIVE" },
    include: { files: { orderBy: { uploadedAt: "desc" }, take: 1 } },
  });

  const file = certificate?.files[0];
  if (!certificate || !file) {
    throw new HttpError("Certificate file not available", 404);
  }

  const buffer = await readPrivateFile(file.filePath);
  return { buffer, file, certificateNumber: certificate.certificateNumber };
}

export async function getVerifiedStudentPhoto(rawNumber: string) {
  const number = rawNumber.trim();
  const certificate = await prisma.certificate.findFirst({
    where: { certificateNumber: { equals: number, mode: "insensitive" }, status: "ACTIVE" },
  });
  if (!certificate?.studentPhotoPath) {
    throw new HttpError("Student photo not available", 404);
  }
  const buffer = await readPrivateFile(certificate.studentPhotoPath);
  return { buffer, imageType: certificate.studentPhotoType || "image/png" };
}
