"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ShieldCheck, Truck, Gem, Sparkles } from "lucide-react";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function AboutPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black overflow-hidden" ref={containerRef}>
      <Navbar />
      
      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <motion.div 
            style={{ y: heroY }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <Image
              src="/images/products/MI0035/MI0035-1.png"
              alt="Miorah Luxury Jewellery"
              fill
              className="object-cover object-center scale-105"
              priority
            />
          </motion.div>

          <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-20">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="uppercase tracking-[0.4em] text-champagne-gold text-sm font-semibold block mb-6"
            >
              The Miorah Heritage
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-5xl md:text-8xl font-serif text-warm-ivory mb-8 leading-tight drop-shadow-xl"
            >
              The <span className="italic font-light text-champagne-gold">Reflection</span><br /> of Beauty
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-warm-ivory/60 text-xs tracking-[0.2em] uppercase">Scroll to explore</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-champagne-gold to-transparent animate-pulse" />
          </motion.div>
        </section>

        {/* OUR STORY */}
        <section className="py-32 relative bg-background">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="space-y-8"
              >
                <motion.div variants={fadeIn} className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-[1px] bg-champagne-gold" />
                  <span className="uppercase tracking-[0.2em] text-champagne-gold text-xs font-semibold">Our Story</span>
                </motion.div>
                <motion.h2 variants={fadeIn} className="text-4xl md:text-6xl font-serif text-warm-ivory leading-tight">
                  Crafting <span className="italic text-champagne-gold">Timeless</span> Traditions
                </motion.h2>
                <motion.p variants={fadeIn} className="text-muted-text font-light text-lg leading-relaxed">
                  At Miorah, we believe that jewellery is more than an accessory—it&apos;s a reflection of confidence, tradition, and timeless beauty. Inspired by the rich heritage of South Indian craftsmanship, Miorah brings you premium imitation jewellery that beautifully blends classic elegance with contemporary style.
                </motion.p>
                <motion.p variants={fadeIn} className="text-muted-text font-light text-lg leading-relaxed">
                  Every piece is thoughtfully selected to help you celebrate life&apos;s special moments, from festive occasions and weddings to everyday elegance.
                </motion.p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 z-10">
                  <Image
                    src="/images/products/MI0012/MI0012-1 Green.png"
                    alt="Miorah Heritage"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CRAFTSMANSHIP & VISION */}
        <section className="py-32 relative bg-[#2D1810]/20 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="order-2 lg:order-1 relative aspect-square rounded-full overflow-hidden border border-champagne-gold/20 p-2"
              >
                <div className="w-full h-full relative rounded-full overflow-hidden">
                  <Image
                    src="/images/products/MI0016/MI0016-1 Green & Red.png"
                    alt="Craftsmanship"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-1000"
                  />
                </div>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="order-1 lg:order-2 space-y-8"
              >
                <motion.div variants={fadeIn}>
                  <Sparkles className="w-8 h-8 text-champagne-gold mb-6" />
                  <h2 className="text-3xl md:text-5xl font-serif text-warm-ivory leading-tight mb-6">
                    Meticulous <br /><span className="italic text-champagne-gold">Craftsmanship</span>
                  </h2>
                  <p className="text-muted-text font-light text-lg leading-relaxed">
                    Our collections are designed for women who appreciate luxurious designs without the premium price tag. With a commitment to quality, craftsmanship, and customer satisfaction, we strive to make every piece feel as special as the person wearing it.
                  </p>
                </motion.div>

                <motion.div variants={fadeIn} className="pt-8 border-t border-white/10 mt-12">
                  <p className="text-champagne-gold text-xs uppercase tracking-[0.2em] font-semibold mb-2">Founder&apos;s Vision</p>
                  <h3 className="text-warm-ivory font-serif text-3xl mb-6">Amrutha Mohan</h3>
                  <blockquote className="border-l-2 border-champagne-gold/50 pl-6 py-2">
                    <p className="text-muted-text font-light text-xl italic leading-relaxed">
                      &quot;Miorah was created with a vision to make timeless elegance accessible to everyone. Our mission is to bring beautifully crafted jewellery that inspires confidence, celebrates tradition, and becomes a cherished part of every special moment.&quot;
                    </p>
                  </blockquote>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* OUR PROMISE */}
        <section className="py-32 bg-background">
          <div className="container mx-auto px-6 max-w-7xl text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-warm-ivory mb-4">Our Promise</h2>
              <div className="w-24 h-[1px] bg-champagne-gold mx-auto" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { icon: Gem, title: "Premium Quality", desc: "Exquisite imitation jewellery crafted to perfection." },
                { icon: Sparkles, title: "Heritage Inspired", desc: "Designs rooted in rich South Indian traditions." },
                { icon: Truck, title: "Pan India Delivery", desc: "Bringing elegance securely to your doorstep." },
                { icon: ShieldCheck, title: "Trusted Quality", desc: "100% commitment to customer satisfaction." },
              ].map((promise, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col items-center p-8 border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <promise.icon className="w-10 h-10 text-champagne-gold mb-6" strokeWidth={1.5} />
                  <h3 className="text-xl font-serif text-warm-ivory mb-3">{promise.title}</h3>
                  <p className="text-muted-text font-light text-sm leading-relaxed">{promise.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
