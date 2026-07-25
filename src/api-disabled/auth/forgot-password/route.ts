import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_3c548d2a91ef1197b0fa08b8eead4f160c363f99";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_d9364182aa414c4a236ecdd73a250cb401c081ca";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
    }

    // Check if email exists in WooCommerce
    const searchRes = await fetch(
      `${WC_URL}wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: WC_AUTH } }
    );

    if (searchRes.ok) {
      const customers = await searchRes.json();
      if (!Array.isArray(customers) || customers.length === 0) {
        return NextResponse.json(
          { success: false, message: "No account found with this email address." },
          { status: 404 }
        );
      }
    }

    // Trigger WordPress password reset email via WP REST API
    // Note: This requires the lost-password endpoint or a custom plugin.
    // WordPress native endpoint: POST /wp-login.php?action=lostpassword
    const formData = new URLSearchParams();
    formData.append("user_login", email);
    formData.append("redirect_to", "");
    formData.append("wp-submit", "Get New Password");

    const resetRes = await fetch(
      `${WC_URL}wp-login.php?action=lostpassword`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        redirect: "manual",
      }
    );

    // WordPress redirects after sending reset email — 302 means success
    if (resetRes.status === 302 || resetRes.status === 200) {
      return NextResponse.json({
        success: true,
        message: "Password reset instructions have been sent to your email address.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Could not send reset email. Please try again." },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    return NextResponse.json({ success: false, message: "Server error. Please try again." }, { status: 500 });
  }
}
