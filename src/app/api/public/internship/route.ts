import { NextRequest, after } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { isHoneypotTripped } from "@/lib/sanitize";
import { publicInternshipSchema } from "@/lib/validations/public.schema";
import { createInternshipApplication } from "@/lib/services/internship.service";
import { getSiteSettings } from "@/lib/services/settings.service";
import { sendMail } from "@/lib/email/mailer";
import {
  internshipCompanyEmail,
  internshipStudentEmail,
  type EmailSocialLink,
} from "@/lib/email/templates";

export const runtime = "nodejs";

export const POST = withApiHandler(async (request: NextRequest) => {
  const meta = getRequestMeta(request);
  enforceRateLimit({ scope: "internship", identifier: meta.ip, limit: 5, windowMs: 60_000 });

  const body = await request.json();
  const input = publicInternshipSchema.parse(body);

  if (isHoneypotTripped(input.company)) {
    return apiSuccess(null, { message: "Thank you! Your application has been submitted." });
  }

  const saved = await createInternshipApplication(input);

  // Email is sent after the response is flushed so form submission stays fast;
  // the record is already persisted, so a slow/failed send never blocks the user.
  after(async () => {
    const emailData = {
      fullName: saved.fullName,
      email: saved.email,
      phone: saved.phone,
      course: saved.domain,
      education: saved.education,
      gender: saved.gender,
      address: saved.address,
      submittedAt: saved.createdAt,
    };

    const settings = await getSiteSettings().catch(() => null);
    const branding = {
      logoUrl: settings?.logoUrl ?? undefined,
      socialLinks: (settings?.socialLinks as EmailSocialLink[] | null) ?? undefined,
    };

    const companyRecipient =
      process.env.MAIL_COMPANY_INTERNSHIP || process.env.COMPANY_EMAIL || "";
    const sends: Promise<unknown>[] = [];

    if (companyRecipient) {
      const company = internshipCompanyEmail(emailData, branding);
      sends.push(
        sendMail({
          to: companyRecipient,
          subject: company.subject,
          html: company.html,
          replyTo: saved.email,
        })
      );
    }

    const student = internshipStudentEmail(emailData, branding);
    sends.push(sendMail({ to: saved.email, subject: student.subject, html: student.html }));

    await Promise.all(sends);
  });

  return apiSuccess(
    { id: saved.id },
    { message: "Thank you! Your application has been submitted.", status: 201 }
  );
});
