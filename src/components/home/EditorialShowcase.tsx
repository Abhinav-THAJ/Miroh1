"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function EditorialShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y3 = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section ref={sectionRef} className="py-32 bg-luxury-brown relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-luxury-black/30 mix-blend-overlay pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-white/10 pb-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-warm-ivory leading-tight">
              <span className="italic font-light text-champagne-gold mr-4">Curated</span> 
              Elegance for the Modern Muse.
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-muted-text max-w-sm text-lg mt-8 md:mt-0 font-light"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Admire the breathtaking craftsmanship and heritage behind every piece in our exclusive showroom.
          </motion.p>
        </div>

        {/* Asymmetrical Layout */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Large Column */}
          <motion.div 
            className="w-full lg:w-5/12 relative"
            style={{ y: y1 }}
          >
            <Link href="/collections" className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 block">
              <Image
                src="/images/products/MI0012/MI0012-1 Green.png"
                alt="Handpicked Designer Jewellery"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </Link>
            <div className="mt-8 flex items-center justify-between">
              <div>

                <Link href="/collections">
                  <h3 className="font-serif text-3xl text-warm-ivory hover:text-champagne-gold transition-colors">Royal Green Cascade</h3>
                </Link>
              </div>
              <Link
                href="/collections"
                className="w-12 h-12 rounded-full border border-champagne-gold/30 flex items-center justify-center text-champagne-gold hover:bg-champagne-gold hover:text-primary-bg transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="w-full lg:w-7/12 flex flex-col gap-24 pt-12 lg:pt-32">
            
            {/* Top Right Item */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-8 items-center lg:items-start"
              style={{ y: y2 }}
            >
              <Link href="/collections" className="group relative w-full sm:w-1/2 aspect-square overflow-hidden rounded-2xl border border-champagne-gold/20 shadow-2xl block">
                <Image
                  src="/images/products/MI0017/MI0017-1.png"
                  alt="Crystal Pear Ring"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </Link>
              <div className="w-full sm:w-1/2 flex flex-col justify-center text-center sm:text-left mt-6 sm:mt-0">
                <p className="text-champagne-gold text-xs uppercase tracking-[0.2em] mb-3 font-semibold">Premium Grade</p>
                <Link href="/collections">
                  <h3 className="font-serif text-3xl text-warm-ivory hover:text-champagne-gold transition-colors mb-4">Crystal Pear Ring</h3>
                </Link>
                <p className="text-muted-text font-light text-sm mb-6">A delicate fusion of classic charm and modern brilliance, perfect for any occasion.</p>
                <Link
                  href="/collections"
                  className="inline-block text-xs uppercase tracking-widest text-champagne-gold hover:text-white border-b border-champagne-gold/30 hover:border-white pb-1 w-fit transition-colors"
                >
                  Discover Piece
                </Link>
              </div>
            </motion.div>

            {/* Bottom Right Item */}
            <motion.div 
              className="relative self-end w-full sm:w-4/5 lg:w-3/4"
              style={{ y: y3 }}
            >
              <Link href="/collections" className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/5 block">
                <Image
                  src="/images/products/MI0022/MI0022-1 Coin.png"
                  alt="Traditional Coin Necklace"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </Link>
              <div className="absolute -bottom-10 -left-10 lg:-left-20 bg-primary-bg p-8 rounded-tr-3xl border-t border-r border-white/5 shadow-2xl max-w-[80%]">
                <p className="text-champagne-gold text-xs uppercase tracking-[0.2em] mb-2 font-semibold">Heritage Collection</p>
                <Link href="/collections">
                  <h3 className="font-serif text-2xl lg:text-3xl text-warm-ivory hover:text-champagne-gold transition-colors">Traditional Coin Necklace</h3>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
