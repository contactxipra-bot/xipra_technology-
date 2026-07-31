import nodemailer, { type Transporter } from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";

/**
 * Nodemailer transport built entirely from environment variables.
 * No credentials are ever hardcoded. If SMTP is not configured, email sending
 * is skipped gracefully so public forms still succeed (data is already stored).
 */

let cachedTransporter: Transporter | null = null;
let resolved = false;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): Transporter | null {
  if (resolved) return cachedTransporter;
  resolved = true;

  if (!isEmailConfigured()) {
    cachedTransporter = null;
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Connection pooling avoids a fresh TLS handshake per email, which is the
    // single biggest contributor to send latency on repeated sends.
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return cachedTransporter;
}

export type MailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Attachment[];
};

export type MailResult = { sent: boolean; skipped?: boolean; error?: string; attempts?: number };

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = [500, 1500];

// SMTP/network failures that are worth a retry. Auth/permanent failures
// (bad credentials, rejected sender, invalid recipient) are not retried —
// retrying those just delays the inevitable and risks provider throttling.
const TRANSIENT_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNECTION",
  "ECONNRESET",
  "ESOCKET",
  "EDNS",
  "ENOTFOUND",
  "EPIPE",
]);

function isTransientError(err: unknown): boolean {
  const code = (err as { code?: string; responseCode?: number })?.code;
  const responseCode = (err as { responseCode?: number })?.responseCode;
  if (code && TRANSIENT_ERROR_CODES.has(code)) return true;
  // 4xx SMTP responses are transient (rate limited / greylisted); 5xx are permanent.
  if (typeof responseCode === "number" && responseCode >= 400 && responseCode < 500) return true;
  return false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send an email. Never throws — a mail failure must not fail the user's form
 * submission (the record is already persisted). Returns a status object instead.
 * Retries transient SMTP/network failures with backoff; permanent failures
 * (bad auth, rejected address) fail fast without wasting time.
 */
export async function sendMail({ to, subject, html, replyTo, attachments }: MailInput): Promise<MailResult> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[mailer] SMTP not configured — skipped email "${subject}" to ${to}`);
    return { sent: false, skipped: true };
  }

  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        replyTo,
        attachments,
      });
      console.info(
        `[mailer] sent "${subject}" to ${to} in ${Date.now() - startedAt}ms (attempt ${attempt}/${MAX_ATTEMPTS}, id=${info.messageId})`
      );
      return { sent: true, attempts: attempt };
    } catch (err) {
      lastError = err;
      const transient = isTransientError(err);
      const message = err instanceof Error ? err.message : "unknown error";
      console.error(
        `[mailer] attempt ${attempt}/${MAX_ATTEMPTS} failed for "${subject}" to ${to} (${transient ? "transient" : "permanent"}): ${message}`
      );

      if (!transient || attempt === MAX_ATTEMPTS) break;
      await sleep(RETRY_DELAY_MS[attempt - 1] ?? 1500);
    }
  }

  return {
    sent: false,
    error: lastError instanceof Error ? lastError.message : "unknown error",
    attempts: MAX_ATTEMPTS,
  };
}
