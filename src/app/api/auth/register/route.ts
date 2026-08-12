import { NextRequest, NextResponse } from "next/server";

const WC_BASE = (
  process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com"
).replace(/\/$/, "");

const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

/** Check if email already exists in WP/WC */
async function emailExists(email: string): Promise<boolean> {
  // Check WooCommerce customers
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: WC_AUTH } }
    );
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) return true;
    }
  } catch { /* ignore */ }

  // Check WP users (catches admins not in WC customers)
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
        if (match) return true;
      }
    }
  } catch { /* ignore */ }

  return false;
}

/** Check if username already exists in WP/WC */
async function usernameExists(username: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wc/v3/customers?search=${encodeURIComponent(username)}`,
      { headers: { Authorization: WC_AUTH } }
    );
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        const match = list.find(
          (c: any) => c.username?.toLowerCase() === username.toLowerCase()
        );
        if (match) return true;
      }
    }
  } catch { /* ignore */ }

  // Check WP user slugs
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wp/v2/users?search=${encodeURIComponent(username)}&context=view`,
      { headers: { Authorization: WC_AUTH } }
    );
    if (res.ok) {
      const users = await res.json();
      if (Array.isArray(users)) {
        const match = users.find(
          (u: any) => u.slug?.toLowerCase() === username.toLowerCase()
        );
        if (match) return true;
      }
    }
  } catch { /* ignore */ }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, firstName, lastName, username, phone } = body;

    // ── 1. Required field validation ──────────────────────────────────────────
    const missing: string[] = [];
    if (!firstName?.trim()) missing.push("First name");
    if (!lastName?.trim()) missing.push("Last name");
    if (!username?.trim()) missing.push("Username");
    if (!email?.trim()) missing.push("Email address");
    if (!password) missing.push("Password");
    if (!confirmPassword) missing.push("Confirm password");

    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, message: `Please fill in: ${missing.join(", ")}.` },
        { status: 400 }
      );
    }

    // ── 2. Email format ───────────────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // ── 3. Username format ────────────────────────────────────────────────────
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
      return NextResponse.json(
        {
          success: false,
          message: "Username must be 3–30 characters and can only contain letters, numbers, underscores, dots, or hyphens.",
        },
        { status: 400 }
      );
    }

    // ── 4. Password strength ──────────────────────────────────────────────────
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // ── 5. Password confirmation ──────────────────────────────────────────────
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match. Please check and try again." },
        { status: 400 }
      );
    }

    // ── 6. Duplicate email check ──────────────────────────────────────────────
    if (await emailExists(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "This email address is already registered. Please log in or use another email.",
          code: "email_exists",
        },
        { status: 409 }
      );
    }

    // ── 7. Duplicate username check ───────────────────────────────────────────
    if (await usernameExists(username)) {
      return NextResponse.json(
        {
          success: false,
          message: "This username is already taken. Please choose another username.",
          code: "username_exists",
        },
        { status: 409 }
      );
    }

    // ── 8. Create WooCommerce customer (creates WP user + WC customer atomically) ──
    const createRes = await fetch(`${WC_BASE}/wp-json/wc/v3/customers`, {
      method: "POST",
      headers: {
        Authorization: WC_AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        billing: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone?.trim() || "",
        },
        shipping: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      }),
    });

    const created = await createRes.json();

    if (!createRes.ok) {
      // Surface specific WC/WP error codes
      const code: string = created.code || "";
      if (
        code.includes("email") ||
        code === "registration-error-email-exists" ||
        code === "existing-user-email"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "This email address is already registered. Please log in or use another email.",
            code: "email_exists",
          },
          { status: 409 }
        );
      }
      if (
        code.includes("login") ||
        code === "existing-user-login"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "This username is already taken. Please choose another username.",
            code: "username_exists",
          },
          { status: 409 }
        );
      }
      console.error("[Register WC Error]", created);
      return NextResponse.json(
        { success: false, message: created.message || "Registration failed. Please try again." },
        { status: createRes.status }
      );
    }

    // ── 9. Issue session cookie (auto-login after registration) ──────────────
    const displayName = `${created.first_name} ${created.last_name}`.trim() || created.username;

    const sessionPayload = {
      id: created.id,
      email: created.email,
      name: displayName,
      firstName: created.first_name,
      lastName: created.last_name,
      username: created.username,
      ts: Date.now(),
    };

    const token = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully! Welcome to Miorah.",
      user: {
        id: created.id,
        email: created.email,
        name: displayName,
        firstName: created.first_name,
        lastName: created.last_name,
        username: created.username,
      },
    });

    response.cookies.set("auth_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

/** GET: Real-time duplicate checking endpoint */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkEmail = searchParams.get("email");
  const checkUsername = searchParams.get("username");

  if (checkEmail) {
    const exists = await emailExists(checkEmail);
    return NextResponse.json({ exists, field: "email" });
  }

  if (checkUsername) {
    const exists = await usernameExists(checkUsername);
    return NextResponse.json({ exists, field: "username" });
  }

  return NextResponse.json({ error: "Specify email or username to check." }, { status: 400 });
}
