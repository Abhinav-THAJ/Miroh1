"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, ShoppingBag, Sparkles } from "lucide-react";
import { ProductDetail, getProductById } from "@/lib/data";
import { useCartStore } from "@/store/cartStore";

interface CompleteTheLookProps {
  currentProduct: ProductDetail;
}

export default function CompleteTheLook({ currentProduct }: CompleteTheLookProps) {
  const lookProductIds = currentProduct.completeTheLookIds || ["MI0008", "MI0030"];
  const lookProducts = lookProductIds
    .map((id) => getProductById(id))
    .filter((p): p is ProductDetail => p !== undefined && String(p.id) !== String(currentProduct.id));

  const [selectedItems, setSelectedItems] = useState<string[]>([
    String(currentProduct.id),
  ]);
  const [bundleAdded, setBundleAdded] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);

  if (lookProducts.length === 0) return null;

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Calculate total price of selected bundle items
  const parsePrice = (priceStr: string) => Number(priceStr.replace(/[^0-9]/g, "")) || 0;
  const totalPrice = [currentProduct, ...lookProducts]
    .filter((item) => selectedItems.includes(String(item.id)))
    .reduce((sum, item) => sum + parsePrice(item.price), 0);

  const handleAddBundle = () => {
    setBundleAdded(true);
    const bundleProducts = [currentProduct, ...lookProducts].filter(p => selectedItems.includes(String(p.id)));
    
    bundleProducts.forEach((product) => {
      addItemToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || "",
        quantity: 1,
        color: "Standard",
      });
    });
    
    setTimeout(() => setBundleAdded(false), 3000);
  };

  return (
    <div className="mt-20 py-16 border-t border-white/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne-gold block mb-2">
            Curated Styling
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-warm-ivory">
            Complete <span className="italic text-champagne-gold font-light">The Look</span>
          </h2>
        </div>
        <p className="text-sm text-muted-text max-w-sm mt-2 md:mt-0 font-light">
          Hand-selected by Miorah stylists to complement your piece effortlessly.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Bundle Items Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            {/* Main Item */}
            <div className="relative p-4 rounded-xl bg-luxury-brown/50 border border-champagne-gold/30">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3">
                <Image
                  src={currentProduct.images[0]}
                  alt={currentProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-champagne-gold block mb-1">
                Main Piece
              </span>
              <h4 className="font-serif text-sm text-warm-ivory line-clamp-1">{currentProduct.name}</h4>
              <p className="text-xs text-champagne-gold mt-1 font-semibold">{currentProduct.price}</p>
            </div>

            {/* Look Products */}
            {lookProducts.map((p, idx) => {
              const pId = String(p.id);
              const isSelected = selectedItems.includes(pId);
              return (
                <div key={p.id} className="relative">
                  <div
                    onClick={() => toggleItem(pId)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-luxury-brown/50 border-champagne-gold"
                        : "bg-white/[0.02] border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                      <button
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                          isSelected ? "bg-champagne-gold text-luxury-black" : "bg-primary-bg text-warm-ivory"
                        }`}
                      >
                        {isSelected ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-text block mb-1">
                      {p.category}
                    </span>
                    <Link
                      href={`/product/${p.slug || p.id}`}
                      className="font-serif text-sm text-warm-ivory hover:text-champagne-gold transition-colors line-clamp-1"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-champagne-gold mt-1 font-semibold">{p.price}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bundle Summary & One-click Add */}
          <div className="p-6 rounded-xl bg-luxury-brown border border-white/10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 text-champagne-gold mb-2">
                <Sparkles size={18} />
                <span className="text-xs uppercase tracking-widest font-semibold">Bundle Offer</span>
              </div>
              <h3 className="text-xl font-serif text-warm-ivory mb-2">Buy Together & Save</h3>
              <p className="text-xs text-muted-text font-light mb-6">
                Selected {selectedItems.length} items to elevate your ensemble.
              </p>
              
              <div className="border-t border-b border-white/10 py-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-text">Bundle Total:</span>
                  <span className="text-2xl font-serif text-warm-ivory font-bold">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddBundle}
              className={`w-full py-3.5 px-4 rounded-xl font-medium tracking-widest uppercase text-xs transition-all duration-300 flex items-center justify-center gap-2 ${
                bundleAdded
                  ? "bg-green-600 text-white"
                  : "bg-champagne-gold text-primary-bg hover:bg-white hover:text-luxury-black"
              }`}
            >
              <ShoppingBag size={16} />
              {bundleAdded ? "Bundle Added to Bag!" : `Add ${selectedItems.length} Items to Bag`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
