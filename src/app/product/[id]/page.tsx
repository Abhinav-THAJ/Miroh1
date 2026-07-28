import ProductPageClient from "@/components/product/ProductPageClient";
import { getProducts } from "@/lib/woocommerce";
import { ALL_PRODUCTS } from "@/lib/data";

export const dynamicParams = true;

export async function generateStaticParams() {
  const allIds = new Set<string>();

  // 1. Seed with local product IDs/slugs as a baseline
  ALL_PRODUCTS.forEach((p) => {
    if (p.id) allIds.add(String(p.id));
    if (p.slug) allIds.add(p.slug);
  });

  // 2. Enrich with live WooCommerce products
  try {
    const wcProducts = await getProducts({ per_page: 100 });
    if (Array.isArray(wcProducts)) {
      wcProducts.forEach((p) => {
        if (p.id) allIds.add(String(p.id));
        if (p.slug) allIds.add(p.slug);
      });
    }
  } catch {
    // Non-fatal: fallback to local IDs
  }

  return Array.from(allIds).map((id) => ({ id }));
}

export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const productId = resolvedParams?.id || "MI0036";

  return <ProductPageClient productId={productId} />;
}
