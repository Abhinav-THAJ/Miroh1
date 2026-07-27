"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export default function ProductGallery({
  images,
  productName,
  isBestSeller,
  isNewArrival,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeImage = images[selectedIndex] || images[0] || "/images/products/MI0036/MI0036-1.png";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 w-full">
      {/* Thumbnails (Horizontal on Mobile, Vertical on Desktop) */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[580px] scrollbar-none py-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
              selectedIndex === idx
                ? "border-champagne-gold shadow-lg scale-105"
                : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Feature Image Container */}
      <div className="relative flex-1 aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden bg-luxury-brown border border-white/10 shadow-2xl group">
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          {isBestSeller && (
            <span className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-champagne-gold text-luxury-black shadow-md flex items-center gap-1">
              <Sparkles size={12} /> Bestseller
            </span>
          )}
          {isNewArrival && (
            <span className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-white/20 backdrop-blur-md text-warm-ivory border border-white/20">
              New Drop
            </span>
          )}
        </div>

        {/* Fullscreen Lightbox Trigger Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-primary-bg/70 backdrop-blur-md flex items-center justify-center text-warm-ivory hover:text-champagne-gold hover:bg-primary-bg transition-all opacity-0 group-hover:opacity-100 shadow-md border border-white/10"
          title="Expand View"
        >
          <Maximize2 size={18} />
        </button>

        {/* Image displaying with Smooth Framer Motion transition */}
        <div
          className="relative w-full h-full cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full relative"
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                priority
                className={`object-cover transition-transform duration-200 ${
                  isZoomed ? "scale-150" : "scale-100"
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      }
                    : undefined
                }
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation Arrows for Mobile / Desktop Quick Switch */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-primary-bg/60 backdrop-blur-md flex items-center justify-center text-warm-ivory hover:text-champagne-gold hover:bg-primary-bg transition-all opacity-70 hover:opacity-100 border border-white/10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-primary-bg/60 backdrop-blur-md flex items-center justify-center text-warm-ivory hover:text-champagne-gold hover:bg-primary-bg transition-all opacity-70 hover:opacity-100 border border-white/10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-luxury-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-warm-ivory hover:text-champagne-gold p-2 transition-colors z-50"
            >
              <X size={32} />
            </button>
            <div className="relative w-full max-w-4xl aspect-[4/5] sm:aspect-square max-h-[85vh]">
              <Image
                src={activeImage}
                alt={productName}
                fill
                className="object-contain"
              />
            </div>
            {/* Modal Thumbnail Bar */}
            <div className="flex gap-3 mt-6">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    selectedIndex === idx ? "border-champagne-gold scale-110" : "border-white/20 opacity-50"
                  }`}
                >
                  <Image src={img} alt="thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
