import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withApiHandler, apiSuccess, HttpError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { sendMail } from "@/lib/email/mailer";
import { readPrivateFile } from "@/lib/private-storage";
import { getSiteSettings } from "@/lib/services/settings.service";
import { certificateIssuedEmail, type EmailSocialLink } from "@/lib/email/templates";
import { sendCertificateEmailSchema } from "@/lib/validations/certificate.schema";

export const POST = withApiHandler(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await context.params;
  const certId = id;

  const body = await request.json();
  const { email, customMessage } = sendCertificateEmailSchema.parse(body);

  const certificate = await prisma.certificate.findUnique({
    where: { id: certId },
    include: { files: true },
  });

  if (!certificate) {
    throw new HttpError("Certificate not found.", 404);
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-certificate?certId=${certificate.certificateNumber}`;

  const settings = await getSiteSettings().catch(() => null);
  const branding = {
    logoUrl: settings?.logoUrl ?? undefined,
    socialLinks: (settings?.socialLinks as EmailSocialLink[] | null) ?? undefined,
  };

  const { subject, html } = certificateIssuedEmail({
    studentName: certificate.studentName,
    course: certificate.course,
    certificateNumber: certificate.certificateNumber,
    issueDate: new Date(certificate.issueDate),
    verifyUrl,
    customMessage,
  }, branding);

  const attachments = [];

  if (certificate.imagePath) {
    try {
      const buffer = await readPrivateFile(certificate.imagePath);
      attachments.push({
        filename: `Certificate_${certificate.certificateNumber}.${certificate.imageType?.split('/')[1] || 'png'}`,
        content: buffer,
      });
    } catch (e) {
      console.error("Failed to read certificate image for attachment", e);
    }
  } else if (certificate.files && certificate.files.length > 0) {
    try {
      const file = certificate.files[0];
      const buffer = await readPrivateFile(file.filePath);
      attachments.push({
        filename: file.fileName,
        content: buffer,
      });
    } catch (e) {
      console.error("Failed to read certificate file for attachment", e);
    }
  }

  await sendMail({
    to: email,
    subject,
    html,
    attachments,
  });

  return apiSuccess({ success: true }, { message: "Email sent successfully" });
});
