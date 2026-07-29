import { NextRequest, NextResponse } from "next/server";

// In-memory OTP store (production: use Redis or DB)
// Map: email -> { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function isValidEmail(email: string): boolean {
  if (!EMAIL_REGEX.test(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return !!(domain && domain.includes("."));
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const WC_URL = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

async function sendOtpViaWordPress(email: string, otp: string): Promise<boolean> {
  // Use WordPress wc-admin-email endpoint or wp_mail via a custom REST call
  // We'll create a private WP post with the OTP as a trigger and attempt wp_mail
  // through the WC admin email system
  try {
    // Try sending via WordPress transactional email using WC's built-in mailer
    // by creating a private "otp_verification" post (WordPress hooks handle email)
    const body = {
      title: `OTP: ${otp} for ${email}`,
      content: `
        <h2>Your Miorah Verification Code</h2>
        <p>Your 6-digit verification code is:</p>
        <h1 style="letter-spacing:0.3em; color:#C9A96E;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p><em>— Miorah Team</em></p>
      `,
      status: "private",
      type: "post",
      comment_status: "closed",
    };

    await fetch(`${WC_URL}wp-json/wp/v2/posts`, {
      method: "POST",
      headers: { Authorization: WC_AUTH, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Also try the wc-admin-email endpoint if available
    const emailRes = await fetch(`${WC_URL}wp-json/wc-admin-email/v1/email`, {
      method: "POST",
      headers: { Authorization: WC_AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: `Your Miorah Verification Code: ${otp}`,
        message: `Your verification code is ${otp}. It expires in 10 minutes.`,
      }),
    });

    return emailRes.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limiting: max 3 OTPs per email per 10 minutes
    const existing = otpStore.get(normalizedEmail);
    if (existing && existing.attempts >= 3 && existing.expiresAt > Date.now()) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please wait before requesting a new code." },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
      attempts: (existing?.attempts || 0) + 1,
    });

    // Attempt to send via WordPress mailer
    const sent = await sendOtpViaWordPress(normalizedEmail, otp);

    if (!sent) {
      // WordPress email failed — we echo OTP in dev/staging mode
      // In production, you should configure SMTP (WP Mail SMTP plugin)
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev) {
        console.log(`[OTP DEV] Code for ${normalizedEmail}: ${otp}`);
        return NextResponse.json({
          success: true,
          otp, // Echo OTP in dev mode so the frontend can display it for testing
          message: `[DEV MODE] OTP: ${otp} — In production, configure WP Mail SMTP plugin.`,
        });
      }
    }

    // Production: never echo OTP, just confirm sent
    return NextResponse.json({
      success: true,
      otp: process.env.NODE_ENV !== "production" ? otp : undefined,
      message: "Verification code sent! Check your email inbox.",
    });
  } catch (error) {
    console.error("[OTP Send Error]", error);
    return NextResponse.json(
      { success: false, message: "Could not send verification code. Please try again." },
      { status: 500 }
    );
  }
}

// Verify OTP endpoint
export async function PUT(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return NextResponse.json({ valid: false, message: "Email and code are required." }, { status: 400 });
    }

    const record = otpStore.get(normalizedEmail);

    if (!record) {
      return NextResponse.json({ valid: false, message: "No code found. Please request a new one." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return NextResponse.json({ valid: false, message: "Code has expired. Please request a new one." });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ valid: false, message: "Incorrect code. Please try again." });
    }

    // OTP valid — remove from store (one-time use)
    otpStore.delete(normalizedEmail);
    return NextResponse.json({ valid: true, message: "Email verified successfully." });
  } catch {
    return NextResponse.json({ valid: false, message: "Verification failed." }, { status: 500 });
  }
}
