/**
 * Magic-byte ("file signature") checks. Browsers report whatever MIME type the
 * OS/extension implies, which is trivially spoofable — these checks confirm the
 * *bytes* actually match an allowed image format before we trust an upload.
 */

const SIGNATURES: { mime: string; check: (b: Buffer) => boolean }[] = [
  { mime: "image/png", check: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/jpeg", check: (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) },
  { mime: "image/gif", check: (b) => b.subarray(0, 6).toString("latin1") === "GIF87a" || b.subarray(0, 6).toString("latin1") === "GIF89a" },
  {
    mime: "image/webp",
    check: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  },
  {
    // SVG is XML text — look for the opening tag anywhere in the first chunk
    // (unanchored, so a leading BOM/whitespace/comment doesn't cause a false reject).
    mime: "image/svg+xml",
    check: (b) => /<\?xml|<svg/i.test(b.subarray(0, 1024).toString("utf8")),
  },
];

/** Returns true if `buffer` looks like a genuine file of the declared image MIME type. */
export function isValidImageSignature(buffer: Buffer, declaredMime: string): boolean {
  const rule = SIGNATURES.find((s) => s.mime === declaredMime);
  if (!rule) return false;
  try {
    return rule.check(buffer);
  } catch {
    return false;
  }
}

export function isValidPdfSignature(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString("latin1") === "%PDF-";
}
