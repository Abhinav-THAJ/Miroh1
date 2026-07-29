import { NextRequest, NextResponse } from "next/server";

// Protected routes that require an active auth session
// Note: /account shows the login form itself so we do NOT block it at middleware level.
// /checkout is NOT blocked either — it shows login prompt inline.
// We only protect /account/... sub-paths if they exist.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check session cookie validity for protected API routes
  if (pathname.startsWith("/api/account/")) {
    const sessionCookie = request.cookies.get("auth_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const payload = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
      const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - payload.ts > SESSION_MAX_AGE) {
        const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
        response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return response;
      }
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/account/:path*"],
};
