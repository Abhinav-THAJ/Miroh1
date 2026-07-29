import { NextRequest, NextResponse } from "next/server";

const WC_BASE = (
  process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com"
).replace(/\/$/, "");

const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

/** Check if the email exists in WooCommerce OR as a WP user */
async function resolveEmailToWpLogin(email: string): Promise<string | null> {
  // 1. Try WooCommerce customers
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: WC_AUTH } }
    );
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        return list[0].username || email; // use username for WP lost-password trigger
      }
    }
  } catch { /* ignore */ }

  // 2. Try WP users (covers admin accounts not in WC customers)
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}&context=view`,
      { headers: { Authorization: WC_AUTH } }
    );
    if (res.ok) {
      const users = await res.json();
      if (Array.isArray(users)) {
        const match = users.find(
          (u: any) =>
            u.name?.toLowerCase() === email.toLowerCase() ||
            u.slug === email.replace(/[@.]/g, "-").toLowerCase() ||
            u.slug === email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase()
        );
        if (match) return match.slug;
      }
    }
  } catch { /* ignore */ }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
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

    // Verify email exists before attempting reset
    const loginIdentifier = await resolveEmailToWpLogin(email);
    if (!loginIdentifier) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Trigger WordPress password reset email via wp-login.php
    // WordPress accepts either email or username in the user_login field
    const form = new URLSearchParams({
      user_login: email, // WP accepts email directly
      "wp-submit": "Get New Password",
      redirect_to: "",
    });

    const res = await fetch(`${WC_BASE}/wp-login.php?action=lostpassword`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      redirect: "manual",
    });

    // WordPress returns 302 (redirects to login page with ?checkemail=confirm) on success
    // or 200 on failure
    if (res.status === 302 || res.status === 200) {
      // We always return success to prevent email enumeration attacks
      return NextResponse.json({
        success: true,
        message:
          "If an account with this email exists, you will receive a password reset link shortly. Please check your inbox.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Could not send reset email. Please try again later." },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
