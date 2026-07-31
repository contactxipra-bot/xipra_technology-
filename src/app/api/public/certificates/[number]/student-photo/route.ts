import { NextRequest, NextResponse } from "next/server";
import { getVerifiedStudentPhoto } from "@/lib/services/verification.service";
import { HttpError } from "@/lib/api/response";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string }> };

// Note: Does not use withApiHandler because it returns a binary response (the image),
// not JSON.
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { number } = await context.params;
    const { buffer, imageType } = await getVerifiedStudentPhoto(number);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": imageType,
        "Content-Length": String(buffer.length),
        // Publicly cacheable for 1 day since the URL includes the specific certificate number,
        // and we only serve it if the certificate is ACTIVE anyway.
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[PUBLIC_CERTIFICATE_STUDENT_PHOTO_GET]", error);
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : "Failed to load student photo";
    return new NextResponse(message, { status });
  }
}
