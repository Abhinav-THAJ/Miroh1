"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  User, Package, MapPin, Settings, Heart, LogOut,
  ArrowRight, Check, ShoppingBag, Plus, RefreshCw,
  Eye, EyeOff, Mail, Lock, Phone, Gem, AlertCircle, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

type AuthView = "login" | "register" | "forgot";
type AccountTab = "orders" | "addresses" | "settings";

// ─────────────────────────── Toast ───────────────────────────
function Toast({ message, type, onDismiss }: { message: string; type: "success" | "error"; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-24 right-6 z-[999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm ${
        type === "success"
          ? "bg-green-950/90 border-green-500/30 text-green-200"
          : "bg-red-950/90 border-red-500/30 text-red-200"
      } backdrop-blur-xl`}
    >
      {type === "success" ? <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-400" /> : <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />}
      <p className="text-sm leading-relaxed">{message}</p>
    </motion.div>
  );
}

// ─────────────────────────── Auth Panel ───────────────────────────
function AuthPanel({ onSuccess }: { onSuccess: () => void }) {
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { login, register, forgotPassword, isLoading } = useAuthStore();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      showToast(result.message, "success");
      setTimeout(onSuccess, 800);
    } else {
      showToast(result.message, "error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    const result = await register(registerForm.email, registerForm.password, registerForm.name, registerForm.phone);
    if (result.success) {
      showToast(result.message, "success");
      setTimeout(onSuccess, 800);
    } else {
      showToast(result.message, "error");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await forgotPassword(forgotEmail);
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) setView("login");
  };

  const inputClass = "w-full bg-primary-bg border border-white/10 rounded-xl px-4 py-3.5 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold transition-colors placeholder:text-muted-text/50";

  return (
    <>
      <AnimatePresence mode="popLayout">
        {toast && <Toast key="toast" message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-24">
          <div className="w-full max-w-md">
            {/* Logo / Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/30 mb-5">
                <Gem size={28} className="text-champagne-gold" />
              </div>
              <h1 className="text-3xl font-serif text-warm-ivory">
                {view === "login" ? "Welcome Back" : view === "register" ? "Create Account" : "Reset Password"}
              </h1>
              <p className="text-sm text-muted-text mt-2 font-light">
                {view === "login"
                  ? "Sign in to your Miorah account"
                  : view === "register"
                  ? "Join Miorah and unlock exclusive benefits"
                  : "We'll send a reset link to your email"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* LOGIN */}
              {view === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="bg-luxury-brown/60 border border-white/10 rounded-3xl p-8 flex flex-col gap-5 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Password</label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs text-champagne-gold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                        className={`${inputClass} pl-10 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text/50 hover:text-champagne-gold transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-champagne-gold text-luxury-black text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : null}
                    {isLoading ? "Signing In…" : "Sign In"}
                  </button>

                  <p className="text-center text-sm text-muted-text">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setView("register")} className="text-champagne-gold hover:underline font-medium">
                      Create one
                    </button>
                  </p>
                </motion.form>
              )}

              {/* REGISTER */}
              {view === "register" && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="bg-luxury-brown/60 border border-white/10 rounded-3xl p-8 flex flex-col gap-5 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50" />
                      <input
                        id="register-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Your full name"
                        value={registerForm.name}
                        onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50" />
                      <input
                        id="register-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={registerForm.email}
                        onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50" />
                      <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        value={registerForm.password}
                        onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className={`${inputClass} pl-10 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text/50 hover:text-champagne-gold transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {registerForm.password.length > 0 && (
                      <div className="h-1 rounded-full overflow-hidden bg-white/10 mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${
                            registerForm.password.length >= 12 ? "w-full bg-green-500" :
                            registerForm.password.length >= 8 ? "w-2/3 bg-yellow-500" :
                            "w-1/3 bg-red-500"
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Phone Number <span className="text-muted-text/50 normal-case">(optional)</span></label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50" />
                      <input
                        id="register-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={registerForm.phone}
                        onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <button
                    id="register-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-champagne-gold text-luxury-black text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : null}
                    {isLoading ? "Creating Account…" : "Create Account"}
                  </button>

                  <p className="text-center text-sm text-muted-text">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setView("login")} className="text-champagne-gold hover:underline font-medium">
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}

              {/* FORGOT PASSWORD */}
              {view === "forgot" && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleForgot}
                  className="bg-luxury-brown/60 border border-white/10 rounded-3xl p-8 flex flex-col gap-5 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Registered Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50" />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <button
                    id="forgot-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-champagne-gold text-luxury-black text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : null}
                    {isLoading ? "Sending…" : "Send Reset Link"}
                  </button>

                  <button type="button" onClick={() => setView("login")} className="text-center text-sm text-champagne-gold hover:underline">
                    ← Back to Sign In
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

// ─────────────────────────── Dashboard ───────────────────────────
function Dashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AccountTab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [address, setAddress] = useState({ street: "", city: "", state: "Kerala", pincode: "" });
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "", phone: "" });

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  // Fetch orders for this customer via secure server-side proxy
  useEffect(() => {
    async function fetchOrders() {
      setOrdersLoading(true);
      try {
        const res = await fetch(`/api/account/orders?customer_id=${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const formatted = data.map((ord: any) => ({
              id: `#${ord.id}`,
              date: new Date(ord.date_created).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
              status: ord.status.charAt(0).toUpperCase() + ord.status.slice(1),
              total: `₹${parseFloat(ord.total).toLocaleString("en-IN")}`,
              items: ord.line_items.map((it: any) => ({
                name: it.name,
                price: `₹${parseFloat(it.price || it.total).toLocaleString("en-IN")}`,
                image: it.image?.src || "/images/products/MI0036/MI0036-1.png",
              })),
            }));
            setOrders(formatted);
          }
        }
      } catch {
        // Silent fail — orders section will show empty state
      } finally {
        setOrdersLoading(false);
      }
    }
    if (user?.id) fetchOrders();
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAddress({ ...address });
    setIsEditingAddress(false);
    showToast("Address saved successfully.", "success");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profile updated successfully.", "success");
  };

  return (
    <>
      <AnimatePresence mode="popLayout">
        {toast && <Toast key="toast" message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
        <Navbar />

        <main className="flex-1 w-full pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* Header Banner */}
            <div className="bg-luxury-brown/60 border border-white/10 rounded-3xl p-8 sm:p-10 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
              <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="w-20 h-20 rounded-full bg-champagne-gold/10 border-2 border-champagne-gold/40 flex items-center justify-center text-champagne-gold shrink-0 shadow-lg">
                  <User size={36} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-champagne-gold bg-champagne-gold/10 px-3 py-1 rounded-full border border-champagne-gold/20">
                    Customer Account
                  </span>
                  <h1 className="text-3xl font-serif text-warm-ivory mt-2">
                    {user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "My Account"}
                  </h1>
                  <p className="text-sm text-muted-text font-light">{user?.email}</p>
                </div>
              </div>

              <button
                id="logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-xl border border-white/10 text-muted-text hover:text-red-400 hover:border-red-400/30 transition-all"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            {/* Account Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Sidebar Navigation */}
              <div className="lg:col-span-1 flex flex-col gap-2">
                {[
                  { id: "orders", label: "My Orders", icon: Package, count: orders.length },
                  { id: "addresses", label: "Saved Addresses", icon: MapPin },
                  { id: "settings", label: "Account Settings", icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id as AccountTab)}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-sm font-medium transition-all ${
                        isActive
                          ? "bg-champagne-gold text-luxury-black border-champagne-gold shadow-lg"
                          : "bg-white/5 border-white/10 text-warm-ivory/80 hover:border-white/20 hover:text-warm-ivory"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-luxury-black/20 text-luxury-black" : "bg-white/10 text-muted-text"}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}

                <Link
                  href="/wishlist"
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 text-warm-ivory/80 hover:border-champagne-gold/40 hover:text-champagne-gold text-sm font-medium transition-all mt-4"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={18} />
                    <span>My Wishlist</span>
                  </div>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Tab Content */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">

                  {/* Orders Tab */}
                  {activeTab === "orders" && (
                    <motion.div
                      key="orders"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex flex-col gap-6"
                    >
                      <h2 className="text-xl font-serif text-warm-ivory">Recent Orders</h2>

                      {ordersLoading ? (
                        <div className="py-16 text-center bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3">
                          <RefreshCw className="w-6 h-6 text-champagne-gold animate-spin" />
                          <span className="text-sm text-muted-text">Loading your orders…</span>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="py-16 text-center bg-white/5 border border-white/10 rounded-2xl p-8">
                          <ShoppingBag className="w-12 h-12 text-champagne-gold/40 mx-auto mb-4" />
                          <h3 className="text-lg font-serif text-warm-ivory mb-2">No orders placed yet</h3>
                          <p className="text-sm text-muted-text font-light mb-6">Explore our catalog and place your first luxury order.</p>
                          <Link href="/collections" className="inline-block px-6 py-3 rounded-full bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors">
                            Browse Collections
                          </Link>
                        </div>
                      ) : (
                        orders.map((order) => (
                          <div key={order.id} className="bg-luxury-brown/50 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                              <div>
                                <span className="text-xs text-muted-text uppercase tracking-widest font-semibold block">Order ID</span>
                                <span className="text-warm-ivory font-serif text-lg">{order.id}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-text uppercase tracking-widest font-semibold block">Date</span>
                                <span className="text-warm-ivory text-sm">{order.date}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-text uppercase tracking-widest font-semibold block">Total</span>
                                <span className="text-champagne-gold font-bold text-base">{order.total}</span>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
                                <Check size={12} /> {order.status}
                              </span>
                            </div>

                            <div className="flex flex-col gap-3">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4">
                                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-luxury-brown border border-white/10 shrink-0">
                                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-warm-ivory font-medium text-sm">{item.name}</h4>
                                    <span className="text-xs text-muted-text font-light">{item.price}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}

                  {/* Addresses Tab */}
                  {activeTab === "addresses" && (
                    <motion.div
                      key="addresses"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex flex-col gap-6"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-serif text-warm-ivory">Saved Addresses</h2>
                        {!isEditingAddress && (
                          <button
                            onClick={() => setIsEditingAddress(true)}
                            className="px-4 py-2 rounded-xl bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-1.5"
                          >
                            <Plus size={14} /> Add Address
                          </button>
                        )}
                      </div>

                      {isEditingAddress ? (
                        <form onSubmit={handleSaveAddress} className="bg-luxury-brown/50 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Street Address</label>
                            <input
                              type="text" required placeholder="Enter street address"
                              value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })}
                              className="bg-primary-bg border border-white/10 rounded-xl px-4 py-3 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">City</label>
                              <input type="text" required placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="bg-primary-bg border border-white/10 rounded-xl px-4 py-3 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">State</label>
                              <input type="text" required placeholder="State" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="bg-primary-bg border border-white/10 rounded-xl px-4 py-3 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Pincode</label>
                              <input type="text" required placeholder="Pincode" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} className="bg-primary-bg border border-white/10 rounded-xl px-4 py-3 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold" />
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => setIsEditingAddress(false)} className="px-4 py-2.5 rounded-xl border border-white/10 text-muted-text hover:text-warm-ivory text-xs font-semibold uppercase tracking-wider">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 rounded-xl bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors">Save Address</button>
                          </div>
                        </form>
                      ) : savedAddress ? (
                        <div className="bg-luxury-brown/50 border border-champagne-gold/40 rounded-2xl p-6 relative">
                          <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30">Default Shipping</span>
                          <p className="text-sm text-warm-ivory font-light leading-relaxed mb-4">
                            {savedAddress.street}<br />
                            {savedAddress.city}, {savedAddress.state} — {savedAddress.pincode}
                          </p>
                          <div className="flex gap-3 pt-4 border-t border-white/10">
                            <button onClick={() => setIsEditingAddress(true)} className="text-xs text-warm-ivory hover:text-champagne-gold transition-colors font-medium">Edit</button>
                            <span className="text-white/20">|</span>
                            <button onClick={() => setSavedAddress(null)} className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-16 text-center bg-white/5 border border-white/10 rounded-2xl p-8">
                          <MapPin className="w-12 h-12 text-champagne-gold/40 mx-auto mb-4" />
                          <h3 className="text-lg font-serif text-warm-ivory mb-2">No saved addresses</h3>
                          <p className="text-sm text-muted-text font-light mb-6">Add a shipping address for faster checkout.</p>
                          <button onClick={() => setIsEditingAddress(true)} className="px-6 py-3 rounded-full bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors">
                            + Add Address
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex flex-col gap-6 bg-luxury-brown/50 border border-white/10 rounded-2xl p-8"
                    >
                      <h2 className="text-xl font-serif text-warm-ivory mb-2">Profile Details</h2>

                      <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Full Name</label>
                            <input
                              type="text" placeholder="Enter your full name"
                              value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                              className="bg-primary-bg border border-white/10 rounded-xl px-4 py-3 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Email Address</label>
                            <input
                              type="email" placeholder="Enter your email address"
                              value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}
                              className="bg-primary-bg border border-white/10 rounded-xl px-4 py-3 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Phone Number</label>
                          <input
                            type="text" placeholder="Enter your phone number"
                            value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            className="bg-primary-bg border border-white/10 rounded-xl px-4 py-3 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold"
                          />
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button type="submit" className="px-6 py-3 rounded-xl bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

// ─────────────────────────── Main Page ───────────────────────────
export default function AccountPage() {
  const { isAuthenticated, checkSession, isLoading } = useAuthStore();
  const [sessionChecked, setSessionChecked] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    checkSession().finally(() => setSessionChecked(true));
  }, [checkSession]);

  if (!sessionChecked || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-champagne-gold animate-spin" />
          </div>
          <p className="text-sm text-muted-text font-light">Loading your account…</p>
        </div>
      </div>
    );
  }

  return isAuthenticated
    ? <Dashboard />
    : <AuthPanel onSuccess={() => setSessionChecked(true)} />;
}
