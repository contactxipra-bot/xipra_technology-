import { escapeHtml } from "@/lib/sanitize";

/**
 * Branded, responsive HTML email templates. All dynamic values are HTML-escaped.
 * Styling is inlined because email clients strip <style> and external CSS.
 * Tables + bulletproof buttons are used throughout for Outlook compatibility.
 */

const BRAND = {
  name: () => process.env.COMPANY_NAME || "Xipra Technology",
  phone: () => process.env.COMPANY_PHONE || "+91 9033387254",
  email: () => process.env.COMPANY_EMAIL || "info@xipratechnology.com",
  website: () => process.env.COMPANY_WEBSITE || "https://xipratechnology.com",
  primary: "#2f6bff",
  primaryDark: "#1e40af",
  ink: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f1f5f9",
};

export type EmailSocialLink = { platform: string; url: string };

export type BrandingOptions = {
  logoUrl?: string | null;
  socialLinks?: EmailSocialLink[];
};

function logoBlock(logoUrl?: string | null): string {
  if (logoUrl) {
    const src = logoUrl.startsWith('/') ? `${BRAND.website()}${logoUrl}` : logoUrl;
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(BRAND.name())}" width="40" height="40" style="display:block;border-radius:10px;object-fit:cover;" />`;
  }
  return `<span style="display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;background:rgba(255,255,255,0.18);color:#ffffff;font-weight:800;font-size:20px;border-radius:10px;">${escapeHtml(BRAND.name().charAt(0))}</span>`;
}

