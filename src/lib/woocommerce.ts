import { getProductById as getMockProductById, ProductDetail } from "./data";

const WC_URL = (process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com").replace(/\/$/, "");
const WC_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY || "ck_63c6dd09f762e94a24cdf69baa403f302047e645";
const WC_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET || "cs_1708408f09e82b542370d7efece47168f0bf3ba2";

// Browser-compatible base64 encoding (btoa)
const AUTH_HEADER = "Basic " + btoa(`${WC_KEY}:${WC_SECRET}`);

// How often pages auto-refresh data from WordPress (in seconds)
// 60 = within 1 minute of adding/editing a product in WP, the site reflects it
export const REVALIDATE_SECONDS = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  sku?: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: { id: number; src: string; alt: string }[];
  categories: { id: number; name: string; slug: string }[];
  description: string;
  short_description: string;
  slug: string;
  permalink: string;
  stock_status: string;
  manage_stock: boolean;
  stock_quantity: number | null;
}

// ─── Core fetch helper with ISR cache ────────────────────────────────────────

async function wcFetch<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T | null> {
  const url = new URL(`${WC_URL}/wp-json/wc/v3/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: AUTH_HEADER },
      // ISR: Next.js will cache this response and revalidate after REVALIDATE_SECONDS
      // When a new product is added in WordPress, within 60s it appears on the site
      next: { revalidate: REVALIDATE_SECONDS, tags: ["woocommerce"] },
    });

    if (!res.ok) {
      console.error(`[WooCommerce] ${endpoint} → HTTP ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error(`[WooCommerce] Fetch error for "${endpoint}":`, err);
    return null;
  }
}

// ─── Public API functions ─────────────────────────────────────────────────────

export async function getProducts(params: Record<string, string | number | boolean> = {}): Promise<Product[]> {
  const data = await wcFetch<Product[]>("products", { per_page: 100, status: "publish", ...params });
  return data ?? [];
}

export async function getProductById(id: string | number): Promise<ProductDetail> {
  const isNum = !isNaN(Number(id));
  if (isNum) {
    const data = await wcFetch<Product>(`products/${id}`);
    if (data?.id) return transformWcProduct(data);
  } else {
    const data = await wcFetch<Product[]>(`products`, { slug: String(id) });
    if (data && data.length > 0) return transformWcProduct(data[0]);
  }
  // Fallback to local mock data if WC fails
  return getMockProductById(id) || getMockProductById("MI0036")!;
}

export async function getCategories(): Promise<any[]> {
  const data = await wcFetch<any[]>("products/categories", { hide_empty: true, per_page: 100 });
  if (!data) return [];
  return data.filter(
    (c: any) => c.slug !== "uncategorized" && c.name.toLowerCase() !== "uncategorized" && c.count > 0
  );
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  // First resolve slug to ID
  const categories = await getCategories();
  const cat = categories.find((c: any) => c.slug === categorySlug);
  if (!cat) return [];
  const data = await wcFetch<Product[]>("products", {
    category: cat.id,
    per_page: 100,
    status: "publish",
  });
  return data ?? [];
}

// ─── Transform WC product → internal ProductDetail ───────────────────────────

function transformWcProduct(wc: Product): ProductDetail {
  const images =
    wc.images && wc.images.length > 0
      ? wc.images.map((img) => img.src)
      : ["/images/products/MI0036/MI0036-1.png"];

  const sellingPrice = wc.sale_price || wc.price;
  const mrp = wc.regular_price || sellingPrice;
  const fmt = (n: string) => (n ? `₹${parseFloat(n).toLocaleString("en-IN")}` : undefined);

  const inStock =
    wc.stock_status === "instock" ||
    (wc.manage_stock && (wc.stock_quantity ?? 0) > 0) ||
    !wc.manage_stock;

  return {
    id: wc.id,
    slug: wc.slug || String(wc.id),
    name: wc.name,
    sku: wc.sku || "",
    price: fmt(sellingPrice) || "₹850",
    originalPrice: mrp ? fmt(mrp) : undefined,
    category: wc.categories?.length > 0 ? wc.categories[0].name : "Jewellery",
    rating: 4.9,
    reviewCount: 34,
    shortDescription: wc.short_description
      ? wc.short_description.replace(/<[^>]*>?/gm, "")
      : "Handcrafted luxury piece designed for timeless style.",
    description: wc.description
      ? wc.description.replace(/<[^>]*>?/gm, "")
      : "Exquisite artisan jewelry crafted for the modern woman.",
    images,
    specs: {},
    features: [],
    inStock,
  };
}
