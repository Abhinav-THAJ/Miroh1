import { NextRequest, NextResponse } from "next/server";

const WC_BASE = (
  process.env.NEXT_PUBLIC_WC_URL || "https://mediumaquamarine-seahorse-783985.hostingersite.com"
).replace(/\/$/, "");

const WC_KEY = process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Password Verification ────────────────────────────────────────────────────
/**
 * Strategy 1 (PRIMARY): Custom WP REST endpoint /wp-json/miorah/v1/verify
 *   - Uses WordPress native wp_check_password() — 100% reliable
 *   - Requires the Miorah PHP snippet in functions.php
 * Strategy 2: JWT Authentication Plugin (/wp-json/jwt-auth/v1/token)
 * Strategy 3: wp-login.php form POST — final fallback
 */
async function verifyWpPassword(
  loginField: string,
  password: string,
  username?: string
): Promise<boolean> {

  // ── Strategy 1: Custom WordPress REST endpoint ────────────────────────────
  try {
    const res = await fetch(`${WC_BASE}/wp-json/miorah/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Miorah-Secret": "miorahverify2024xK9m",
      },
      body: JSON.stringify({ email: loginField, password }),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        console.log("[Auth] Strategy 1 (custom endpoint) succeeded for:", loginField);
        return true;
      }
    }
    if (res.status === 401) {
      const data = await res.json().catch(() => ({}));
      if (data.error === "Wrong password") {
        console.log("[Auth] Strategy 1 confirmed wrong password");
        return false;
      }
    }
    console.log("[Auth] Strategy 1 status:", res.status, "- falling through");
  } catch (e) {
    console.log("[Auth] Strategy 1 not available (add PHP snippet to functions.php):", (e as Error).message);
  }

  // ── Strategy 2: JWT Authentication Plugin ────────────────────────────────
  const jwtTargets = Array.from(new Set([loginField, username].filter(Boolean))) as string[];
  for (const jwtUser of jwtTargets) {
    try {
      const res = await fetch(`${WC_BASE}/wp-json/jwt-auth/v1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: jwtUser, password }),
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.token) {
        console.log("[Auth] JWT succeeded for:", jwtUser);
        return true;
      }
      if (data.code?.includes("incorrect_password")) {
        console.log("[Auth] JWT confirmed wrong password");
        return false;
      }
      console.log("[Auth] JWT status:", res.status, data.code, "- trying next");
    } catch (e) {
      console.error("[Auth] JWT error:", e);
    }
  }

  // ── Strategy 3: wp-login.php form POST ───────────────────────────────────
  // WordPress accepts email OR username in the `log` field.
  // Success → 302 redirect NOT pointing back to wp-login.php
  // Failure → 200 (renders error page) or 302 back to wp-login.php
  const loginTargets = Array.from(new Set([loginField, username].filter(Boolean))) as string[];
  for (const target of loginTargets) {
    try {
      const form = new URLSearchParams({
        log: target,
        pwd: password,
        "wp-submit": "Log In",
        redirect_to: "/wp-admin/",
        testcookie: "1",
      });

      const res = await fetch(`${WC_BASE}/wp-login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: "wordpress_test_cookie=WP%20Cookie%20check",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Origin: WC_BASE,
          Referer: `${WC_BASE}/wp-login.php`,
        },
        body: form.toString(),
        redirect: "manual",
      });

      const location = res.headers.get("location") || "";
      const isSuccess = res.status === 302 && !location.includes("wp-login.php");
      console.log("[Auth] wp-login.php for", target, "→", res.status, "loc:", location, "ok:", isSuccess);

      if (isSuccess) return true;
    } catch (e) {
      console.error("[Auth] wp-login.php error:", e);
    }
  }

  return false;
}

// ─── WooCommerce customer lookup ──────────────────────────────────────────────
async function getWcCustomerByEmail(email: string) {
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&context=edit`,
      { headers: { Authorization: WC_AUTH }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const list = await res.json();
    return Array.isArray(list) && list.length > 0 ? list[0] : null;
  } catch {
    return null;
  }
}

async function getWcCustomerByUsername(username: string) {
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wc/v3/customers?search=${encodeURIComponent(username)}&context=edit`,
      { headers: { Authorization: WC_AUTH }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const list = await res.json();
    if (!Array.isArray(list)) return null;
    return list.find((c: any) => c.username?.toLowerCase() === username.toLowerCase()) || null;
  } catch {
    return null;
  }
}

async function getFullWcCustomer(id: number) {
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wc/v3/customers/${id}?context=edit`,
      { headers: { Authorization: WC_AUTH }, cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── WP user lookup (covers admin accounts not in WC customers) ───────────────
async function getWpUserByEmail(email: string) {
  try {
    // Search by email prefix / full email
    const res = await fetch(
      `${WC_BASE}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}&context=view`,
      { headers: { Authorization: WC_AUTH }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const users = await res.json();
    if (!Array.isArray(users) || users.length === 0) return null;

    // Try exact email match first (some WP configs expose email in name field)
    let match = users.find((u: any) =>
      u.name?.toLowerCase() === email.toLowerCase()
    );

    // Fallback: match by slug derived from email (WordPress slugifies the email)
    if (!match) {
      const emailSlug = email
        .toLowerCase()
        .replace(/@/g, "")    // remove @
        .replace(/\./g, "")   // remove dots
        .replace(/[^a-z0-9]/g, ""); // strip special chars
      match = users.find((u: any) => {
        const uSlug = (u.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return uSlug === emailSlug || u.slug?.includes(emailSlug.slice(0, 8));
      });
    }

    // Last resort: if only 1 result, use it
    if (!match && users.length === 1) match = users[0];

    return match || null;
  } catch {
    return null;
  }
}

async function getWpUserByUsername(username: string) {
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wp/v2/users?search=${encodeURIComponent(username)}&context=view`,
      { headers: { Authorization: WC_AUTH }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const users = await res.json();
    if (!Array.isArray(users)) return null;
    return users.find((u: any) =>
      u.slug?.toLowerCase() === username.toLowerCase()
    ) || (users.length === 1 ? users[0] : null);
  } catch {
    return null;
  }
}

// ─── Issue session cookie ─────────────────────────────────────────────────────
function issueSession(user: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}) {
  const displayName =
    `${user.firstName} ${user.lastName}`.trim() ||
    user.username ||
    user.email.split("@")[0];

  const payload = {
    id: user.id,
    email: user.email,
    name: displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    ts: Date.now(),
  };

  const token = Buffer.from(JSON.stringify(payload)).toString("base64");

  const response = NextResponse.json({
    success: true,
    message: "Signed in successfully.",
    user: {
      id: user.id,
      email: user.email,
      name: displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    },
  });

  response.cookies.set("auth_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
  });

  return response;
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username: loginUsername, password } = body;

    // 1. Validate inputs
    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required." },
        { status: 400 }
      );
    }
    if (!email && !loginUsername) {
      return NextResponse.json(
        { success: false, message: "Email address or username is required." },
        { status: 400 }
      );
    }

    const isEmailLogin = !!email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isEmailLogin && !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 2. Find the user (WooCommerce customer first, then WP admin user)
    let customer: any = null;
    let wpUser: any = null;
    let loginField = email || loginUsername; // used for wp-login.php

    if (isEmailLogin) {
      customer = await getWcCustomerByEmail(email);
      if (!customer) {
        // Not a WC customer — check WP admin users
        wpUser = await getWpUserByEmail(email);
      }
    } else {
      customer = await getWcCustomerByUsername(loginUsername);
      if (!customer) {
        wpUser = await getWpUserByUsername(loginUsername);
      }
    }

    if (!customer && !wpUser) {
      return NextResponse.json(
        {
          success: false,
          message: isEmailLogin
            ? "No account found with this email address. Please create an account."
            : "No account found with this username.",
        },
        { status: 404 }
      );
    }

    // 3. Build the login targets for password verification
    // For wp-login.php: email works directly. For JWT: need username/slug.
    const wcUsername = customer?.username || wpUser?.slug || undefined;
    console.log("[Login] loginField:", loginField, "| wcUsername:", wcUsername);

    // 4. Verify password
    const passwordOk = await verifyWpPassword(loginField, password, wcUsername);
    console.log("[Login] Password verified:", passwordOk);

    if (!passwordOk) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect password. Please try again, or use Forgot Password to reset it.",
          code: "invalid_password",
        },
        { status: 401 }
      );
    }

    // 5. Issue session
    if (customer) {
      const full = (await getFullWcCustomer(customer.id)) || customer;
      return issueSession({
        id: full.id,
        email: full.email || email || "",
        firstName: full.first_name || "",
        lastName: full.last_name || "",
        username: full.username || "",
      });
    }

    // WP admin / editor user — fetch full details for proper name
    let wpFirstName = "";
    let wpLastName = "";
    let wpDisplayName = wpUser.name || "";

    try {
      const detailRes = await fetch(
        `${WC_BASE}/wp-json/wp/v2/users/${wpUser.id}?context=edit`,
        { headers: { Authorization: WC_AUTH }, cache: "no-store" }
      );
      if (detailRes.ok) {
        const detail = await detailRes.json();
        wpFirstName = detail.first_name || "";
        wpLastName  = detail.last_name  || "";
        wpDisplayName = detail.name || wpUser.name || "";
      }
    } catch { /* use fallbacks */ }

    // If still no name, derive from email
    if (!wpFirstName && !wpLastName) {
      const nameParts = wpDisplayName.includes("@")
        ? (email || "").split("@")[0].split(/[._]/)
        : wpDisplayName.split(" ");
      wpFirstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : "";
      wpLastName  = nameParts.slice(1).map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");
    }

    return issueSession({
      id: wpUser.id,
      email: email || "",
      firstName: wpFirstName,
      lastName: wpLastName,
      username: wpUser.slug || "",
    });

  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
