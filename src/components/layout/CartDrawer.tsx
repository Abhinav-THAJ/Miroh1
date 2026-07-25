"use client";

import { useEffect, useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const parseNum = (p: string) => Number(p?.replace(/[^0-9.]/g, "") || 0);

  const subtotal = items.reduce((acc, item) => {
    return acc + parseNum(item.price) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-primary-bg z-[100] shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-white/10 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-champagne-gold" size={24} />
            <h2 className="text-lg font-serif text-warm-ivory">Your Shopping Bag</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-warm-ivory hover:text-champagne-gold transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-text space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="font-light">Your shopping bag is empty.</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 border border-champagne-gold/50 text-champagne-gold rounded-full text-sm hover:bg-champagne-gold/10 transition-colors uppercase tracking-widest mt-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.color}`} className="flex gap-4 border-b border-white/5 pb-6">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-warm-ivory leading-tight mb-1">{item.name}</h3>
                    {item.color && (
                      <p className="text-xs text-muted-text mb-2">Color: {item.color}</p>
                    )}
                    <p className="text-champagne-gold text-sm font-semibold">{item.price}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-white/10 rounded-md bg-white/5">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.color)}
                        className="p-1.5 text-warm-ivory hover:text-champagne-gold transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-medium text-warm-ivory">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color)}
                        className="p-1.5 text-warm-ivory hover:text-champagne-gold transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.color)}
                      className="text-muted-text hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/20">
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-text">Subtotal</span>
              <span className="text-xl font-serif text-warm-ivory">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-muted-text mb-6 text-center font-light">
              Shipping & taxes calculated at checkout
            </p>
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-champagne-gold text-primary-bg rounded-xl font-medium tracking-widest uppercase text-xs hover:bg-white transition-colors shadow-lg shadow-champagne-gold/20 flex items-center justify-center gap-2"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
