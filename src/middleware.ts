import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

const PUBLIC_ADMIN_PAGES = ["/admin/login"];
const PUBLIC_API_ROUTES = ["/api/admin/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (pathname.startsWith("/api/admin")) {
    if (PUBLIC_API_ROUTES.includes(pathname)) {
      return NextResponse.next();
    }
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const isPublicPage = PUBLIC_ADMIN_PAGES.includes(pathname);

    if (!session && !isPublicPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session && isPublicPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
