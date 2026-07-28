import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("auth_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const payload = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));

    // Validate session not older than 7 days
    const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.ts > SESSION_MAX_AGE) {
      const response = NextResponse.json({ authenticated: false, user: null, reason: "session_expired" });
      response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name || payload.email.split("@")[0],
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
