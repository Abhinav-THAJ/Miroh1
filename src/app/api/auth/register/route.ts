import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_3c548d2a91ef1197b0fa08b8eead4f160c363f99";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_d9364182aa414c4a236ecdd73a250cb401c081ca";

const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // --- Validate required fields ---
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // --- Email format validation ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // --- Password strength validation ---
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // --- Check if email already registered ---
    const searchRes = await fetch(
      `${WC_URL}wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: WC_AUTH } }
    );
    if (searchRes.ok) {
      const existing = await searchRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { success: false, message: "An account with this email address already exists. Please sign in instead." },
          { status: 409 }
        );
      }
    }

    // --- Create WooCommerce customer (uses Application Passwords or WC REST write key) ---
    const nameParts = (name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + Math.floor(Math.random() * 1000);

    const createRes = await fetch(`${WC_URL}wp-json/wc/v3/customers`, {
      method: "POST",
      headers: {
        Authorization: WC_AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        username,
        password,
        billing: { phone: phone || "" },
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      // Handle duplicate email at WC level
      if (createData.code === "registration-error-email-exists") {
        return NextResponse.json(
          { success: false, message: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: createData.message || "Registration failed. Please try again." },
        { status: createRes.status }
      );
    }

    // --- Issue a simple session token (JWT plugin not installed — use WC customer ID as session ref) ---
    const sessionToken = Buffer.from(
      JSON.stringify({ id: createData.id, email: createData.email, ts: Date.now() })
    ).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: createData.id,
        email: createData.email,
        name: `${createData.first_name} ${createData.last_name}`.trim(),
      },
    });

    // Store secure session cookie
    response.cookies.set("auth_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Auth Register Error]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
