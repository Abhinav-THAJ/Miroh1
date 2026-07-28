"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollectionsClient from "@/components/collections/CollectionsClient";
import { getCategories, getProducts } from "@/lib/woocommerce";
import { ALL_PRODUCTS, MOCK_CATEGORIES, Category } from "@/lib/data";

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [products, setProducts] = useState<any[]>(ALL_PRODUCTS);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Fetch dynamic categories and products from WooCommerce client-side
    Promise.all([
      getCategories(),
      getProducts({ per_page: 50 })
    ]).then(([wcCategories, wcProducts]) => {
      if (wcCategories && wcCategories.length > 0) {
        const formattedWcCats = wcCategories
          .filter((c: any) => c.slug !== "uncategorized" && c.name.toLowerCase() !== "uncategorized" && c.count > 0)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            count: c.count,
          }));
        setCategories([
          { id: "all", name: "All", slug: "all", count: ALL_PRODUCTS.length },
          ...formattedWcCats,
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
            isBestSeller: true,
            rating: 4.9,
            reviewCount: 28,
            shortDescription: p.short_description ? p.short_description.replace(/<[^>]*>?/gm, "") : "Luxury jewelry piece",
            description: p.description ? p.description.replace(/<[^>]*>?/gm, "") : "Handcrafted luxury jewelry",
            images: p.images && p.images.length > 0 ? p.images.map((img: any) => img.src) : ["/images/products/MI0036/MI0036-1.png"],
            specs: {
              material: "925 Sterling Silver / High-grade Brass",
              plating: "High-Grade Finish",
              stone: "Grade AAA Cubic Zirconia",
              weight: "4.5 grams",
              waterResistant: "Water Resistant",
              antiTarnish: "100% Anti-Tarnish",
              hypoallergenic: "Nickel-Free",
            },
            features: [
              "Water & sweat-resistant",
              "Anti-tarnish protective coating",
              "Includes Miorah gift box",
            ],
            inStock: true,
          };
        });
        setProducts(formattedProducts);
      }
    }).catch(() => {
      // Keep fallbacks on error
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
      <Navbar />

      <main className="flex-1 w-full pt-28 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-6xl font-serif text-warm-ivory mb-6">
              Exclusive <span className="italic text-champagne-gold font-light">Collections</span>
            </h1>
            <p className="text-muted-text font-light text-base sm:text-lg leading-relaxed">
              Discover our timeless elegance and exclusive designer jewellery.
            </p>
          </div>

          <Suspense fallback={<div className="py-20 text-center text-warm-ivory">Loading collections...</div>}>
            <CollectionsClient initialProducts={products} categories={categories} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
