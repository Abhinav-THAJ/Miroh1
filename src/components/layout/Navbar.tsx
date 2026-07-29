"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ALL_PRODUCTS } from "@/lib/data";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { scrollY } = useScroll();
  const { toggleCart, items } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  
  // Calculate total quantity of items in cart
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const searchResults = searchQuery.trim() === "" 
    ? [] 
    : ALL_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <>
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isScrolled || searchOpen
          ? "bg-primary-bg/80 backdrop-blur-md border-b border-white/5 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between relative">
        
        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 bg-primary-bg/95 backdrop-blur-md z-[60] flex items-center px-6"
            >
              <div className="w-full max-w-4xl mx-auto flex flex-col relative">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
                  <Search size={20} className="text-champagne-gold" />
                  <input
                    type="text"
                    placeholder="Search collections, pieces, styles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-warm-ivory placeholder:text-muted-text/50 font-light text-lg"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-muted-text hover:text-champagne-gold transition-colors p-2"
                  >
                    <X size={24} />
                  </button>
                </form>

                {/* Live Search Results */}
                {searchQuery.trim() !== "" && (
                  <div className="absolute top-full left-0 w-full mt-6 bg-luxury-brown/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[70vh] overflow-y-auto scrollbar-none">
                    {searchResults.length > 0 ? (
                      <div>
                        <div className="px-5 py-3 bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest text-champagne-gold font-bold">
                          Matching Pieces
                        </div>
                        {searchResults.map(product => (
                          <Link 
                            key={product.id} 
                            href={`/product/${product.slug || product.id}`}
                            onClick={() => {
                               setSearchOpen(false);
                               setSearchQuery("");
                            }}
                            className="flex items-center gap-4 p-4 hover:bg-white/5 border-b border-white/5 transition-colors group"
                          >
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-primary-bg">
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div>
                               <p className="text-[10px] text-muted-text uppercase tracking-wider mb-1">{product.category}</p>
                               <h4 className="text-warm-ivory text-sm sm:text-base font-serif group-hover:text-champagne-gold transition-colors line-clamp-1">{product.name}</h4>
                               <p className="text-xs text-champagne-gold font-semibold mt-1">{product.price}</p>
                            </div>
                          </Link>
                        ))}
                        <button 
                          onClick={handleSearchSubmit}
                          className="w-full text-center py-4 text-xs uppercase tracking-widest text-champagne-gold hover:bg-white/5 transition-colors font-semibold"
                        >
                          View all results &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-text font-light text-sm">
                        No pieces found matching "<span className="text-warm-ivory">{searchQuery}</span>"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <button 
            onClick={() => setSearchOpen(true)}
            className="hover:text-champagne-gold transition-colors"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href="/wishlist" className="hover:text-champagne-gold transition-colors hidden sm:block">
            <Heart size={20} strokeWidth={1.5} />
          </Link>
          <Link
            href="/account"
            className={`transition-colors hidden sm:block relative group ${
              isAuthenticated ? "text-champagne-gold" : "hover:text-champagne-gold"
            }`}
            title={isAuthenticated ? `My Account (${user?.name || user?.email})` : "Login / Sign Up"}
          >
            <User size={20} strokeWidth={1.5} />
            {isAuthenticated && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-champagne-gold" />
            )}
          </Link>
          <button 
            onClick={toggleCart}
            className="hover:text-champagne-gold transition-colors relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-champagne-gold text-primary-bg text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-primary-bg/95 backdrop-blur-xl flex flex-col">
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
            
            <div className="pt-6 mt-2 border-t border-white/10 flex flex-col space-y-6">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl text-champagne-gold hover:text-white transition-colors flex items-center gap-3"
              >
                <User size={24} />
                {isAuthenticated
                  ? `My Account${user?.name ? ` (${user.name.split(" ")[0]})` : ""}`
                  : "Login / Sign In"}
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl text-warm-ivory hover:text-champagne-gold transition-colors flex items-center gap-3"
              >
                <Heart size={24} /> Wishlist
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
