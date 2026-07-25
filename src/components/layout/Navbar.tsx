"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Best Sellers", href: "/best-sellers" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isScrolled
          ? "bg-primary-bg/80 backdrop-blur-md border-b border-white/5 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-warm-ivory hover:text-champagne-gold transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>

        {/* Logo Image */}
        <Link href="/" className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start">
          <Image
            src="/logo.png"
            alt="MIORAH - The Reflection of Beauty"
            width={240}
            height={70}
            className="h-14 sm:h-16 lg:h-20 w-auto object-contain drop-shadow-md py-1"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-8 h-full">
          {navLinks.map((link) => {
            if (link.name === "Collections") {
              return (
                <div key={link.name} className="group h-full py-6 -my-6 flex items-center">
                  <Link
                    href={link.href}
                    className="text-sm uppercase tracking-widest text-warm-ivory/80 group-hover:text-champagne-gold transition-colors duration-300 font-medium"
                  >
                    {link.name}
                  </Link>

                  {/* Category Dropdown */}
                  <div className="absolute top-full left-0 w-full bg-primary-bg/95 backdrop-blur-xl border-y border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top -translate-y-2 group-hover:translate-y-0">
                    <div className="container mx-auto px-6 py-8">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 max-w-5xl mx-auto">
                        <h4 className="text-champagne-gold text-xs font-bold tracking-[0.25em] uppercase">
                          Product Categories
                        </h4>
                        <Link href="/collections" className="text-xs text-muted-text hover:text-champagne-gold transition-colors font-light uppercase tracking-widest">
                          View All Pieces &rarr;
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
                        {[
                          { name: "All Collections", href: "/collections" },
                          { name: "Chokers", href: "/collections?category=chokers" },
                          { name: "Long Sets", href: "/collections?category=long-sets" },
                          { name: "Bridal Sets", href: "/collections?category=bridal-sets" },
                          { name: "Pendant Sets", href: "/collections?category=pendant-sets" },
                          { name: "Temple Jewellery", href: "/collections?category=temple-jewellery" },
                          { name: "Kundan Sets", href: "/collections?category=kundan-sets" },
                          { name: "Polki Sets", href: "/collections?category=polki-sets" },
                          { name: "Earrings", href: "/collections?category=earrings" },
                          { name: "Bangles & Bracelets", href: "/collections?category=bangles" },
                          { name: "Rings", href: "/collections?category=rings" },
                          { name: "Necklaces", href: "/collections?category=necklaces" },
                        ].map((cat) => (
                          <Link
                            key={cat.name}
                            href={cat.href}
                            className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-champagne-gold/50 hover:bg-champagne-gold/10 text-warm-ivory hover:text-champagne-gold text-xs font-medium tracking-wider uppercase text-center transition-all duration-300 flex items-center justify-center min-h-[48px]"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm uppercase tracking-widest text-warm-ivory/80 hover:text-champagne-gold transition-colors duration-300 font-medium"
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-5 text-warm-ivory">
          <button className="hover:text-champagne-gold transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href="/wishlist" className="hover:text-champagne-gold transition-colors hidden sm:block">
            <Heart size={20} strokeWidth={1.5} />
          </Link>
          <Link href="/account" className="hover:text-champagne-gold transition-colors hidden sm:block">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <a 
            href="https://springgreen-rook-492819.hostingersite.com/cart" 
            className="hover:text-champagne-gold transition-colors relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -top-1.5 -right-1.5 bg-champagne-gold text-primary-bg text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </a>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-primary-bg/95 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Image
                src="/logo.png"
                alt="MIORAH"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-warm-ivory hover:text-champagne-gold transition-colors"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col space-y-8">
            {navLinks.map((link) => (
              <div key={link.name} className="flex flex-col">
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-2xl text-warm-ivory hover:text-champagne-gold transition-colors inline-block"
                >
                  {link.name}
                </Link>
                {link.name === "Collections" && (
                  <div className="mt-4 pl-4 border-l border-white/10 flex flex-col space-y-3">
                    <h4 className="text-champagne-gold text-[10px] font-bold tracking-[0.25em] uppercase mb-1">Categories</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "All Collections",
                        "Chokers",
                        "Long Sets",
                        "Bridal Sets",
                        "Pendant Sets",
                        "Temple Jewellery",
                        "Kundan Sets",
                        "Polki Sets",
                        "Earrings",
                        "Bangles & Bracelets",
                        "Rings",
                        "Necklaces",
                      ].map((item) => (
                        <Link
                          key={item}
                          onClick={() => setMobileMenuOpen(false)}
                          href={`/collections?category=${encodeURIComponent(item.toLowerCase())}`}
                          className="text-muted-text text-xs hover:text-warm-ivory py-1"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.header>
  );
}
