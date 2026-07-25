import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_3c548d2a91ef1197b0fa08b8eead4f160c363f99";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_d9364182aa414c4a236ecdd73a250cb401c081ca";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

// Real email validation — checks format AND domain has a dot (basic MX-like check)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  // Additional: reject obvious fake domains
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (!domain.includes(".")) return false;
  if (domain.endsWith(".con") || domain.endsWith(".cmo")) return false;

  return true;
}

function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim().slice(0, 2000);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // ── Validation ──────────────────────────────────────────────────
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const cleanName = sanitize(name);
    const cleanMessage = sanitize(message);
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address (e.g. yourname@gmail.com)." },
        { status: 400 }
      );
    }

    if (cleanMessage.length < 10) {
      return NextResponse.json(
        { success: false, message: "Please write a message of at least 10 characters." },
        { status: 400 }
      );
    }

    // ── Send to WordPress via WooCommerce REST API (store as WP post) ──
    // We create a "Private" WordPress post to store the contact message in the backend.
    // This appears in WP Admin → Posts → All Posts (filter by Private / Contact)
    const submittedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const wpPostBody = {
      title: `Contact: ${cleanName} <${cleanEmail}>`,
      content: `<strong>Name:</strong> ${cleanName}\n\n<strong>Email:</strong> ${cleanEmail}\n\n<strong>Message:</strong>\n${cleanMessage}\n\n<em>Submitted: ${submittedAt} IST</em>`,
      status: "private", // Only admins can see it in WP dashboard
      type: "post",
      comment_status: "closed",
      ping_status: "closed",
      meta: {
        contact_name: cleanName,
        contact_email: cleanEmail,
        contact_message: cleanMessage,
        contact_submitted_at: submittedAt,
      },
    };

    const wpRes = await fetch(`${WC_URL}wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        Authorization: WC_AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wpPostBody),
    });

    if (!wpRes.ok) {
      const err = await wpRes.json().catch(() => ({}));
      console.error("[Contact Form → WordPress] Failed:", err);

      // Even if WP storage fails, attempt to log locally and still respond
      // (so user gets a success response — admin should check WP logs)
      return NextResponse.json(
        {
          success: false,
          message: "Message could not be delivered. Please contact us directly at miorah.thereflectionofbeauty@gmail.com",
        },
        { status: 500 }
      );
    }

    const wpPost = await wpRes.json();
    console.log(`[Contact Form] Saved to WordPress post ID: ${wpPost.id}`);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent! We'll get back to you within 24 hours.",
      postId: wpPost.id,
    });
  } catch (error) {
    console.error("[Contact Form Error]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
