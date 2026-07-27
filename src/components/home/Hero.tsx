"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles, ShieldCheck, Star, ChevronLeft, ChevronRight, Award, Truck } from "lucide-react";

// Featured luxury hero slides showcasing flagship products
const HERO_SLIDES = [
  {
    id: "MI0035",
    tag: "HERITAGE COLLECTION",
    title: "Royal Kundan Choker",
    subtitle: "Handcrafted Antique Gold Finish with Precious Kundan Work",
    price: "₹3,400",
    image: "/images/products/MI0035/MI0035-1.png",
    link: "/product/kundan-choker-set",
    badge: "Bestseller",
  },
  {
    id: "MI0012",
    tag: "ROYAL ESSENCE",
    title: "Royal Green Cascade",
    subtitle: "Statement Choker & Drop Earrings",
    price: "₹2,850",
    image: "/images/products/MI0012/MI0012-1 Green.png",
    link: "/product/emerald-ruby-heritage",
    badge: "New Arrival",
  },
  {
    id: "M0033",
    tag: "HAUTE JOAILLERIE",
    title: "Crown Solitaire Set",
    subtitle: "Anti-Tarnish Precision Cut Crystals & Gold Plating",
    price: "₹3,100",
    image: "/images/products/M0033/MI0033-1.png",
    link: "/collections",
    badge: "Exclusive",
  },
  {
    id: "MI0029",
    tag: "BRIDAL LUXURY",
    title: "Imperial Bridal Suite",
    subtitle: "Show-Stopping Statement Suite Crafted for Unforgettable Moments",
    price: "₹4,950",
    image: "/images/products/MI0029/MI0029-1.png",
    link: "/product/kundan-pearl-bridal-suite",
    badge: "Limited Edition",
  },
];

