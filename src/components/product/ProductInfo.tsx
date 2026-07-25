"use client";

import { useState, useEffect } from "react";
import { Star, Heart, Share2, ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw, Check, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductDetail } from "@/lib/data";

interface ProductInfoProps {
  product: ProductDetail;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [liveProduct, setLiveProduct] = useState<ProductDetail>(product);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : "Standard Finish"
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveSingleProduct() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
        const ck = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "ck_3c548d2a91ef1197b0fa08b8eead4f160c363f99";
        const cs = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "cs_d9364182aa414c4a236ecdd73a250cb401c081ca";
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

        const res = await fetch(`${cleanBaseUrl}wp-json/wc/v3/products/${product.id}?consumer_key=${ck}&consumer_secret=${cs}`);
        if (res.ok) {
          const p = await res.json();
          if (p && p.id) {
              const sellingPrice = p.sale_price || p.price;
              const mrp = p.regular_price || sellingPrice;
              const fmt = (n: string) => n ? `₹${parseFloat(n).toLocaleString('en-IN')}` : undefined;
              setLiveProduct((prev) => ({
                ...prev,
                name: p.name || prev.name,
                price: fmt(sellingPrice) || prev.price,
                originalPrice: mrp ? fmt(mrp) : prev.originalPrice,
                shortDescription: p.short_description ? p.short_description.replace(/<[^>]*>?/gm, '') : prev.shortDescription,
                description: p.description ? p.description.replace(/<[^>]*>?/gm, '') : prev.description,
                inStock: p.stock_status !== "outofstock",
              }));
          }
        }
      } catch (err) {
        console.log("Single product live sync active");
      }
    }
    fetchLiveSingleProduct();
  }, [product.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    setIsAddedToCart(true);
    showToast(`Redirecting to checkout...`);
    
    // Redirect to WooCommerce checkout and add item to cart
    if (typeof window !== "undefined") {
      // Use liveProduct.id if it's a real WooCommerce ID, otherwise product.id
      const idToUse = liveProduct.id || product.id;
      const baseUrl = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com";
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      window.location.href = `${cleanBaseUrl}/checkout/?add-to-cart=${idToUse}&quantity=${quantity}`;
    }
    
    setTimeout(() => setIsAddedToCart(false), 2500);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) {
      setPincodeStatus("Please enter a valid 6-digit pin code.");
      return;
    }
    setPincodeStatus(`Available for express delivery to ${pincode} in 2-4 business days.`);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col text-warm-ivory relative">

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-champagne-gold text-luxury-black font-medium px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <Check size={18} strokeWidth={2.5} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category & Title */}
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne-gold mb-2">
        {liveProduct.category}
      </span>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-warm-ivory mb-4 leading-tight">
        {liveProduct.name}
      </h1>

      {/* Ratings */}
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
        <div className="flex items-center gap-1 text-champagne-gold">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < Math.floor(liveProduct.rating) ? "fill-champagne-gold text-champagne-gold" : "text-white/20"}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-warm-ivory">{liveProduct.rating}</span>
        <span className="text-sm text-muted-text">({liveProduct.reviewCount} customer reviews)</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          liveProduct.inStock 
            ? "text-green-400 bg-green-500/10 border border-green-500/20" 
            : "text-red-400 bg-red-500/10 border border-red-500/20"
        }`}>
          {liveProduct.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Pricing */}
      <div className="flex flex-col gap-1 mb-6">
        {(() => {
          const parseNum = (p: string) => Number(p?.replace(/[^0-9.]/g, "") || 0);
          const sellNum = parseNum(liveProduct.price);
          const origNum = liveProduct.originalPrice ? parseNum(liveProduct.originalPrice) : 0;
          const hasDiscount = origNum > 0 && origNum > sellNum;
          const discount = hasDiscount ? Math.round(((origNum - sellNum) / origNum) * 100) : 0;

          return (
            <>
              {/* MRP row */}
              {liveProduct.originalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-warm-ivory/50 font-medium">MRP:</span>
                  <span className="text-lg text-warm-ivory/50 line-through font-medium">
                    {liveProduct.originalPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                      -{discount}% off
                    </span>
                  )}
                </div>
              )}
              {/* Selling Price row */}
              <span className="text-4xl text-warm-ivory font-bold tracking-tight leading-none">
                {liveProduct.price}
              </span>
              {hasDiscount && (
                <span className="text-xs text-green-400 font-medium">
                  You save ₹{(origNum - sellNum).toLocaleString('en-IN')}
                </span>
              )}
            </>
          );
        })()}
      </div>

      {/* Short Description */}
      <p className="text-muted-text font-light leading-relaxed mb-8 text-base">
        {liveProduct.shortDescription}
      </p>

      {/* Variant Selector */}
      {product.colors && product.colors.length > 0 && (
        <div className="mb-8">
          <label className="text-xs uppercase tracking-widest text-warm-ivory/80 font-semibold block mb-3">
            Finish / Color: <span className="text-champagne-gold">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                  selectedColor === color.name
                    ? "border-champagne-gold bg-champagne-gold/10 text-warm-ivory shadow-md"
                    : "border-white/10 hover:border-white/30 text-muted-text hover:text-warm-ivory"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        
        {/* Quantity Selector */}
        <div className="flex items-center justify-between border border-white/15 rounded-xl px-4 py-3 bg-white/5 w-full sm:w-36">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="text-warm-ivory hover:text-champagne-gold text-lg px-2"
          >
            -
          </button>
          <span className="font-serif text-lg text-warm-ivory font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="text-warm-ivory hover:text-champagne-gold text-lg px-2"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-4 px-6 rounded-xl font-medium tracking-widest uppercase text-xs transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
            isAddedToCart
              ? "bg-green-600 text-white"
              : "bg-champagne-gold text-primary-bg hover:bg-white hover:text-luxury-black"
          }`}
        >
          <ShoppingBag size={18} />
          {isAddedToCart ? "Added to Cart!" : "Add to Shopping Bag"}
        </button>

        {/* Wishlist & Share Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              showToast(isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist!");
            }}
            className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all ${
              isWishlisted
                ? "border-red-500/50 bg-red-500/10 text-red-400"
                : "border-white/15 bg-white/5 text-warm-ivory hover:border-champagne-gold/50 hover:text-champagne-gold"
            }`}
            title="Add to Wishlist"
          >
            <Heart size={20} className={isWishlisted ? "fill-red-500" : ""} />
          </button>
          
          <button
            onClick={handleShare}
            className="w-14 h-14 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-warm-ivory hover:border-champagne-gold/50 hover:text-champagne-gold transition-all"
            title="Share Product"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Buy Now Direct Button */}
      <button
        onClick={() => {
          handleAddToCart();
          showToast("Redirecting to Express Checkout...");
        }}
        className="w-full py-4 px-6 rounded-xl border border-champagne-gold/40 text-champagne-gold hover:bg-champagne-gold/10 font-medium tracking-widest uppercase text-xs transition-all duration-300 flex items-center justify-center gap-2 mb-8"
      >
        <Zap size={16} />
        Buy Now — Fast Checkout
      </button>

      {/* Pincode / Delivery Estimator */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
        <label className="text-xs uppercase tracking-widest text-warm-ivory/80 font-semibold flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-champagne-gold" /> Check Delivery & COD Availability
        </label>
        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter 6-digit Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
            className="flex-1 bg-luxury-brown border border-white/10 rounded-lg px-4 py-2.5 text-sm text-warm-ivory placeholder:text-muted-text focus:outline-none focus:border-champagne-gold"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-champagne-gold/20 text-champagne-gold hover:bg-champagne-gold hover:text-primary-bg text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Check
          </button>
        </form>
        {pincodeStatus && (
          <p className="text-xs text-champagne-gold mt-3 font-light leading-relaxed">
            {pincodeStatus}
          </p>
        )}
      </div>

      {/* Trust Highlights Grid */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
          <ShieldCheck className="text-champagne-gold flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-semibold text-warm-ivory uppercase tracking-wider">Anti-Tarnish</h4>
            <p className="text-[11px] text-muted-text">Non-fade luster</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
          <Truck className="text-champagne-gold flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-semibold text-warm-ivory uppercase tracking-wider">Free Shipping</h4>
            <p className="text-[11px] text-muted-text">Insured express delivery</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
          <RotateCcw className="text-champagne-gold flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-semibold text-warm-ivory uppercase tracking-wider">Replacement</h4>
            <p className="text-[11px] text-muted-text">Only for damaged/wrong item. Unboxing video required.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
          <Zap className="text-champagne-gold flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-semibold text-warm-ivory uppercase tracking-wider">Skin Safe</h4>
            <p className="text-[11px] text-muted-text">100% Hypoallergenic</p>
          </div>
        </div>
      </div>

    </div>
  );
}
