import { NextRequest, NextResponse } from "next/server";

const WC_BASE = (
  process.env.NEXT_PUBLIC_WC_URL || "https://mediumaquamarine-seahorse-783985.hostingersite.com"
).replace(/\/$/, "");

const WC_KEY = process.env.WC_CONSUMER_KEY || "";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

const CART_META_KEY = "miorah_saved_cart";

/** Read session cookie and return customer ID, or null */
function getSessionUser(request: NextRequest): { id: number; email: string } | null {
  let cookie = request.cookies.get("auth_session")?.value;
  if (!cookie) return null;
  try {
    if (cookie.includes("%")) {
      try {
        cookie = decodeURIComponent(cookie);
      } catch {
        // Ignore decoding errors
      }
    }
    const payload = JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
    const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.ts > SESSION_MAX_AGE) return null;
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}

// ─── GET: Load saved cart for the logged-in user ─────────────────────────────
export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wc/v3/customers/${user.id}?context=edit`,
      { headers: { Authorization: WC_AUTH }, cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ success: false, items: [] });
    }

    const customer = await res.json();
    const cartMeta = (customer.meta_data || []).find(
      (m: any) => m.key === CART_META_KEY
    );

    let items = [];
    if (cartMeta?.value) {
      try {
        items = JSON.parse(cartMeta.value);
      } catch {
        items = [];
      }
    }

    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error("[Cart Load Error]", err);
    return NextResponse.json({ success: false, items: [] });
  }
}

// ─── POST: Save cart for the logged-in user ───────────────────────────────────
export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items } = await request.json();

    const res = await fetch(`${WC_BASE}/wp-json/wc/v3/customers/${user.id}`, {
      method: "PUT",
      headers: {
        Authorization: WC_AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_data: [
          {
            key: CART_META_KEY,
            value: JSON.stringify(items ?? []),
          },
        ],
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Cart Save Error] WC response:", err);
      return NextResponse.json({ success: false, error: "Failed to save cart" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Cart Save Error]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// ─── DELETE: Clear saved cart for the logged-in user ─────────────────────────
export async function DELETE(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await fetch(`${WC_BASE}/wp-json/wc/v3/customers/${user.id}`, {
      method: "PUT",
      headers: { Authorization: WC_AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({
        meta_data: [{ key: CART_META_KEY, value: "" }],
      }),
      cache: "no-store",
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
