import QRCode from "qrcode";

/**
 * Certificate QR codes.
 *
 * Each QR encodes a public URL to the verify page with the certificate number
 * pre-filled, so scanning it opens verification for exactly one certificate.
 *
 * QR images are rendered ON DEMAND through an API route rather than written to
 * disk — this is deterministic (derived from the certificate number), always
 * reflects the current verify URL, and works identically in dev, production,
 * and serverless environments (no runtime filesystem dependency).
 */

export function getVerifyUrl(certificateNumber: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}/verify-certificate?number=${encodeURIComponent(certificateNumber)}`;
}

/** Stable per-certificate route that serves this certificate's QR PNG. */
export function getCertificateQrRoute(certificateNumber: string): string {
  return `/api/public/certificates/${encodeURIComponent(certificateNumber)}/qr`;
}

/** Render the QR PNG for a certificate number as a Buffer. */
export async function renderCertificateQrPng(certificateNumber: string): Promise<Buffer> {
  return QRCode.toBuffer(getVerifyUrl(certificateNumber), {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}
