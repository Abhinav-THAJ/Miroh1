import { NextRequest, NextResponse } from "next/server";

const WC_BASE = (
  process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com"
).replace(/\/$/, "");

const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * verifyWpPassword
 * Strategy 1 (PRIMARY): Custom WP REST endpoint /wp-json/miorah/v1/verify
 *   - Uses WordPress native wp_check_password() — 100% reliable, never blocked
 * Strategy 2: JWT Authentication plugin → /wp-json/jwt-auth/v1/token
 * Strategy 3: wp-login.php form POST → final fallback
 */
async function verifyWpPassword(loginField: string, password: string, username?: string): Promise<boolean> {
  // ── Strategy 1: Custom WordPress REST endpoint (most reliable) ────────────
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
      // Custom endpoint explicitly confirmed wrong password — no need to try more
      console.log("[Auth] Strategy 1 returned 401 (wrong password)");
      return false;
    }
    console.log("[Auth] Strategy 1 status:", res.status, "- falling through");
  } catch (e) {
    console.error("[Auth] Strategy 1 error:", e);
  }

  // ── Strategy 2: JWT Authentication Plugin ────────────────────────────────
  // JWT only accepts username (not email). We try loginField as-is first, then username param if provided.
  const jwtTargets = Array.from(new Set([loginField, username].filter(Boolean)));
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
        console.log("[Auth] Strategy 2 (JWT) succeeded for:", jwtUser);
        return true;
      }
      // ⚠️ Only short-circuit on explicit wrong-password. For invalid_email /
      // invalid_username the user may still pass via Strategy 3.
      if (data.code?.includes("incorrect_password")) {
        console.log("[Auth] Strategy 2 (JWT) confirmed wrong password");
        return false;
      }
      console.log("[Auth] Strategy 2 (JWT) status:", res.status, data.code, "- falling through");
    } catch (e) {
      console.error("[Auth] Strategy 2 (JWT) error:", e);
    }
  }

  // ── Strategy 3: wp-login.php form POST ───────────────────────────────────
  // Works for both email and username. WordPress:
  //   Correct creds  → 302 Location: /wp-admin/ or homepage (NOT wp-login.php)
  //   Wrong creds    → 200 (renders the error page, no redirect)
  //   Blocked by CDN → anything non-302 or 302 back to wp-login.php
  try {
    const form = new URLSearchParams({
      log: loginField,
      pwd: password,
      "wp-submit": "Log In",
      redirect_to: "/wp-admin/",
      testcookie: "1",
    });
    const res = await fetch(`${WC_BASE}/wp-login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": "wordpress_test_cookie=WP%20Cookie%20check",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Origin": WC_BASE,
        "Referer": `${WC_BASE}/wp-login.php`,
      },
      body: form.toString(),
      redirect: "manual",
    });
    const location = res.headers.get("location") || "";
    const isSuccess = res.status === 302 && !location.includes("wp-login.php");
    console.log("[Auth] Strategy 3 (wp-login.php):", res.status, "location:", location, "success:", isSuccess);
    return isSuccess;
  } catch (e) {
    console.error("[Auth] Strategy 3 (wp-login.php) error:", e);
    return false;
  }
}

/** Look up a WooCommerce customer by email */
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

/** Look up a WooCommerce customer by username */
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

/** Get full WooCommerce customer data by ID */
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

/** Issue the HttpOnly session cookie and return the user object */
function issueSession(user: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}) {
  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.username || user.email.split("@")[0];

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username: loginUsername, password } = body;

    // ── 1. Validate inputs ──────────────────────────────────────────────────
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

    // ── 2. Resolve WooCommerce customer from email OR username ──────────────
    let customer: any = null;
    let loginField = ""; // what to pass to wp-login.php

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: "Please enter a valid email address." },
          { status: 400 }
        );
      }
      customer = await getWcCustomerByEmail(email);
      loginField = email; // WordPress accepts email as login field since v4.5
      console.log("[Login] Customer by email:", customer ? `found id=${customer.id}` : "not found");
    } else {
      customer = await getWcCustomerByUsername(loginUsername);
      loginField = loginUsername;
      console.log("[Login] Customer by username:", customer ? `found id=${customer.id}` : "not found");
    }

    // ── 3. If not found in WC customers, check WP users (covers admins) ────
    // Admins and editors are not returned by /wc/v3/customers
    let isWpOnlyUser = false;
    let wpUser: any = null;

    if (!customer) {
      const searchTerm = email || loginUsername;
      try {
        const wpRes = await fetch(
          `${WC_BASE}/wp-json/wp/v2/users?search=${encodeURIComponent(searchTerm)}&context=view`,
          { headers: { Authorization: WC_AUTH }, cache: "no-store" }
        );
        if (wpRes.ok) {
          const users = await wpRes.json();
          if (Array.isArray(users) && users.length > 0) {
            if (email) {
              // Match by name or slug derived from email prefix
              wpUser = users.find(
                (u: any) =>
                  u.name?.toLowerCase() === email.toLowerCase() ||
                  u.slug?.toLowerCase() ===
                    email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
              );
              // If still not found but only 1 result, take it
              if (!wpUser && users.length === 1) wpUser = users[0];
            } else {
              wpUser =
                users.find(
                  (u: any) => u.slug?.toLowerCase() === loginUsername?.toLowerCase()
                ) || users[0];
            }
          }
        }
      } catch { /* fall through */ }

      if (!wpUser) {
        return NextResponse.json(
          {
            success: false,
            message: email
              ? "No account found with this email address. Please create an account."
              : "No account found with this username.",
          },
          { status: 404 }
        );
      }

      isWpOnlyUser = true;
      loginField = email || wpUser.slug;
    }

    // ── 4. Verify password against WordPress ───────────────────────────────
    // Pass the WC/WP username as a hint so JWT can try it even when loginField is an email.
    const wcUsername = customer?.username || wpUser?.slug || undefined;
    console.log("[Login] Verifying password for loginField:", loginField, "| wcUsername hint:", wcUsername);
    let passwordOk = await verifyWpPassword(loginField, password, wcUsername);
    console.log("[Login] Verify result:", passwordOk);

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

    // ── 5. Password verified — fetch full profile & issue session ──────────
    if (isWpOnlyUser) {
      // WordPress admin / editor user (not a WC customer)
      return issueSession({
        id: wpUser.id,
        email: email || "",
        firstName: wpUser.name?.split(" ")[0] || "",
        lastName: wpUser.name?.split(" ").slice(1).join(" ") || "",
        username: wpUser.slug || "",
      });
    }

    // Fetch the full WC customer record (includes phone, billing, shipping)
    const full = (await getFullWcCustomer(customer.id)) || customer;

    return issueSession({
      id: full.id,
      email: full.email || email || "",
      firstName: full.first_name || "",
      lastName: full.last_name || "",
      username: full.username || "",
    });
  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
