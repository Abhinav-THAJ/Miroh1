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
async function verifyWpPassword(loginField: string, password: string): Promise<boolean> {
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
      // Explicit 401 = wrong password — don't fall through to other strategies
      if (res.status === 401) {
        console.log("[Auth] Strategy 1 returned 401 (wrong password) for:", loginField);
        return false;
      }
    }
    console.log("[Auth] Strategy 1 failed with status:", res.status, "- falling through");
  } catch (e) {
    console.error("[Auth] Strategy 1 error:", e);
  }

  // ── Strategy 2: JWT Authentication Plugin ────────────────────────────────
  try {
    const res = await fetch(`${WC_BASE}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginField, password }),
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data.token) {
      console.log("[Auth] Strategy 2 (JWT) succeeded for:", loginField);
      return true;
    }
    // JWT returns 403 for wrong password — don't fall through
    if (res.status === 403 || (data.code && data.code.includes("incorrect_password"))) {
      console.log("[Auth] Strategy 2 (JWT) returned wrong password for:", loginField);
      return false;
    }
    console.log("[Auth] Strategy 2 (JWT) failed with status:", res.status, data.code, "- falling through");
  } catch (e) {
    console.error("[Auth] Strategy 2 (JWT) error:", e);
  }

  // ── Strategy 3: wp-login.php form POST ───────────────────────────────────
  // WordPress returns 302 on BOTH success and failure:
  //   Success → redirects to wp-admin or the redirect_to URL
  //   Failure → redirects back to wp-login.php?error=...  
  // We distinguish by checking the Location header.
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
    // Success: redirects to wp-admin or a non-login URL
    // Failure: redirects back to wp-login.php (with ?error or ?loggedout)
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
    // Primary: use email/username (whatever the user typed)
    console.log("[Login] Verifying password for loginField:", loginField);
    let passwordOk = await verifyWpPassword(loginField, password);
    console.log("[Login] Primary verify result:", passwordOk);

    // Fallback: try with username if email was used (some WP setups only accept username)
    if (!passwordOk && customer?.username && loginField !== customer.username) {
      console.log("[Login] Trying fallback with username:", customer.username);
      passwordOk = await verifyWpPassword(customer.username, password);
      console.log("[Login] Fallback (username) verify result:", passwordOk);
    }

    // Fallback: try WP user slug for admin users
    if (!passwordOk && isWpOnlyUser && wpUser?.slug && loginField !== wpUser.slug) {
      console.log("[Login] Trying WP slug fallback:", wpUser.slug);
      passwordOk = await verifyWpPassword(wpUser.slug, password);
      console.log("[Login] WP slug fallback verify result:", passwordOk);
    }

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
