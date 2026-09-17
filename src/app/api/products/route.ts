import { NextRequest, NextResponse } from "next/server";

const WC_BASE = (
  process.env.NEXT_PUBLIC_WC_URL || "https://mediumaquamarine-seahorse-783985.hostingersite.com"
).replace(/\/$/, "");

const WC_KEY = process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";
const WC_AUTH = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;

/**
 * GET /api/products
 * Query params are forwarded to WooCommerce REST API.
 * Examples:
 *   /api/products                     → all published products (per_page=100)
 *   /api/products?id=123              → single product by ID
 *   /api/products?slug=my-product     → single product by slug
 *   /api/products?per_page=50         → paginated list
 *   /api/products?category=12         → by category ID
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Single product by ID
  const id = searchParams.get("id");
  if (id) {
    try {
      const res = await fetch(`${WC_BASE}/wp-json/wc/v3/products/${id}`, {
        headers: { Authorization: WC_AUTH },
        cache: "no-store",
      });
      if (!res.ok) {
        return NextResponse.json({ error: "Product not found" }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json(data);
    } catch (err) {
      console.error("[Products API] Single product error:", err);
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
  }

  // Single product by slug
  const slug = searchParams.get("slug");
  if (slug) {
    try {
      const res = await fetch(
        `${WC_BASE}/wp-json/wc/v3/products?slug=${encodeURIComponent(slug)}&status=publish`,
        { headers: { Authorization: WC_AUTH }, cache: "no-store" }
      );
      if (!res.ok) return NextResponse.json([], { status: 200 });
      const data = await res.json();
      return NextResponse.json(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error("[Products API] Slug lookup error:", err);
      return NextResponse.json(null, { status: 200 });
    }
  }

  // Product list — forward allowed query params
  const params = new URLSearchParams();
  params.set("status", "publish");
  params.set("per_page", searchParams.get("per_page") || "100");

  const allowed = ["category", "tag", "page", "orderby", "order", "search", "featured"];
  allowed.forEach((key) => {
    const val = searchParams.get(key);
    if (val) params.set(key, val);
  });

  try {
    const res = await fetch(`${WC_BASE}/wp-json/wc/v3/products?${params.toString()}`, {
      headers: { Authorization: WC_AUTH },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[Products API] List error: HTTP ${res.status}`);
      return NextResponse.json([], { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("[Products API] List fetch error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
