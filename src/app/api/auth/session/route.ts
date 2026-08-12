import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get("auth_session")?.value;

    if (!cookie) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    let payload: any;
    try {
      payload = JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
    } catch {
      const r = NextResponse.json({ authenticated: false, user: null });
      r.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
      return r;
    }

    // Expired?
    if (!payload.ts || Date.now() - payload.ts > SESSION_MAX_AGE_MS) {
      const r = NextResponse.json({
        authenticated: false,
        user: null,
        reason: "session_expired",
      });
      r.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
      return r;
    }

    // Sliding session — refresh timestamp
    const refreshed = { ...payload, ts: Date.now() };
    const newToken = Buffer.from(JSON.stringify(refreshed)).toString("base64");

    const displayName =
      payload.name ||
      `${payload.firstName || ""} ${payload.lastName || ""}`.trim() ||
      payload.email?.split("@")[0] ||
      "Customer";

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id,
        email: payload.email,
        name: displayName,
        firstName: payload.firstName || "",
        lastName: payload.lastName || "",
        username: payload.username || "",
      },
    });

    response.cookies.set("auth_session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
