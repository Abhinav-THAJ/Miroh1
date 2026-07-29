import { NextRequest, NextResponse } from "next/server";

const WC_URL = (process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com").replace(/\/$/, "");
const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

function getSessionPayload(request: NextRequest) {
  const sessionCookie = request.cookies.get("auth_session")?.value;
  if (!sessionCookie) return null;
  try {
    const payload = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
    const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.ts > SESSION_MAX_AGE) return null;
    return payload;
  } catch {
    return null;
  }
}

// GET /api/account/customer — fetch full customer data from WooCommerce
export async function GET(request: NextRequest) {
  const session = getSessionPayload(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${WC_URL}/wp-json/wc/v3/customers/${session.id}`,
      { headers: { Authorization: WC_AUTH } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch customer data" }, { status: res.status });
    }

    const customer = await res.json();

    return NextResponse.json({
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      username: customer.username,
      date_created: customer.date_created,
      avatar_url: customer.avatar_url,
      phone: customer.billing?.phone || "",
      billing: {
        first_name: customer.billing?.first_name || "",
        last_name: customer.billing?.last_name || "",
        address_1: customer.billing?.address_1 || "",
        address_2: customer.billing?.address_2 || "",
        city: customer.billing?.city || "",
        state: customer.billing?.state || "",
        postcode: customer.billing?.postcode || "",
        country: customer.billing?.country || "",
        phone: customer.billing?.phone || "",
        email: customer.billing?.email || "",
      },
      shipping: {
        first_name: customer.shipping?.first_name || "",
        last_name: customer.shipping?.last_name || "",
        address_1: customer.shipping?.address_1 || "",
        address_2: customer.shipping?.address_2 || "",
        city: customer.shipping?.city || "",
        state: customer.shipping?.state || "",
        postcode: customer.shipping?.postcode || "",
        country: customer.shipping?.country || "",
      },
    });
  } catch (error) {
    console.error("[Account Customer Error]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/account/customer — update customer profile in WooCommerce
export async function PUT(request: NextRequest) {
  const session = getSessionPayload(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, billing, shipping } = body;

    const updateData: Record<string, unknown> = {};

    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;

    if (phone !== undefined || billing !== undefined) {
      updateData.billing = {
        ...(billing || {}),
        phone: phone || billing?.phone || "",
      };
    }

    if (shipping !== undefined) {
      updateData.shipping = shipping;
    }

    const res = await fetch(
      `${WC_URL}/wp-json/wc/v3/customers/${session.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: WC_AUTH,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    const updatedCustomer = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: updatedCustomer.message || "Failed to update profile" },
        { status: res.status }
      );
    }

    // Update the session cookie with the new name
    const newName = `${updatedCustomer.first_name} ${updatedCustomer.last_name}`.trim() || session.name;
    const newPayload = {
      ...session,
      name: newName,
      email: updatedCustomer.email || session.email,
      ts: Date.now(),
    };
    const newToken = Buffer.from(JSON.stringify(newPayload)).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        name: newName,
      },
    });

    response.cookies.set("auth_session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Account Update Error]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
