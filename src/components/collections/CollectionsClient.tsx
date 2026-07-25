"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, SlidersHorizontal, Search, ArrowUpRight, Check, Star, RefreshCw } from "lucide-react";
import { ProductDetail, Category } from "@/lib/data";
import { useCartStore } from "@/store/cartStore";

interface CollectionsClientProps {
  initialProducts: ProductDetail[];
  categories: Category[];
  initialCategory?: string;
}

export default function CollectionsClient({
  initialProducts,
  categories,
  initialCategory = "all",
}: CollectionsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addedCartId, setAddedCartId] = useState<string | number | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const addItemToCart = useCartStore((state) => state.addItem);

  const [productsList, setProductsList] = useState<ProductDetail[]>(initialProducts);
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  const fallbackImages = [
    "/images/products/MI0036/MI0036-1.png",
    "/images/products/MI0016/MI0016-1 Green.png",
    "/images/products/MI0027/MI0027-1.png",
    "/images/products/MI0030/MI0030-1.png",
    "/images/products/MI0008/MI0008-1.png",
    "/images/products/MI0035/MI0035-1.png",
    "/images/products/MI0037/MI0037-1.png",
    "/images/products/MI0010/MI0010-1.png",
  ];

  // Real-time client-side sync from Hostinger WooCommerce REST API
  useEffect(() => {
    async function fetchLiveWooCommerce() {
      setIsLiveSyncing(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com/";
        const ck = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "ck_3c548d2a91ef1197b0fa08b8eead4f160c363f99";
        const cs = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "cs_d9364182aa414c4a236ecdd73a250cb401c081ca";

        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

        // Fetch Live Products from WooCommerce REST API
        const prodRes = await fetch(
          `${cleanBaseUrl}wp-json/wc/v3/products?consumer_key=${ck}&consumer_secret=${cs}&per_page=50`
        );
        if (prodRes.ok) {
          const wcProds = await prodRes.json();
          if (Array.isArray(wcProds) && wcProds.length > 0) {
            const transformed = wcProds.map((p: any, idx: number) => {
              const sellingPrice = p.sale_price || p.price;
              const mrp = p.regular_price || sellingPrice;
              const fmt = (n: string) => n ? `₹${parseFloat(n).toLocaleString('en-IN')}` : undefined;
              return ({
                id: p.id,
                slug: p.slug || String(p.id),
                name: p.name,
                price: fmt(sellingPrice) || "₹850",
                originalPrice: mrp ? fmt(mrp) : undefined,
              category: p.categories && p.categories.length > 0 ? p.categories[0].name : "Jewellery",
              isBestSeller: true,
              rating: 4.9,
              reviewCount: 32,
              shortDescription: p.short_description ? p.short_description.replace(/<[^>]*>?/gm, "") : "Luxury piece",
              description: p.description ? p.description.replace(/<[^>]*>?/gm, "") : "Artisan jewelry",
              images: p.images && p.images.length > 0 ? p.images.map((img: any) => img.src) : [fallbackImages[idx % fallbackImages.length]],
              specs: {
                material: "925 Sterling Silver / High-grade Brass",
                plating: "High-Grade Finish",
                stone: "Grade AAA Cubic Zirconia",
                weight: "4.5 grams",
                waterResistant: "Water Resistant",
                antiTarnish: "100% Anti-Tarnish",
                hypoallergenic: "Nickel-Free",
              },
              features: ["High-Grade Finish", "100% Anti-tarnish"],
              inStock: true,
            });
          });
            setProductsList(transformed);
          }
        }

        // Fetch Live Categories from WooCommerce REST API
        const catRes = await fetch(
          `${cleanBaseUrl}wp-json/wc/v3/products/categories?consumer_key=${ck}&consumer_secret=${cs}&per_page=50&hide_empty=true`
        );
        if (catRes.ok) {
          const wcCats = await catRes.json();
          if (Array.isArray(wcCats) && wcCats.length > 0) {
            const filteredCats = wcCats
              .filter((c: any) => c.slug !== "uncategorized" && c.name.toLowerCase() !== "uncategorized" && c.count > 0)
              .map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                count: c.count,
              }));
            setCategoriesList([
              { id: "all", name: "All", slug: "all", count: productsList.length },
              ...filteredCats,
            ]);
          }
        }
      } catch (err) {
        console.log("Client live WooCommerce sync active", err);
      } finally {
        setIsLiveSyncing(false);
      }
    }

    fetchLiveWooCommerce();
  }, []);

  const toggleWishlist = (id: string | number) => {
    const strId = String(id);
    if (wishlist.includes(strId)) {
      setWishlist(wishlist.filter((i) => i !== strId));
    } else {
      setWishlist([...wishlist, strId]);
    }
  };

  const handleQuickAdd = (id: string | number) => {
    setAddedCartId(id);
    const product = productsList.find(p => p.id === id);
    if (product) {
      addItemToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || "",
        quantity: 1,
        color: "Standard",
      });
    }
    setTimeout(() => setAddedCartId(null), 2000);
  };

  const parsePrice = (priceStr: string) => Number(priceStr.replace(/[^0-9]/g, "")) || 0;

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((product) => {
        // Category Filter
        if (selectedCategory !== "all") {
          const matchWcCategory = product.category.toLowerCase() === selectedCategory.toLowerCase();
          const matchSlug = selectedCategory.toLowerCase().includes(product.category.toLowerCase());
          if (!matchWcCategory && !matchSlug) return false;
        }
        // Search Query Filter
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const nameMatch = product.name.toLowerCase().includes(query);
          const catMatch = product.category.toLowerCase().includes(query);
          const descMatch = product.shortDescription?.toLowerCase().includes(query);
          if (!nameMatch && !catMatch && !descMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return parsePrice(a.price) - parsePrice(b.price);
        }
        if (sortBy === "price-desc") {
          return parsePrice(b.price) - parsePrice(a.price);
        }
        if (sortBy === "newest") {
          return a.isNewArrival ? -1 : 1;
        }
        return 0; // Featured order
      });
  }, [productsList, selectedCategory, searchQuery, sortBy]);

  // Filter valid categories (hide Uncategorized & 0 count items except 'all')
  const validCategories = useMemo(() => {
    return categoriesList.filter(
      (cat) =>
        String(cat.slug || cat.id).toLowerCase() !== "uncategorized" &&
        cat.name.toLowerCase() !== "uncategorized" &&
        (cat.count === undefined || cat.count > 0 || String(cat.id).toLowerCase() === "all")
    );
  }, [categoriesList]);

  return (
    <div className="w-full">
      {/* Category Pills & Search Bar Controls */}
      <div className="mb-12 space-y-6">
        
        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2 pt-1">
          {validCategories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === String(cat.slug || cat.id).toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.slug || cat.id))}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-2 flex-shrink-0 ${
                  isActive
                    ? "bg-champagne-gold text-luxury-black shadow-lg scale-105"
                    : "bg-white/5 border border-white/10 text-warm-ivory/80 hover:border-champagne-gold/40 hover:text-warm-ivory"
                }`}
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? "bg-luxury-black/20 text-luxury-black" : "bg-white/10 text-muted-text"
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" size={18} />
            <input
              type="text"
              placeholder="Search products by name or stone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-luxury-brown border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-warm-ivory placeholder:text-muted-text focus:outline-none focus:border-champagne-gold"
            />
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-muted-text font-light flex items-center gap-1.5">
              Showing <strong className="text-champagne-gold">{filteredProducts.length}</strong> items
              {isLiveSyncing && (
                <span title="Syncing live products from WooCommerce...">
                  <RefreshCw size={12} className="animate-spin text-champagne-gold ml-1" />
                </span>
              )}
            </span>

            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-luxury-brown border border-white/10 rounded-xl px-3 py-2">
              <SlidersHorizontal size={14} className="text-champagne-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs uppercase tracking-wider text-warm-ivory focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-luxury-brown text-warm-ivory">Sort: Featured</option>
                <option value="price-asc" className="bg-luxury-brown text-warm-ivory">Price: Low to High</option>
                <option value="price-desc" className="bg-luxury-brown text-warm-ivory">Price: High to Low</option>
                <option value="newest" className="bg-luxury-brown text-warm-ivory">Sort: Newest First</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white/5 border border-white/10 rounded-2xl p-8">
          <p className="text-xl font-serif text-warm-ivory mb-2">No products found</p>
          <p className="text-sm text-muted-text max-w-md mx-auto font-light mb-6">
            We couldn't find any pieces matching your filter criteria. Try clearing search or choosing another category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-6 py-2.5 rounded-xl bg-champagne-gold text-primary-bg font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => {
              const strId = String(product.id);
              const isWish = wishlist.includes(strId);
              const isAdded = addedCartId === product.id;
              const fallbackIdx = index % fallbackImages.length;

              const hasErr1 = imgErrors[`${product.id}-1`];
              const hasErr2 = imgErrors[`${product.id}-2`];

              const src1 = hasErr1 ? fallbackImages[fallbackIdx] : product.images[0];
              const src2 = hasErr2 ? fallbackImages[(fallbackIdx + 1) % fallbackImages.length] : (product.images[1] || src1);

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-white/5 border border-white/10 hover:border-champagne-gold/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-luxury-brown mb-4">
                      <Link href={`/product/${product.id}`}>
                        <Image
                          src={src1}
                          alt={product.name}
                          fill
                          onError={() => setImgErrors((prev) => ({ ...prev, [`${product.id}-1`]: true }))}
                          className={`object-cover transition-all duration-700 ${
                            src2 ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
                          }`}
                        />
                        {src2 && (
                          <Image
                            src={src2}
                            alt={product.name}
                            fill
                            onError={() => setImgErrors((prev) => ({ ...prev, [`${product.id}-2`]: true }))}
                            className="object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                          />
                        )}
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        {product.isBestSeller && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-champagne-gold text-luxury-black">
                            Bestseller
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-md text-warm-ivory border border-white/20">
                            New
                          </span>
                        )}
                      </div>

                      {/* Floating Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md ${
                          isWish
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-primary-bg/70 text-warm-ivory hover:text-champagne-gold hover:bg-white/20 border border-white/10"
                        }`}
                      >
                        <Heart size={16} className={isWish ? "fill-red-500" : ""} />
                      </button>

                      {/* Quick View Button overlay */}
                      <Link
                        href={`/product/${product.id}`}
                        className="absolute bottom-3 left-3 right-3 py-2.5 rounded-lg bg-primary-bg/90 backdrop-blur-md text-champagne-gold hover:text-white hover:bg-primary-bg text-xs font-semibold uppercase tracking-wider text-center transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 border border-white/10"
                      >
                        View Product <ArrowUpRight size={14} />
                      </Link>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-champagne-gold font-semibold">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1 text-champagne-gold text-xs">
                        <Star size={12} className="fill-champagne-gold" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-serif text-lg text-warm-ivory group-hover:text-champagne-gold transition-colors mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Price & Add to Bag Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                    <div>
                      {product.originalPrice && (
                        <span className="text-xs text-warm-ivory/50 block font-medium line-through">
                          {product.originalPrice}
                        </span>
                      )}
                      <span className="text-xl font-bold text-warm-ivory">
                        {product.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQuickAdd(product.id)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isAdded
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white/5 border-white/15 text-warm-ivory hover:bg-champagne-gold hover:text-luxury-black hover:border-champagne-gold"
                      }`}
                      title="Add to Shopping Bag"
                    >
                      {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
