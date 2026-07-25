"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollectionsClient from "@/components/collections/CollectionsClient";
import { getCategories, getProducts } from "@/lib/woocommerce";
import { ALL_PRODUCTS, MOCK_CATEGORIES, Category } from "@/lib/data";

export default function NewArrivalsPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [products, setProducts] = useState<any[]>(ALL_PRODUCTS.filter((p) => p.isNewArrival));
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    Promise.all([
      getCategories(),
      getProducts({ per_page: 50 })
    ]).then(([wcCategories, wcProducts]) => {
      if (wcCategories && wcCategories.length > 0) {
        setCategories([
          { id: "all", name: "All", slug: "all", count: ALL_PRODUCTS.filter(p => p.isNewArrival).length },
          ...wcCategories
            .filter((c: any) => c.slug !== "uncategorized" && c.name.toLowerCase() !== "uncategorized" && c.count > 0)
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              count: c.count,
            })),
        ]);
      }

      if (wcProducts && wcProducts.length > 0) {
        const fmt = (n: string) => (n ? `₹${parseFloat(n).toLocaleString("en-IN")}` : undefined);
        const formattedProducts = wcProducts.map((p: any) => {
          const sellingPrice = p.sale_price || p.price;
          const mrp = p.regular_price || sellingPrice;
          return {
            id: p.id,
            slug: p.slug || String(p.id),
            name: p.name,
            price: fmt(sellingPrice) || "₹850",
            originalPrice: mrp ? fmt(mrp) : undefined,
            category: p.categories && p.categories.length > 0 ? p.categories[0].name : "Jewellery",
            isNewArrival: true,
            rating: 5.0,
            reviewCount: 18,
            shortDescription: p.short_description ? p.short_description.replace(/<[^>]*>?/gm, "") : "New Drop",
            description: p.description ? p.description.replace(/<[^>]*>?/gm, "") : "Latest arrival",
            images: p.images && p.images.length > 0 ? p.images.map((img: any) => img.src) : ["/images/products/MI0036/MI0036-1.png"],
            specs: {
              material: "925 Sterling Silver",
              plating: "High-Grade Finish",
              weight: "3.5 grams",
              waterResistant: "Waterproof",
              antiTarnish: "100% Anti-Tarnish",
              hypoallergenic: "Nickel-Free",
            },
            features: ["Latest season drop", "Waterproof & tarnish-proof"],
            inStock: true,
          };
        });
        setProducts(formattedProducts);
      }
    }).catch(() => {
      // Keep fallbacks
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
      <Navbar />

      <main className="flex-1 w-full pt-28 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-6xl font-serif text-warm-ivory mb-6">
              New <span className="italic text-champagne-gold font-light">Arrivals</span>
            </h1>
            <p className="text-muted-text font-light text-base sm:text-lg leading-relaxed">
              Step into the new season with our latest releases. Handcrafted statement pieces designed to captivate.
            </p>
          </div>

          <CollectionsClient initialProducts={products} categories={categories} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
