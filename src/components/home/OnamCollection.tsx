"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function OnamCollection() {
  const [isVisible] = useState(true);
  
  if (!isVisible) return null;

  return (
    <section className="py-24 bg-primary-bg relative overflow-hidden border-t border-white/5">
      {/* Golden Particles Mockup */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-champagne-gold shadow-[0_0_10px_#D4AF37] animate-pulse" />
        <div className="absolute top-[40%] right-[20%] w-3 h-3 rounded-full bg-champagne-gold shadow-[0_0_15px_#D4AF37] animate-pulse delay-700" />
        <div className="absolute bottom-[30%] left-[30%] w-1.5 h-1.5 rounded-full bg-champagne-gold shadow-[0_0_8px_#D4AF37] animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center bg-gradient-brown rounded-3xl overflow-hidden border border-champagne-gold/20 shadow-2xl relative">
          
          <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-[1px] bg-champagne-gold" />
                <span className="text-champagne-gold uppercase tracking-[0.3em] text-xs font-semibold">Seasonal Exclusive</span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-serif text-warm-ivory mb-6">
                The <span className="italic text-champagne-gold font-light">Onam</span> Collection
              </h2>
              
              <p className="text-muted-text text-lg font-light mb-10 max-w-md">
                Celebrate the festive season with our exclusive traditional designs. Elegance curated for your grand celebrations.
              </p>

              {/* Countdown Timer Mockup */}
              <div className="flex items-center gap-6 mb-10">
                {[
                  { label: "DAYS", value: "12" },
                  { label: "HOURS", value: "08" },
                  { label: "MINS", value: "45" },
                ].map((time, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-3xl font-serif text-champagne-gold">{time.value}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-text mt-1">{time.label}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/collections"
                className="flex items-center gap-3 bg-champagne-gold text-primary-bg px-8 py-4 rounded-full font-medium tracking-wide hover:bg-white transition-colors w-fit group"
              >
                Shop Onam Collection
                <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <Link href="/product/MI0041" className="w-full lg:w-1/2 relative min-h-[500px] lg:min-h-[700px] block group">
            <Image
              src="/images/products/MI0041/MI0041-1.png"
              alt="Onam Collection"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gradient-brown via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-gradient-brown via-transparent to-transparent lg:hidden" />
          </Link>

        </div>
      </div>
    </section>
  );
}
