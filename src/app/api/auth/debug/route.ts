import { NextRequest, NextResponse } from "next/server";

const WC_BASE = (
  process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com"
).replace(/\/$/, "");

const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const results: Record<string, any> = {
    wc_base: WC_BASE,
    env_wc_key_set: !!process.env.WC_CONSUMER_KEY,
    env_wc_secret_set: !!process.env.WC_CONSUMER_SECRET,
  };

  // Test 1: WC customer lookup by email
  try {
    const r = await fetch(
      `${WC_BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&context=edit`,
      { headers: { Authorization: WC_AUTH }, cache: "no-store" }
    );
    const body = await r.json();
    results.wc_customer_lookup = {
      status: r.status,
      found: Array.isArray(body) && body.length > 0,
      username: Array.isArray(body) && body.length > 0 ? body[0].username : null,
    };
  } catch (e: any) {
    results.wc_customer_lookup = { error: e.message };
  }

  // Test 2: JWT token endpoint
  if (password) {
    try {
      const r = await fetch(`${WC_BASE}/wp-json/jwt-auth/v1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
        cache: "no-store",
      });
      const body = await r.json();
      results.jwt_auth = {
        status: r.status,
        has_token: !!body.token,
        code: body.code,
        message: body.message,
      };
    } catch (e: any) {
      results.jwt_auth = { error: e.message };
    }

    // Test 3: wp-login.php
    try {
      const form = new URLSearchParams({
        log: email,
        pwd: password,
        "wp-submit": "Log In",
        redirect_to: "/",
        testcookie: "1",
      });
      const r = await fetch(`${WC_BASE}/wp-login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: "wordpress_test_cookie=WP%20Cookie%20check",
        },
        body: form.toString(),
        redirect: "manual",
      });
      results.wp_login = {
        status: r.status,
        success: r.status === 302,
        location: r.headers.get("location"),
      };
    } catch (e: any) {
      results.wp_login = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
