import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

export async function GET(request: NextRequest) {
  // Verify the user has a valid session before fetching orders
  const sessionCookie = request.cookies.get("auth_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let customerId: number | null = null;
  try {
    const payload = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
    const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.ts > SESSION_MAX_AGE) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    customerId = payload.id;
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // Allow overriding customer_id from query but only use the session's own id
  const { searchParams } = new URL(request.url);
  const requestedId = searchParams.get("customer_id");

  // Security: only allow fetching the session user's own orders
  const effectiveCustomerId = customerId;
  if (requestedId && parseInt(requestedId) !== effectiveCustomerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetch(
      `${WC_URL}wp-json/wc/v3/orders?customer=${effectiveCustomerId}&per_page=20`,
      { headers: { Authorization: WC_AUTH } }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const orders = await res.json();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
