/**
 * Basic input sanitization for user-submitted text.
 *
 * Zod handles shape/length/format validation; these helpers normalise the raw
 * values before storage so stray control characters or HTML angle brackets
 * can't sneak into the database or the emails we generate from it.
 */

// Strip ASCII control characters (except tab/newline/carriage-return).
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeText(value: string): string {
  return value.replace(CONTROL_CHARS, "").trim();
}

/** Escape a string for safe interpolation inside HTML email templates. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Honeypot check. Bots tend to fill every field, including hidden ones.
 * A non-empty honeypot value means the submission is almost certainly spam.
 */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