function socialRow(socialLinks?: EmailSocialLink[]): string {
  if (!socialLinks || socialLinks.length === 0) return "";
  const cells = socialLinks
    .slice(0, 6)
    .map(
      (link) =>
        `<td style="padding:0 6px 0 0;">
          <a href="${escapeHtml(link.url)}" style="display:inline-block;padding:8px 14px;background:#f8fafc;border:1px solid ${BRAND.border};border-radius:999px;font-size:12px;font-weight:600;color:${BRAND.ink};text-decoration:none;">${escapeHtml(capitalize(link.platform))}</a>
        </td>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px;"><tr>${cells}</tr></table>`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;">
    <tr>
      <td style="border-radius:10px;background:${BRAND.primary};">
        <a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function layout(title: string, bodyInner: string, branding: BrandingOptions = {}): string {
  const company = escapeHtml(BRAND.name());
  const year = new Date().getFullYear();
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark});padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;width:40px;">${logoBlock(branding.logoUrl)}</td>
                  <td style="vertical-align:middle;padding-left:12px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.3px;">${company}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyInner}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#f8fafc;border-top:1px solid ${BRAND.border};">
              <p style="margin:0 0 6px;font-size:13px;color:${BRAND.muted};line-height:1.6;">
                <strong style="color:${BRAND.ink};">${company}</strong><br />
                Phone: ${escapeHtml(BRAND.phone())}<br />
                Email: <a href="mailto:${escapeHtml(BRAND.email())}" style="color:${BRAND.primary};text-decoration:none;">${escapeHtml(BRAND.email())}</a><br />
                Web: <a href="${escapeHtml(BRAND.website())}" style="color:${BRAND.primary};text-decoration:none;">${escapeHtml(BRAND.website())}</a>
              </p>
              ${socialRow(branding.socialLinks)}
              <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;">&copy; ${year} ${company}. All rights reserved.</p>
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">This is an automated message from ${company}. Please do not reply to auto-generated confirmations.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${BRAND.ink};font-weight:600;">${escapeHtml(value) || "&mdash;"}</td>
  </tr>`;
}

function heading(text: string, sub?: string): string {
  return `<h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:${BRAND.ink};">${escapeHtml(text)}</h1>${
    sub ? `<p style="margin:0 0 20px;font-size:14px;color:${BRAND.muted};line-height:1.6;">${escapeHtml(sub)}</p>` : ""
  }`;
}

// ---- Internship: company notification ----

export type InternshipEmailData = {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  education?: string | null;
  gender?: string | null;
  address?: string | null;
  submittedAt: Date;
};

export function internshipCompanyEmail(
  data: InternshipEmailData,
  branding?: BrandingOptions
): { subject: string; html: string } {
  const subject = `New Internship Application — ${data.fullName}`;
  const rows = [
    detailRow("Full Name", data.fullName),
    detailRow("Email", data.email),
    detailRow("Mobile", data.phone),
    detailRow("Course", data.course),
    detailRow("Education", data.education || ""),
    detailRow("Gender", data.gender || ""),
    detailRow("Address", data.address || ""),
    detailRow("Submitted", data.submittedAt.toLocaleString()),
  ].join("");

  const body = `
    ${heading("New Internship Application", "A new candidate has applied through the website internship form.")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <div style="margin-top:24px;padding:14px 16px;background:#eff6ff;border-radius:10px;font-size:13px;color:${BRAND.primaryDark};">
      Reply directly to <strong>${escapeHtml(data.email)}</strong> to contact the applicant.
    </div>`;

  return { subject, html: layout(subject, body, branding) };
}

// ---- Internship: student confirmation ----

export function internshipStudentEmail(
  data: InternshipEmailData,
  branding?: BrandingOptions
): { subject: string; html: string } {
  const subject = `We received your internship application — ${BRAND.name()}`;
  const body = `
    ${heading(`Thank you, ${data.fullName}!`, "Your internship application has been received successfully.")}
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${BRAND.ink};">
      Thank you for applying to the <strong>${escapeHtml(BRAND.name())}</strong> internship program. Our team has received your
      application for the <strong>${escapeHtml(data.course)}</strong> track and will review it shortly. If shortlisted, we'll
      reach out to you at the email or phone number you provided.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;">
      ${detailRow("Selected Course", data.course)}
      ${detailRow("Application Email", data.email)}
    </table>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:${BRAND.ink};">
      Meanwhile, feel free to explore our work while you wait to hear back from us.
    </p>
    ${ctaButton("Visit Our Website", BRAND.website())}
    <p style="margin:18px 0 0;font-size:14px;color:${BRAND.muted};">Warm regards,<br /><strong style="color:${BRAND.ink};">The ${escapeHtml(BRAND.name())} Team</strong></p>`;

  return { subject, html: layout(subject, body, branding) };
}

// ---- Contact: company notification ----

export type ContactEmailData = {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  submittedAt: Date;
};

export function contactCompanyEmail(
  data: ContactEmailData,
  branding?: BrandingOptions
): { subject: string; html: string } {
  const subject = `New Contact Message — ${data.subject || data.name}`;
  const rows = [
    detailRow("Name", data.name),
    detailRow("Email", data.email),
    detailRow("Mobile", data.phone || ""),
    detailRow("Subject", data.subject || ""),
    detailRow("Received", data.submittedAt.toLocaleString()),
  ].join("");

  const body = `
    ${heading("New Contact Message", "A new message was submitted through the website contact form.")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <div style="margin-top:20px;">
      <div style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Message</div>
      <div style="padding:16px;background:#f8fafc;border:1px solid ${BRAND.border};border-radius:10px;font-size:14px;line-height:1.7;color:${BRAND.ink};white-space:pre-wrap;">${escapeHtml(data.message)}</div>
    </div>
    <div style="margin-top:24px;padding:14px 16px;background:#eff6ff;border-radius:10px;font-size:13px;color:${BRAND.primaryDark};">
      Reply directly to <strong>${escapeHtml(data.email)}</strong> to respond.
    </div>`;

  return { subject, html: layout(subject, body, branding) };
}

// ---- Contact: sender confirmation ----

export function contactUserEmail(
  data: ContactEmailData,
  branding?: BrandingOptions
): { subject: string; html: string } {
  const subject = `We received your message — ${BRAND.name()}`;
  const body = `
    ${heading(`Thank you, ${data.name}!`, "We've received your message and a member of our team will get back to you shortly.")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;">
      ${detailRow("Subject", data.subject || "General Inquiry")}
      ${detailRow("Submitted", data.submittedAt.toLocaleString())}
    </table>
    <div style="margin-bottom:22px;">
      <div style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Your Message</div>
      <div style="padding:16px;background:#f8fafc;border:1px solid ${BRAND.border};border-radius:10px;font-size:14px;line-height:1.7;color:${BRAND.ink};white-space:pre-wrap;">${escapeHtml(data.message)}</div>
    </div>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:${BRAND.ink};">
      In the meantime, feel free to browse our work or reach us directly using the details below.
    </p>
    ${ctaButton("Visit Our Website", BRAND.website())}
    <p style="margin:18px 0 0;font-size:14px;color:${BRAND.muted};">Warm regards,<br /><strong style="color:${BRAND.ink};">The ${escapeHtml(BRAND.name())} Team</strong></p>`;

  return { subject, html: layout(subject, body, branding) };
}

// ---- Certificate: issue notification ----

export type CertificateEmailData = {
  studentName: string;
  course: string;
  certificateNumber: string;
  issueDate: Date;
  verifyUrl: string;
  customMessage?: string | null;
};

export function certificateIssuedEmail(
  data: CertificateEmailData,
  branding?: BrandingOptions
): { subject: string; html: string } {
  const subject = `Your Certificate is Ready - ${data.course}`;
  
  const rows = [
    detailRow("Course", data.course),
    detailRow("Certificate #", data.certificateNumber),
    detailRow("Issue Date", data.issueDate.toLocaleDateString()),
  ].join("");

  const body = `
    ${heading(`Congratulations, ${data.studentName}!`, "We are pleased to inform you that your certificate has been officially issued.")}
    
    ${data.customMessage ? `
    <div style="margin-bottom:22px;">
      <div style="padding:16px;background:#f8fafc;border:1px solid ${BRAND.border};border-radius:10px;font-size:14px;line-height:1.7;color:${BRAND.ink};white-space:pre-wrap;">${escapeHtml(data.customMessage)}</div>
    </div>` : ""}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;">
      ${rows}
    </table>
    
    <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:${BRAND.ink};">
      You can view and verify the authenticity of your certificate online using the button below. 
      If you have uploaded any attachments (like a PDF or image), it may also be attached to this email.
    </p>
    
    ${ctaButton("Verify Certificate", data.verifyUrl)}
    
    <p style="margin:18px 0 0;font-size:14px;color:${BRAND.muted};">
      We wish you all the best in your future endeavors!<br /><br />
      Warm regards,<br /><strong style="color:${BRAND.ink};">The ${escapeHtml(BRAND.name())} Team</strong>
    </p>`;

  return { subject, html: layout(subject, body, branding) };
}
