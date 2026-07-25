"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface ProductProp {
  id: number | string;
  name: string;
  price: string;
  category: string;
  originalPrice?: string;
  image1: string;
  image2?: string;
}

export default function BestSellers({ products }: { products: ProductProp[] }) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (!products || products.length === 0) return null;

  const fallbackImages = [
    "/images/products/MI0036/MI0036-1.png",
    "/images/products/MI0016/MI0016-1 Green.png",
    "/images/products/MI0027/MI0027-1.png",
    "/images/products/MI0030/MI0030-1.png",
    "/images/products/MI0008/MI0008-1.png",
    "/images/products/MI0035/MI0035-1.png",
    "/images/products/MI0037/MI0037-1.png",
    "/images/products/MI0010/MI0010-1.png",
  ];

  return (
    <section className="py-24 bg-primary-bg relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif text-warm-ivory mb-2">
            Latest <span className="italic text-champagne-gold">collections</span>
          </h2>
          <p className="text-muted-text font-light">
            Discover our most loved pieces.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Link
            href="/best-sellers"
            className="mt-6 md:mt-0 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-champagne-gold hover:text-white transition-colors"
          >
            View Best Sellers
            <span className="w-8 h-8 rounded-full border border-champagne-gold/30 flex items-center justify-center bg-transparent">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
      </div>

      <div className="container mx-auto px-6">
        <div className="overflow-visible" ref={emblaRef}>
          <div className="flex gap-6 pb-8 touch-pan-y cursor-grab active:cursor-grabbing">
            {products.map((product, index) => {
              const fallbackIndex = index % fallbackImages.length;
              const hasError1 = imgErrors[`${product.id}-1`];
              const hasError2 = imgErrors[`${product.id}-2`];

              const src1 = hasError1 ? fallbackImages[fallbackIndex] : product.image1;
              const src2 = hasError2 ? fallbackImages[(fallbackIndex + 1) % fallbackImages.length] : (product.image2 || src1);

              return (
                <motion.div
                  key={product.id}
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_28%] min-w-0 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:border-champagne-gold/30 flex flex-col justify-between h-full">
                    <div>
                      <Link href={`/product/${product.id}`} className="block relative aspect-square w-full rounded-lg overflow-hidden bg-luxury-brown mb-6">
                        {/* Primary Image */}
                        <Image
                          src={src1}
                          alt={product.name}
                          fill
                          onError={() => setImgErrors((prev) => ({ ...prev, [`${product.id}-1`]: true }))}
                          className={`object-cover transition-opacity duration-700 ease-in-out opacity-100 ${src2 ? 'group-hover:opacity-0' : ''}`}
                        />
                        {src2 && (
                          <Image
                            src={src2}
                            alt={product.name}
                            fill
                            onError={() => setImgErrors((prev) => ({ ...prev, [`${product.id}-2`]: true }))}
                            className="object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100"
                          />
                        )}
                        
                        {/* Floating Actions */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="w-10 h-10 rounded-full bg-primary-bg/80 backdrop-blur-md flex items-center justify-center text-warm-ivory hover:text-champagne-gold hover:bg-white transition-colors shadow-lg border border-white/10"
                          >
                            <Heart size={18} strokeWidth={1.5} />
                          </button>
                        </div>
                      </Link>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-champagne-gold mb-1">{product.category}</p>
                          <Link href={`/product/${product.id}`}>
                            <h3 className="font-serif text-lg text-warm-ivory hover:text-champagne-gold transition-colors">{product.name}</h3>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-between mt-4 border-t border-white/5 pt-4">
                      <div className="flex flex-col gap-0.5">
                        {product.originalPrice && (
                          <span className="text-xs text-warm-ivory/50 font-medium">
                            MRP: <span className="line-through">{product.originalPrice}</span>
                          </span>
                        )}
                        <span className="text-xl font-bold text-warm-ivory">{product.price}</span>
                      </div>
                      <Link
                        href={`/product/${product.id}`}
                        className="text-xs uppercase tracking-widest text-champagne-gold hover:text-white transition-colors flex items-center gap-2"
                      >
                        <ShoppingBag size={14} /> View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
