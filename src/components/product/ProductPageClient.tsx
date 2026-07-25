"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductDetailsTabs from "@/components/product/ProductDetailsTabs";
import CompleteTheLook from "@/components/product/CompleteTheLook";
import ProductReviews from "@/components/product/ProductReviews";
import BestSellers from "@/components/home/BestSellers";
import { getProductById, getProducts } from "@/lib/woocommerce";
import { ALL_PRODUCTS, MOCK_BEST_SELLERS, ProductDetail } from "@/lib/data";
import Link from "next/link";
import { ChevronRight, Home, RefreshCw } from "lucide-react";

export default function ProductPageClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>(MOCK_BEST_SELLERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      getProductById(productId),
      getProducts({ per_page: 8 })
    ]).then(([wcProduct, wcProducts]) => {
      if (wcProduct) {
        setProduct(wcProduct);
      }

      if (wcProducts && wcProducts.length > 0) {
        const fmt = (n: string) => (n ? `₹${parseFloat(n).toLocaleString("en-IN")}` : undefined);
        const formatted = wcProducts.slice(0, 8).map((p, idx) => {
          const fallback = ALL_PRODUCTS[idx % ALL_PRODUCTS.length] || ALL_PRODUCTS[0];
          const img1 = p.images?.[0]?.src || fallback.images[0];
          const img2 = p.images?.[1]?.src || fallback.images[1] || img1;
          const price = p.sale_price || p.price;
          return {
            id: p.id,
            name: p.name,
            price: fmt(price) || "₹850",
            originalPrice: p.regular_price ? fmt(p.regular_price) : undefined,
            category: p.categories?.[0]?.name || fallback.category,
            image1: img1,
            image2: img2,
          };
        });
        setRelatedProducts(formatted);
      }
    }).catch(() => {
      // Fallback on error
      const mockProd = ALL_PRODUCTS.find((p) => String(p.id) === productId || p.slug === productId) || ALL_PRODUCTS[0];
      setProduct(mockProd);
    }).finally(() => {
      setLoading(false);
    });
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-champagne-gold animate-spin" />
          </div>
          <p className="text-sm text-muted-text font-light">Loading product details…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
      <Navbar />

      <main className="flex-1 w-full pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6">

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text mb-8 overflow-x-auto py-1">
            <Link href="/" className="hover:text-champagne-gold transition-colors flex items-center gap-1">
              <Home size={12} /> Home
            </Link>
            <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
            <Link href="/collections" className="hover:text-champagne-gold transition-colors flex-shrink-0">
              Collections
            </Link>
            <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
            <span className="text-champagne-gold font-medium truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          {/* Main Product Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
            <div className="lg:col-span-6 xl:col-span-7">
              <ProductGallery
                images={product.images}
                productName={product.name}
                isBestSeller={product.isBestSeller}
                isNewArrival={product.isNewArrival}
              />
            </div>
            <div className="lg:col-span-6 xl:col-span-5">
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Deep-dive Tabs */}
          <ProductDetailsTabs product={product} />

          {/* Complete the Look */}
          <CompleteTheLook currentProduct={product} />

          {/* Reviews */}
          <ProductReviews product={product} />

          {/* Related Products */}
          <div className="mt-20 border-t border-white/10 pt-16">
            <h2 className="text-3xl font-serif text-warm-ivory mb-2">You May Also Like</h2>
            <p className="text-sm text-muted-text font-light mb-8">
              Explore complementary handcrafted luxury pieces.
            </p>
            <BestSellers products={relatedProducts} />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
