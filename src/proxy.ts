import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: bounce signed-out visitors to the login screen. This is a UX
  // redirect only — each admin page/action re-verifies the session server-side.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Root: send visitors to the default Arabic locale. 308 (permanent), not
  // the 307 default — this is a stable, permanent locale default, and a
  // temporary redirect tells search engines not to transfer signals to /ar.
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/ar", request.url), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
