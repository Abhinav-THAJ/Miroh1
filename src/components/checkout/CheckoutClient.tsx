"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, CheckCircle2, User, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutClient() {
  const { items, clearCart } = useCartStore();
  const { isAuthenticated, user, checkSession } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "IN",
    payment: "ONLINE"
  });

  useEffect(() => {
    setMounted(true);
    // Always verify session on checkout page
    checkSession().finally(() => setSessionChecked(true));
  }, [checkSession]);

  // Pre-fill email and name from auth store when session is ready
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email || "",
        fullName: prev.fullName || user.name || "",
      }));

      // Also try to fetch full customer data for phone/address pre-fill
      fetch("/api/account/customer")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setFormData(prev => ({
              ...prev,
              phone: prev.phone || data.phone || data.billing?.phone || "",
              fullName: prev.fullName || `${data.first_name || ""} ${data.last_name || ""}`.trim() || user.name || "",
              address: prev.address || data.billing?.address_1 || "",
              city: prev.city || data.billing?.city || "",
              state: prev.state || data.billing?.state || "",
              zip: prev.zip || data.billing?.postcode || "",
              country: prev.country || data.billing?.country || "IN",
            }));
          }
        })
        .catch(() => { /* ignore */ });
    }
  }, [isAuthenticated, user]);

  if (!mounted || !sessionChecked) return null;

  const parseNum = (p: string) => Number(p?.replace(/[^0-9.]/g, "") || 0);
  const subtotal = items.reduce((acc, item) => acc + parseNum(item.price) * item.quantity, 0);
  const shipping = 100; // Flat rate shipping
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      router.push("/account?redirect=/checkout");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items,
          customer_id: user?.id,
          contact: { email: formData.email, phone: formData.phone },
          shipping: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
          },
          payment: formData.payment,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to process order.");
      }
      
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error(error);
      alert("There was an issue processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-serif text-warm-ivory mb-4">Thank You!</h1>
        <p className="text-muted-text max-w-md mx-auto mb-10 font-light leading-relaxed">
          Your order has been successfully placed. We have sent a confirmation email with your order details.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/account"
            className="px-8 py-4 bg-luxury-brown border border-champagne-gold/30 text-champagne-gold rounded-xl font-medium tracking-widest uppercase text-sm hover:bg-champagne-gold hover:text-primary-bg transition-colors"
          >
            View My Orders
          </Link>
          <Link 
            href="/"
            className="px-8 py-4 bg-champagne-gold text-primary-bg rounded-xl font-medium tracking-widest uppercase text-sm hover:bg-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-4xl font-serif text-warm-ivory mb-6">Your Cart is Empty</h1>
        <Link 
          href="/collections"
          className="px-8 py-4 bg-champagne-gold text-primary-bg rounded-xl font-medium tracking-widest uppercase text-sm hover:bg-white transition-colors"
        >
          Discover Collections
        </Link>
      </div>
    );
  }

  const inputCls = "w-full bg-luxury-brown/50 border border-white/10 rounded-xl px-5 py-4 text-warm-ivory placeholder:text-muted-text focus:outline-none focus:border-champagne-gold transition-colors";

  return (
    <div className="container mx-auto px-4 lg:px-8">
      <div className="mb-12 text-center md:text-left border-b border-white/10 pb-6">
        <h1 className="text-3xl md:text-4xl font-serif text-warm-ivory">Secure Checkout</h1>

        {/* Auth Status Banner */}
        <div className="mt-4">
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
              <User size={14} />
              <span>Checking out as <strong>{user?.name || user?.email}</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-champagne-gold/10 border border-champagne-gold/20 rounded-xl text-sm">
              <LogIn size={14} className="text-champagne-gold" />
              <span className="text-warm-ivory/80">Have an account?</span>
              <Link href="/account?redirect=/checkout" className="text-champagne-gold font-semibold hover:underline">
                Sign in for faster checkout
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Left Column: Forms */}
        <div className="flex-1 order-2 lg:order-1">
          <form onSubmit={handlePlaceOrder} className="space-y-12">
            
            {/* Contact Info */}
            <section>
              <h2 className="text-xl font-serif text-warm-ivory mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-champagne-gold/10 text-champagne-gold flex items-center justify-center text-sm font-bold border border-champagne-gold/30">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <input required name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className={inputCls} />
                </div>
                <div>
                  <input required name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" className={inputCls} />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-xl font-serif text-warm-ivory mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-champagne-gold/10 text-champagne-gold flex items-center justify-center text-sm font-bold border border-champagne-gold/30">2</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <input required name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" className={inputCls} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <input required name="address" type="text" value={formData.address} onChange={handleInputChange} placeholder="Street Address, Appt, Suite" className={inputCls} />
                </div>
                <div>
                  <input required name="city" type="text" value={formData.city} onChange={handleInputChange} placeholder="City" className={inputCls} />
                </div>
                <div>
                  <input required name="state" type="text" value={formData.state} onChange={handleInputChange} placeholder="State / Province" className={inputCls} />
                </div>
                <div>
                  <input required name="zip" type="text" value={formData.zip} onChange={handleInputChange} placeholder="PIN / ZIP Code" className={inputCls} />
                </div>
                <div>
                  <select required name="country" value={formData.country} onChange={handleInputChange} className={`${inputCls} appearance-none`}>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AE">UAE</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-xl font-serif text-warm-ivory mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-champagne-gold/10 text-champagne-gold flex items-center justify-center text-sm font-bold border border-champagne-gold/30">3</span>
                Payment
              </h2>
              <div className="p-6 rounded-xl border border-champagne-gold/50 bg-champagne-gold/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="accent-champagne-gold w-4 h-4" />
                    <span className="text-warm-ivory font-medium">Online Payment</span>
                  </label>
                </div>
                <p className="text-sm text-muted-text ml-7 font-light">Pay securely online via credit card, debit card, or UPI.</p>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-6">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-champagne-gold text-primary-bg rounded-xl font-bold tracking-widest uppercase text-sm hover:bg-white transition-all shadow-xl shadow-champagne-gold/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Processing Order...</span>
                ) : (
                  <>
                    <Lock size={18} /> Place Order - ₹{total.toLocaleString('en-IN')}
                  </>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-text font-light">
                <ShieldCheck size={16} className="text-green-400" />
                <span>Your connection is securely encrypted.</span>
              </div>
            </div>
            
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[450px] order-1 lg:order-2">
          <div className="sticky top-32 p-8 rounded-2xl bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-serif text-warm-ivory mb-6 pb-4 border-b border-white/10">Order Summary</h3>
            
            <div className="flex flex-col gap-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={`${item.id}-${item.color}`} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-2 -right-2 bg-champagne-gold text-primary-bg w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 border-2 border-[#1c1a19]">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-sm font-medium text-warm-ivory leading-tight mb-1">{item.name}</h4>
                    {item.color && <p className="text-xs text-muted-text mb-2">Color: {item.color}</p>}
                    <p className="text-champagne-gold text-sm font-medium">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10 mb-6 text-sm">
              <div className="flex justify-between text-muted-text">
                <span>Subtotal</span>
                <span className="text-warm-ivory">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted-text">
                <span>Shipping</span>
                <span className="text-warm-ivory">₹{shipping}</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-6 border-t border-white/10">
              <span className="text-warm-ivory font-medium">Total</span>
              <div className="text-right">
                <span className="text-xs text-muted-text block mb-1">INR</span>
                <span className="text-3xl font-serif text-champagne-gold">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
