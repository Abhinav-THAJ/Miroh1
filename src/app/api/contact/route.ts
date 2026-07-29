import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
const WC_KEY = process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";
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

    // ── Send to WooCommerce as a 0-value Order ──
    // Since we only have WooCommerce REST API keys (and not WP Application Passwords),
    // the best way to get this into the store owner's dashboard is to create a $0 Order.
    const wcOrderBody = {
      payment_method: "Contact Form",
      payment_method_title: "Website Contact Form Submission",
      set_paid: true,
      status: "processing",
      billing: {
        first_name: cleanName,
        email: cleanEmail,
      },
      customer_note: `CONTACT FORM MESSAGE:\n\n${cleanMessage}`,
      line_items: [
        {
          name: "Contact Form Inquiry",
          quantity: 1,
          total: "0.00"
        }
      ]
    };

    const wcRes = await fetch(`${WC_URL}wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        Authorization: WC_AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wcOrderBody),
    });

    if (!wcRes.ok) {
      console.error("[Contact Form → WooCommerce] Failed:", await wcRes.text());
      return NextResponse.json(
        { success: false, message: "Could not deliver message to WooCommerce. Please try again." },
        { status: 500 }
      );
    }

    console.log(`[Contact Form Received] From: ${cleanName} <${cleanEmail}> sent to WooCommerce!`);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent! We'll get back to you within 24 hours.",
    });
  } catch (error) {
    console.error("[Contact Form Error]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
