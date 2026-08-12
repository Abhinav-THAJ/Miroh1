import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, contact, shipping, payment } = body;

    const WC_URL = (process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com").replace(/\/$/, "");
    const WC_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
    const WC_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";

    const AUTH_HEADER = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

    const parseNum = (p: string) => Number(p?.replace(/[^0-9.]/g, "") || 0);

    // Format line items for WooCommerce
    const line_items = items.map((item: any) => {
      const parsedId = parseInt(String(item.id));
      // If it's a valid numeric ID (likely from WP/WC), use it. Otherwise, treat as custom item.
      const isWCProduct = !isNaN(parsedId) && parsedId > 0 && String(item.id) === String(parsedId);
      const priceVal = parseNum(item.price);
      
      return {
        product_id: isWCProduct ? parsedId : undefined,
        name: item.name,
        quantity: item.quantity,
        total: String(priceVal * item.quantity), // pass price explicitly so it doesn't default to 0
      };
    });

    // Construct the WooCommerce Order payload
    const isRazorpay = payment === "ONLINE" || payment === "RAZORPAY";
    
    const orderData: any = {
      payment_method: isRazorpay ? "razorpay" : "cod",
      payment_method_title: isRazorpay ? "Razorpay" : "Cash on Delivery",
      set_paid: isRazorpay && body.razorpay_payment_id ? true : false,
      billing: {
        first_name: shipping.fullName,
        last_name: "",
        address_1: shipping.address,
        address_2: "",
        city: shipping.city,
        state: shipping.state,
        postcode: shipping.zip,
        country: shipping.country,
        email: contact.email,
        phone: contact.phone,
      },
      shipping: {
        first_name: shipping.fullName,
        last_name: "",
        address_1: shipping.address,
        address_2: "",
        city: shipping.city,
        state: shipping.state,
        postcode: shipping.zip,
        country: shipping.country,
      },
      line_items: line_items,
    };

    if (isRazorpay && body.razorpay_payment_id) {
      orderData.transaction_id = body.razorpay_payment_id;
    }

    const res = await fetch(`${WC_URL}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("[Checkout API] WC Error:", errorData);
      return NextResponse.json(
        { error: "Failed to create order in WooCommerce", details: errorData },
        { status: res.status }
      );
    }

    const wcOrder = await res.json();
    
    return NextResponse.json({ success: true, orderId: wcOrder.id });
  } catch (error) {
    console.error("[Checkout API] Internal Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
