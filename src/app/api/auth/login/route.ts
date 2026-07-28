import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_3c548d2a91ef1197b0fa08b8eead4f160c363f99";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_d9364182aa414c4a236ecdd73a250cb401c081ca";

const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Lookup customer by email in WooCommerce
    const searchRes = await fetch(
      `${WC_URL}wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: WC_AUTH } }
    );

    if (!searchRes.ok) {
      return NextResponse.json(
        { success: false, message: "Authentication service unavailable. Please try again." },
        { status: 503 }
      );
    }

    const customers = await searchRes.json();

    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address. Please create an account." },
        { status: 404 }
      );
    }

    const customer = customers[0];

    // NOTE: WooCommerce REST API (with consumer keys) cannot verify passwords directly.
    // For production, this requires either:
    //   a) JWT Authentication for WP plugin (/wp-json/jwt-auth/v1/token) — NOT installed
    //   b) WordPress Application Passwords
    // Since JWT plugin is NOT installed on this server, we use WP Application Passwords endpoint.
    const wpAuthRes = await fetch(`${WC_URL}wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${password}`).toString("base64")}`,
      },
    });

    if (!wpAuthRes.ok) {
      // Try with username fallback
      const wpAuthRes2 = await fetch(`${WC_URL}wp-json/wp/v2/users/me`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${customer.username}:${password}`).toString("base64")}`,
        },
      });

      if (!wpAuthRes2.ok) {
        return NextResponse.json(
          {
            success: false,
            message: "Incorrect password. Please try again or reset your password.",
            code: "invalid_password",
          },
          { status: 401 }
        );
      }
    }

    // Issue session cookie
    const sessionToken = Buffer.from(
      JSON.stringify({ id: customer.id, email: customer.email, ts: Date.now() })
    ).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      user: {
        id: customer.id,
        email: customer.email,
        name: `${customer.first_name} ${customer.last_name}`.trim() || customer.username,
      },
    });

    response.cookies.set("auth_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Auth Login Error]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
