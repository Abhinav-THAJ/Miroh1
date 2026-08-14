"use client";

import { useEffect, useState, useRef } from "react";
import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import NewArrivals from "@/components/home/NewArrivals";
import { getProducts } from "@/lib/woocommerce";
import { ALL_PRODUCTS, MOCK_BEST_SELLERS, MOCK_NEW_ARRIVALS } from "@/lib/data";

/**
 * Client component that handles WooCommerce product fetching.
 * Kept separate from the server page so WordPress ACF data (Editorial, Onam)
 * is always fetched server-side and never stale.
 */
export default function HomeProductsClient({ heroAcfData }: { heroAcfData?: any }) {
  const [newArrivals, setNewArrivals] = useState<any[]>(MOCK_NEW_ARRIVALS);
  const [bestSellers, setBestSellers] = useState<any[]>(MOCK_BEST_SELLERS);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    getProducts().then((wcProducts) => {
      if (wcProducts && wcProducts.length > 0) {
        const fmt = (n: string) => (n ? `₹${parseFloat(n).toLocaleString("en-IN")}` : undefined);

        const formattedNewArrivals = wcProducts.slice(0, 4).map((p, idx) => {
          const fallbackImg =
            ALL_PRODUCTS[idx % ALL_PRODUCTS.length]?.images[0] ||
            "/images/products/MI0036/MI0036-1.png";
          const sellingPrice = p.sale_price || p.price;
          const mrp = p.regular_price || sellingPrice;
          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: fmt(sellingPrice) || "₹850",
            originalPrice: mrp ? fmt(mrp) : undefined,
            image1: p.images?.[0]?.src || fallbackImg,
          };
        });

        const formattedBestSellers = wcProducts.slice(0, 8).map((p, idx) => {
          const fallbackObj = ALL_PRODUCTS[idx % ALL_PRODUCTS.length] || ALL_PRODUCTS[0];
          const img1 = p.images?.[0]?.src || fallbackObj.images[0];
          const img2 = p.images?.[1]?.src || fallbackObj.images[1] || img1;
          const sellingPrice = p.sale_price || p.price;
          const mrp = p.regular_price || sellingPrice;
          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: fmt(sellingPrice) || "₹850",
            originalPrice: mrp ? fmt(mrp) : undefined,
            category: p.categories?.[0]?.name || fallbackObj.category,
            image1: img1,
            image2: img2,
            shortDescription:
              p.short_description?.replace(/<[^>]*>?/gm, "") ||
              "Explore our exclusive handcrafted collection.",
          };
        });

        setNewArrivals(formattedNewArrivals);
        setBestSellers(formattedBestSellers);
      }
    }).catch(() => {
      // Non-fatal: keep mock fallbacks
    });
  }, []);

  return (
    <>
      <Hero acfData={heroAcfData} bestSellers={bestSellers} />
      <NewArrivals products={newArrivals} />
      <BestSellers products={bestSellers} />
    </>
  );
}
