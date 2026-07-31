import { NextRequest, after } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { isHoneypotTripped } from "@/lib/sanitize";
import { publicContactSchema } from "@/lib/validations/public.schema";
import { createContactMessage } from "@/lib/services/contact.service";
import { getSiteSettings } from "@/lib/services/settings.service";
import { sendMail } from "@/lib/email/mailer";
import { contactCompanyEmail, contactUserEmail, type EmailSocialLink } from "@/lib/email/templates";

export const runtime = "nodejs";

export const POST = withApiHandler(async (request: NextRequest) => {
  const meta = getRequestMeta(request);
  enforceRateLimit({ scope: "contact", identifier: meta.ip, limit: 5, windowMs: 60_000 });

  const body = await request.json();
  const input = publicContactSchema.parse(body);

  // Spam trap: silently accept but drop bot submissions.
  if (isHoneypotTripped(input.company)) {
    return apiSuccess(null, { message: "Thank you! Your message has been received." });
  }

  const normalized = {
    ...input,
    phone: input.phone || undefined,
    subject: input.subject || undefined,
  };

  const saved = await createContactMessage(normalized);

  // Email is sent after the response is flushed so form submission stays fast;
  // the record is already persisted, so a slow/failed send never blocks the user.
  after(async () => {
    const emailData = {
      name: saved.name,
      email: saved.email,
      phone: saved.phone,
      subject: saved.subject,
      message: saved.message,
      submittedAt: saved.createdAt,
    };

    const settings = await getSiteSettings().catch(() => null);
    const branding = {
      logoUrl: settings?.logoUrl ?? undefined,
      socialLinks: (settings?.socialLinks as EmailSocialLink[] | null) ?? undefined,
    };

    const companyRecipient = process.env.MAIL_COMPANY_CONTACT || process.env.COMPANY_EMAIL || "";
    const sends: Promise<unknown>[] = [];

    if (companyRecipient) {
      const { subject, html } = contactCompanyEmail(emailData, branding);
      sends.push(sendMail({ to: companyRecipient, subject, html, replyTo: saved.email }));
    }

    const { subject: userSubject, html: userHtml } = contactUserEmail(emailData, branding);
    sends.push(sendMail({ to: saved.email, subject: userSubject, html: userHtml }));

    await Promise.all(sends);
  });

  return apiSuccess(
    { id: saved.id },
    { message: "Thank you! Your message has been received.", status: 201 }
  );
});
