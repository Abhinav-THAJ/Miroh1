"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface ProductProp {
  id: number | string;
  name: string;
  price: string;
  originalPrice?: string;
  image1: string;
}

export default function NewArrivals({ products }: { products?: ProductProp[] }) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const displayProducts = products && products.length > 0 ? products : [
    {
      id: "MI0035",
      name: "Kundan Choker Set",
      price: "₹3,400",
      image1: "/images/products/MI0035/MI0035-1.png",
    },
    {
      id: "MI0016",
      name: "Emerald Shine Drops",
      price: "₹1,150",
      image1: "/images/products/MI0016/MI0016-1 Green & Red.png",
    },
    {
      id: "MI0037",
      name: "Minimal Huggies",
      price: "₹850",
      image1: "/images/products/MI0037/MI0037-1.png",
    },
    {
      id: "MI0010",
      name: "Pearl Drop Earrings",
      price: "₹1,050",
      image1: "/images/products/MI0010/MI0010-1.png",
    },
  ];

  const fallbackImages = [
    "/images/products/MI0035/MI0035-1.png",
    "/images/products/MI0016/MI0016-1 Green & Red.png",
    "/images/products/MI0037/MI0037-1.png",
    "/images/products/MI0010/MI0010-1.png",
  ];

  const getImgSrc = (p: ProductProp, index: number) => {
    if (imgErrors[String(p.id)]) {
      return fallbackImages[index % fallbackImages.length];
    }
    return p.image1;
  };

  return (
    <section className="py-24 md:py-32 bg-primary-bg relative border-t border-white/5">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="uppercase tracking-[0.4em] text-champagne-gold text-xs font-semibold block mb-6">
              Just Arrived
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-warm-ivory leading-tight">
              A New Era of <span className="italic font-light text-champagne-gold">Elegance</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/new-arrivals"
              className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-champagne-gold hover:text-white transition-colors border-b border-champagne-gold/30 hover:border-white pb-1"
            >
              View New Arrivals
            </Link>
          </motion.div>
        </div>

        {/* Editorial Scattered Layout */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Left Side: Large Hero Piece */}
          {displayProducts[0] && (
            <motion.div 
              className="w-full lg:w-1/2 flex flex-col"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <Link href={`/product/${displayProducts[0].id}`} className="group relative aspect-[3/4] w-full lg:w-11/12 overflow-hidden rounded-2xl bg-luxury-brown border border-white/5 shadow-2xl block">
                <Image
                  src={getImgSrc(displayProducts[0], 0)}
                  alt={displayProducts[0].name}
                  fill
                  onError={() => setImgErrors((prev) => ({ ...prev, [String(displayProducts[0].id)]: true }))}
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-bg via-transparent to-transparent opacity-60" />
              </Link>
              
              <div className="mt-8 lg:w-11/12 flex items-center justify-between">
                <div>
                  <Link href={`/product/${displayProducts[0].id}`}>
                    <h3 className="text-3xl font-serif text-warm-ivory hover:text-champagne-gold transition-colors mb-2">
                      {displayProducts[0].name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3">
                    <p className="text-champagne-gold font-light tracking-widest">{displayProducts[0].price}</p>
                    {displayProducts[0].originalPrice && (
                      <p className="text-warm-ivory/70 font-medium text-sm">MRP: <span className="line-through">{displayProducts[0].originalPrice}</span></p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/product/${displayProducts[0].id}`}
                  className="w-12 h-12 rounded-full border border-champagne-gold/30 flex items-center justify-center text-champagne-gold hover:bg-champagne-gold hover:text-primary-bg transition-colors"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Right Side: Scattered Pieces */}
          <div className="w-full lg:w-1/2 flex flex-col gap-16 lg:gap-32">
            
            {/* Top Right Piece */}
            {displayProducts[1] && (
              <motion.div 
                className="self-end w-full sm:w-4/5 lg:w-3/4 flex flex-col"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Link href={`/product/${displayProducts[1].id}`} className="group relative aspect-square w-full overflow-hidden rounded-full bg-luxury-brown border border-champagne-gold/20 shadow-xl block">
                  <Image
                    src={getImgSrc(displayProducts[1], 1)}
                    alt={displayProducts[1].name}
                    fill
                    onError={() => setImgErrors((prev) => ({ ...prev, [String(displayProducts[1].id)]: true }))}
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </Link>
                <div className="mt-8 text-right pr-6">
                  <Link href={`/product/${displayProducts[1].id}`}>
                    <h3 className="text-2xl font-serif text-warm-ivory hover:text-champagne-gold transition-colors mb-1">
                      {displayProducts[1].name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-end gap-2">
                    {displayProducts[1].originalPrice && (
                      <p className="text-warm-ivory/70 font-medium text-xs">MRP: <span className="line-through">{displayProducts[1].originalPrice}</span></p>
                    )}
                    <p className="text-champagne-gold font-light text-sm tracking-wider">{displayProducts[1].price}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bottom Right Piece */}
            {displayProducts[2] && (
              <motion.div 
                className="self-start w-full sm:w-3/4 lg:w-2/3 flex flex-col sm:flex-row-reverse gap-8 items-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link href={`/product/${displayProducts[2].id}`} className="group relative aspect-[4/5] w-full sm:w-1/2 overflow-hidden rounded-2xl bg-luxury-brown border border-white/5 shadow-2xl block">
                  <Image
                    src={getImgSrc(displayProducts[2], 2)}
                    alt={displayProducts[2].name}
                    fill
                    onError={() => setImgErrors((prev) => ({ ...prev, [String(displayProducts[2].id)]: true }))}
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </Link>
                <div className="w-full sm:w-1/2 text-center sm:text-right">
                  <Link href={`/product/${displayProducts[2].id}`}>
                    <h3 className="text-2xl font-serif text-warm-ivory hover:text-champagne-gold transition-colors mb-2">
                      {displayProducts[2].name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center sm:justify-end gap-2 mb-6">
                    {displayProducts[2].originalPrice && (
                      <p className="text-warm-ivory/70 font-medium text-sm">MRP: <span className="line-through">{displayProducts[2].originalPrice}</span></p>
                    )}
                    <p className="text-champagne-gold font-light tracking-widest">{displayProducts[2].price}</p>
                  </div>
                  <Link
                    href={`/product/${displayProducts[2].id}`}
                    className="inline-block text-xs uppercase tracking-widest text-muted-text hover:text-champagne-gold border-b border-white/10 hover:border-champagne-gold pb-1 transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
