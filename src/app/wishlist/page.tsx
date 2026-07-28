"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_PRODUCTS } from "@/lib/data";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 w-full pt-32 pb-24 flex items-center justify-center" />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
      <Navbar />

      <main className="flex-1 w-full pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.4em] text-champagne-gold font-semibold block mb-4">
              Saved Favorites
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif text-warm-ivory mb-4">
              My <span className="italic text-champagne-gold font-light">Wishlist</span>
            </h1>
            <p className="text-muted-text font-light text-base">
              Review your saved luxury pieces and add them to your shopping bag anytime.
            </p>
          </div>

          {/* Wishlist Items Grid */}
          {wishlistItems.length === 0 ? (
            <div className="py-20 text-center bg-white/5 border border-white/10 rounded-3xl p-8 max-w-xl mx-auto">
              <Heart size={48} className="text-champagne-gold/40 mx-auto mb-4" />
              <h2 className="text-2xl font-serif text-warm-ivory mb-2">Your wishlist is empty</h2>
              <p className="text-muted-text text-sm font-light mb-6">
                Explore our handcrafted collections and save your favorite designs here.
              </p>
              <Link
                href="/collections"
                className="inline-block px-8 py-3.5 rounded-full bg-champagne-gold text-primary-bg font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors"
              >
                Browse Collections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {wishlistItems.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group bg-white/5 border border-white/10 hover:border-champagne-gold/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-luxury-brown mb-4">
                        <Link href={`/product/${product.slug || product.id}`}>
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-105"
                          />
                        </Link>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-primary-bg/80 backdrop-blur-md flex items-center justify-center text-muted-text hover:text-red-400 border border-white/10 transition-colors"
                          title="Remove from Wishlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <span className="text-[10px] uppercase tracking-widest text-champagne-gold font-semibold block mb-1">
                        {product.category}
                      </span>
                      <Link href={`/product/${product.slug || product.id}`}>
                        <h3 className="font-serif text-lg text-warm-ivory group-hover:text-champagne-gold transition-colors mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                      <span className="text-lg font-bold text-warm-ivory">
                        {product.price}
                      </span>
                      <Link
                        href={`/product/${product.slug || product.id}`}
                        className="px-4 py-2 rounded-xl bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-1"
                      >
                        View <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