// Sparkle light particle coordinates for subtle luxury ambient shimmer
const SPARKLES_DATA = [
  { top: "15%", left: "12%", size: 3, delay: 0 },
  { top: "25%", left: "85%", size: 4, delay: 1.5 },
  { top: "65%", left: "8%", size: 3, delay: 0.7 },
  { top: "75%", left: "90%", size: 5, delay: 2.2 },
  { top: "40%", left: "48%", size: 2, delay: 1.2 },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yImage = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  // Auto-play luxury showcase slide carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeSlide = HERO_SLIDES[currentSlide];

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden bg-primary-bg flex flex-col justify-between pt-24 lg:pt-28 pb-8 lg:pb-12"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Dynamic Ambient Luxury Lighting & Glow Backdrops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[25%] left-[15%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-champagne-gold/15 via-rose-gold/10 to-transparent blur-[140px] animate-pulse duration-[8000ms]" />
        <div className="absolute top-[30%] -right-[15%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-brown/30 blur-[160px]" />
        <div className="absolute -bottom-[20%] left-[30%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-champagne-gold/10 blur-[130px]" />
        
        {/* Subtle Ambient Grid / Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0,transparent_100%)]" />

        {/* Floating Sparkle Particles */}
        {SPARKLES_DATA.map((s, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-champagne-gold/80 shadow-[0_0_12px_#D4AF37]"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 h-full flex-1 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Editorial Copy */}
          <motion.div 
            className="lg:col-span-6 flex flex-col text-center lg:text-left z-20"
            style={{ y: yText, opacity }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eye-catching Anniversary Offer */}
            <motion.div 
              className="relative flex items-center justify-center lg:justify-start mb-6 sm:mb-8 w-full lg:w-fit mx-auto lg:mx-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* Glowing Background Blur */}
              <div className="absolute inset-0 bg-champagne-gold/30 blur-[20px] rounded-full animate-pulse duration-[3000ms]" />
              
              {/* Content */}
              <div className="relative flex items-center gap-3 px-6 py-2.5 rounded-full border border-champagne-gold/50 bg-luxury-brown/80 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <Sparkles className="w-4 h-4 text-champagne-gold animate-pulse" />
                <span className="text-champagne-gold font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs drop-shadow-sm">
                  1-Year Anniversary <span className="text-white">Offer</span>
                </span>
                <Sparkles className="w-4 h-4 text-champagne-gold animate-pulse" />
              </div>
            </motion.div>
            
            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] leading-[1.08] text-warm-ivory mb-6 tracking-tight">
              Unleash the <br className="hidden sm:block" />
              <span className="italic font-light text-gradient-gold drop-shadow-sm">shining beauty</span>
            </h1>
            
            {/* Editorial Subtitle */}
            <p className="text-muted-text text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 font-light leading-relaxed">
              Celebrate our 1st Anniversary with exclusive offers! Miorah brings you handcrafted luxury imitation jewellery engineered to capture eternal radiance.
            </p>


            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
              <Link
                href="/collections"
                className="group relative inline-flex items-center justify-center gap-3 bg-champagne-gold text-primary-bg px-9 py-4 rounded-full font-medium tracking-wider uppercase text-xs sm:text-sm hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 w-full sm:w-auto"
              >
                Shop Now
                <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </Link>
              
              <Link
                href="/new-arrivals"
                className="group inline-flex items-center gap-2 text-warm-ivory hover:text-champagne-gold border-b border-warm-ivory/30 hover:border-champagne-gold pb-1.5 transition-all duration-300 uppercase tracking-widest text-xs sm:text-sm font-medium"
              >
                Explore New Arrivals
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Interactive Premium Image Showcase */}
          <motion.div 
            className="lg:col-span-6 relative flex flex-col items-center justify-center"
            style={{ y: yImage, opacity }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Outer Subtle Golden Ambient Ring Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-champagne-gold/20 via-transparent to-rose-gold/20 blur-xl opacity-70 pointer-events-none transform scale-95" />

            {/* Main Showcase Container */}
            <div className="relative w-full max-w-[460px] aspect-[4/5] rounded-2xl overflow-hidden border border-champagne-gold/25 bg-luxury-brown/50 shadow-[0_25px_60px_rgba(0,0,0,0.7)] group">
              
              {/* Animated Slide Image Switcher */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full relative"
                >
                  <Link href={activeSlide.link} className="block w-full h-full relative">
                    <Image
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                      priority
                    />
                    
                    {/* Top Right Floating Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-primary-bg/80 backdrop-blur-md text-champagne-gold border border-champagne-gold/30 shadow-lg">
                        {activeSlide.badge}
                      </span>
                    </div>

                    {/* Bottom Glassmorphic Product Card */}
                    <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 bg-gradient-to-t from-primary-bg via-primary-bg/85 to-transparent backdrop-blur-[3px] z-20">
                      <div className="glass-panel p-4 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md flex items-center justify-between shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
                        <div>
                          <p className="text-champagne-gold text-[10px] uppercase tracking-[0.25em] font-semibold mb-1">
                            {activeSlide.tag}
                          </p>
                          <h3 className="text-warm-ivory font-serif text-lg sm:text-xl font-normal leading-tight">
                            {activeSlide.title}
                          </h3>
                          <p className="text-muted-text text-xs font-light line-clamp-1 mt-0.5">
                            {activeSlide.subtitle}
                          </p>
                        </div>
                        
                        <div className="text-right pl-3 flex flex-col items-end">
                          <span className="text-warm-ivory font-serif text-lg sm:text-xl font-semibold text-champagne-gold">
                            {activeSlide.price}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-warm-ivory/80 group-hover:text-champagne-gold transition-colors mt-1">
                            View <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary-bg/70 hover:bg-champagne-gold text-warm-ivory hover:text-primary-bg border border-white/10 flex items-center justify-center transition-all duration-300 z-30 opacity-80 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary-bg/70 hover:bg-champagne-gold text-warm-ivory hover:text-primary-bg border border-white/10 flex items-center justify-center transition-all duration-300 z-30 opacity-80 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

            </div>

            {/* Slide Switcher Controls / Dots */}
            <div className="flex items-center gap-3 mt-6 z-20">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentSlide(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="group py-2 px-1 focus:outline-none"
                >
                  <div 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      currentSlide === idx 
                        ? "w-8 bg-champagne-gold shadow-[0_0_8px_#D4AF37]" 
                        : "w-2.5 bg-white/20 group-hover:bg-white/50"
                    }`}
                  />
                </button>
              ))}
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
