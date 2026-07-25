"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import EditorialShowcase from "@/components/home/EditorialShowcase";
import BestSellers from "@/components/home/BestSellers";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import OnamCollection from "@/components/home/OnamCollection";
import Footer from "@/components/layout/Footer";
import { getProducts } from "@/lib/woocommerce";
import { ALL_PRODUCTS, MOCK_BEST_SELLERS, MOCK_NEW_ARRIVALS } from "@/lib/data";

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>(MOCK_NEW_ARRIVALS);
  const [bestSellers, setBestSellers] = useState<any[]>(MOCK_BEST_SELLERS);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Fetch live products client-side so it works dynamically in static hosting
    getProducts().then((wcProducts) => {
      if (wcProducts && wcProducts.length > 0) {
        const fmt = (n: string) => (n ? `₹${parseFloat(n).toLocaleString("en-IN")}` : undefined);

        const formattedNewArrivals = wcProducts.slice(0, 4).map((p, idx) => {
          const fallbackImg = ALL_PRODUCTS[idx % ALL_PRODUCTS.length]?.images[0] || "/images/products/MI0036/MI0036-1.png";
          const sellingPrice = p.sale_price || p.price;
          const mrp = p.regular_price || sellingPrice;
          return {
            id: p.id,
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
            name: p.name,
            price: fmt(sellingPrice) || "₹850",
            originalPrice: mrp ? fmt(mrp) : undefined,
            category: p.categories?.[0]?.name || fallbackObj.category,
            image1: img1,
            image2: img2,
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
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
      <Navbar />

      <main className="flex-1 w-full">
        <Hero />
        <NewArrivals products={newArrivals} />
        <BestSellers products={bestSellers} />
        <EditorialShowcase />
        <OnamCollection />
        <FeaturedCollections />
      </main>

      <Footer />
    </div>
  );
}
