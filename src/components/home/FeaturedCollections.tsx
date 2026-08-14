"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const collectionsFallback = [
  {
    id: "traditional",
    title: "Traditional",
    subtitle: "HERITAGE ROOTS",
    image: "/images/products/MI0024/MI0024-1 Green.png",
    productLink: "/product/MI0024",
    description: "Embrace the timeless elegance of classic designs, meticulously crafted to honor cultural heritage.",
  },
  {
    id: "bridal",
    title: "Bridal",
    subtitle: "THE BIG DAY",
    image: "/images/products/MI0029/MI0029-1.png",
    productLink: "/product/MI0029",
    description: "Make your unforgettable moments shine brighter with our exquisite, show-stopping bridal suites.",
  },
  {
    id: "premium",
    title: "Premium",
    subtitle: "EXCLUSIVE SELECTION",
    image: "/images/products/MI0034/MI0034-1.png",
    productLink: "/product/MI0034",
    description: "The pinnacle of our craftsmanship. Bold, intricate, and uncompromising in luxury.",
  },
];

export default function FeaturedCollections({ acfData }: { acfData?: any }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const heading = acfData?.heading || "Explore";
  const headingItalic = acfData?.heading_italic || "Collections";

  // Build collections array from ACF or fallback
  const rawItems = acfData?.items;
  const itemsArray = Array.isArray(rawItems)
    ? rawItems
    : (rawItems && typeof rawItems === 'object' ? Object.values(rawItems) : []);

  const acfItems = itemsArray.length > 0 
    ? itemsArray.filter((item: any) => item && (item.title || item.image)).map((item: any, idx: number) => ({
        id: `acf-fc-${idx}`,
        title: item.title,
        subtitle: "", 
        image: item.image?.url || item.image || collectionsFallback[0].image,
        productLink: item.link || "/collections",
        description: item.description,
      }))
    : [];

  const displayCollections = acfItems.length > 0 ? acfItems : collectionsFallback;

  return (
    <section className="py-20 md:py-32 bg-primary-bg relative border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-12 md:mb-24">
          <motion.h2 
            className="text-3xl sm:text-5xl lg:text-6xl font-serif text-warm-ivory"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {heading} <span className="italic font-light text-champagne-gold">{headingItalic}</span>
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-center">
          
          {/* Left Side: Interactive List */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 md:gap-8">
            {displayCollections.map((collection, index) => {
              const isActive = activeIndex === index;
              return (
                <div 
                  key={collection.id}
                  className="group cursor-pointer border-b border-white/10 pb-5 md:pb-8 flex flex-col justify-center transition-colors hover:border-champagne-gold/50"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`text-xs font-semibold tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-champagne-gold' : 'text-white/30 group-hover:text-champagne-gold/70'}`}>
                      0{index + 1}
                    </span>
                    <span className={`w-8 sm:w-12 h-[1px] transition-all duration-500 ${isActive ? 'bg-champagne-gold scale-x-100 origin-left' : 'bg-white/10 scale-x-0 origin-left group-hover:scale-x-100'}`} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Link href="/collections" className="block">
                      <h3 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif transition-colors duration-500 ${isActive ? 'text-warm-ivory' : 'text-white/40 group-hover:text-warm-ivory/80'}`}>
                        {collection.title}
                      </h3>
                    </Link>
                    <Link
                      href="/collections"
                      className={`transform transition-all duration-500 ${isActive ? 'translate-x-0 opacity-100 text-champagne-gold' : '-translate-x-4 opacity-0 text-white/30'}`}
                    >
                      <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 hover:text-white transition-colors" strokeWidth={1} />
                    </Link>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 sm:mt-6 text-muted-text font-light max-w-sm text-sm sm:text-base">
                          {collection.description}
                        </p>
                        <Link
                          href="/collections"
                          className="inline-block mt-4 sm:mt-6 text-xs uppercase tracking-[0.2em] text-champagne-gold border-b border-champagne-gold/30 hover:border-champagne-gold hover:text-white pb-1 transition-colors font-medium"
                        >
                          View Collection
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Side: Image Reveal */}
          <Link
            href={displayCollections[activeIndex].productLink}
            className="w-full lg:w-1/2 relative h-[380px] sm:h-[500px] md:h-[600px] lg:h-[750px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 mt-6 lg:mt-0 block group cursor-pointer"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={displayCollections[activeIndex].image}
                  alt={displayCollections[activeIndex].title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-bg/60 via-transparent to-transparent mix-blend-multiply" />
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-16 h-16 sm:w-24 sm:h-24 border border-champagne-gold/20 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: '20s' }}>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-champagne-gold rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#D4AF37]" />
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
