"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  User, Package, MapPin, Settings, Heart, LogOut,
  ArrowRight, Check, ShoppingBag, RefreshCw,
  Eye, EyeOff, Mail, Lock, Phone, Gem, AlertCircle,
  CheckCircle, CreditCard, Truck, Tag, ChevronDown,
  ChevronUp, Edit2, X, AtSign, UserCheck, UserX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, RegisterData } from "@/store/authStore";

type AuthView = "login" | "register" | "forgot";
type AccountTab = "orders" | "addresses" | "settings";

// ─────────────────────────── Toast ───────────────────────────
function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      className={`fixed top-24 right-6 z-[999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm ${
        type === "success"
          ? "bg-green-950/95 border-green-500/30 text-green-200"
          : "bg-red-950/95 border-red-500/30 text-red-200"
      } backdrop-blur-xl`}
    >
      {type === "success" ? (
        <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-400" />
      ) : (
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
      )}
      <p className="text-sm leading-relaxed">{message}</p>
      <button onClick={onDismiss} className="ml-auto shrink-0 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─────────────────────────── Input Field ───────────────────────────
function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  suffix,
  hint,
  error,
  required,
  autoComplete,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: any;
  suffix?: React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs uppercase tracking-widest text-muted-text font-semibold">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50 pointer-events-none"
          />
        )}
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-primary-bg border rounded-xl text-warm-ivory text-sm transition-colors placeholder:text-muted-text/50 focus:outline-none focus:border-champagne-gold ${
            Icon ? "pl-10" : "pl-4"
          } ${suffix ? "pr-10" : "pr-4"} py-3.5 ${
            error ? "border-red-500/60" : "border-white/10"
          }`}
        />
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-text/60 font-light">{hint}</p>
      )}
    </div>
  );
}

// ─────────────────────────── Password Strength ───────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength =
    password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)
      ? 4
      : password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)
      ? 3
      : password.length >= 8
      ? 2
      : 1;

  const labels = ["", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-400", "bg-green-500"];

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= strength ? colors[strength] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${colors[strength].replace("bg-", "text-")}`}>
        {labels[strength]}
      </span>
    </div>
  );
}

// ─────────────────────────── Auth Panel ───────────────────────────
function AuthPanel({
  onSuccess,
  redirectUrl,
}: {
  onSuccess: () => void;
  redirectUrl?: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<AuthView>("login");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { login, register, forgotPassword, checkEmailExists, checkUsernameExists, isLoading } =
    useAuthStore();

  // Login form
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "", showPwd: false });

  // Register form
  const [regForm, setRegForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    showPwd: false,
    showConfirm: false,
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const doRedirect = (delay = 600) => {
    if (redirectUrl) setTimeout(() => router.push(redirectUrl), delay);
    else setTimeout(onSuccess, delay + 200);
  };

  // Real-time email check (debounced)
  const emailCheckTimer = useRef<NodeJS.Timeout | null>(null);
  const handleEmailChange = (val: string) => {
    setRegForm((p) => ({ ...p, email: val }));
    setRegErrors((p) => ({ ...p, email: "" }));
    if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
    emailCheckTimer.current = setTimeout(async () => {
      setCheckingEmail(true);
      const exists = await checkEmailExists(val);
      setCheckingEmail(false);
      if (exists) {
        setRegErrors((p) => ({
          ...p,
          email: "This email address is already registered. Please log in or use another email.",
        }));
      }
    }, 600);
  };

  // Real-time username check (debounced)
  const usernameCheckTimer = useRef<NodeJS.Timeout | null>(null);
  const handleUsernameChange = (val: string) => {
    setRegForm((p) => ({ ...p, username: val }));
    setRegErrors((p) => ({ ...p, username: "" }));
    if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);
    if (!val || val.length < 3) return;
    usernameCheckTimer.current = setTimeout(async () => {
      setCheckingUsername(true);
      const exists = await checkUsernameExists(val);
      setCheckingUsername(false);
      if (exists) {
        setRegErrors((p) => ({
          ...p,
          username: "This username is already taken. Please choose another username.",
        }));
      }
    }, 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.identifier);
    const result = await login(loginForm.identifier, loginForm.password, isEmail);
    if (result.success) {
      showToast(result.message, "success");
      doRedirect();
    } else {
      showToast(result.message, "error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (regForm.password !== regForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (Object.values(regErrors).some(Boolean)) {
      showToast("Please fix the errors before submitting.", "error");
      return;
    }
    if (Object.values(errors).length) {
      setRegErrors((p) => ({ ...p, ...errors }));
      return;
    }

    const data: RegisterData = {
      firstName: regForm.firstName,
      lastName: regForm.lastName,
      username: regForm.username,
      email: regForm.email,
      password: regForm.password,
      confirmPassword: regForm.confirmPassword,
      phone: regForm.phone,
    };

    const result = await register(data);
    if (result.success) {
      showToast(result.message, "success");
      doRedirect();
    } else {
      showToast(result.message, "error");
      // Highlight field-specific errors
      if (result.message.includes("email")) {
        setRegErrors((p) => ({ ...p, email: result.message }));
      } else if (result.message.includes("username")) {
        setRegErrors((p) => ({ ...p, username: result.message }));
      }
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await forgotPassword(forgotEmail);
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) setView("login");
  };

  const inputCard =
    "bg-luxury-brown/60 border border-white/10 rounded-3xl p-8 flex flex-col gap-5 backdrop-blur-md";
  const btnPrimary =
    "w-full py-3.5 rounded-xl bg-champagne-gold text-luxury-black text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  return (
    <>
      <AnimatePresence mode="popLayout">
        {toast && (
          <Toast key="toast" message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-24">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/30 mb-5">
                <Gem size={28} className="text-champagne-gold" />
              </div>
              <h1 className="text-3xl font-serif text-warm-ivory">
                {view === "login"
                  ? "Welcome Back"
                  : view === "register"
                  ? "Create Account"
                  : "Reset Password"}
              </h1>
              <p className="text-sm text-muted-text mt-2 font-light">
                {view === "login"
                  ? "Sign in to your Miorah account"
                  : view === "register"
                  ? "Join Miorah and unlock exclusive benefits"
                  : "Enter your email to receive a reset link"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* ── LOGIN ── */}
              {view === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className={inputCard}
                >
                  <Field
                    id="login-identifier"
                    label="Email or Username"
                    placeholder="you@example.com or username"
                    value={loginForm.identifier}
                    onChange={(v) => setLoginForm((p) => ({ ...p, identifier: v }))}
                    icon={Mail}
                    required
                    autoComplete="username"
                  />

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs text-champagne-gold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50"
                      />
                      <input
                        id="login-password"
                        type={loginForm.showPwd ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm((p) => ({ ...p, password: e.target.value }))
                        }
                        className="w-full bg-primary-bg border border-white/10 rounded-xl pl-10 pr-11 py-3.5 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold transition-colors placeholder:text-muted-text/50"
                      />
                      <button
                        type="button"
                        onClick={() => setLoginForm((p) => ({ ...p, showPwd: !p.showPwd }))}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text/50 hover:text-champagne-gold transition-colors"
                      >
                        {loginForm.showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button id="login-submit" type="submit" disabled={isLoading} className={btnPrimary}>
                    {isLoading ? <RefreshCw size={15} className="animate-spin" /> : null}
                    {isLoading ? "Signing In…" : "Sign In"}
                  </button>

                  <p className="text-center text-sm text-muted-text">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setView("register")}
                      className="text-champagne-gold hover:underline font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── REGISTER ── */}
              {view === "register" && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className={`${inputCard} gap-4`}
                >
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      id="reg-firstname"
                      label="First Name"
                      placeholder="First"
                      value={regForm.firstName}
                      onChange={(v) => setRegForm((p) => ({ ...p, firstName: v }))}
                      icon={User}
                      required
                      autoComplete="given-name"
                      error={regErrors.firstName}
                    />
                    <Field
                      id="reg-lastname"
                      label="Last Name"
                      placeholder="Last"
                      value={regForm.lastName}
                      onChange={(v) => setRegForm((p) => ({ ...p, lastName: v }))}
                      required
                      autoComplete="family-name"
                      error={regErrors.lastName}
                    />
                  </div>

                  {/* Username */}
                  <Field
                    id="reg-username"
                    label="Username"
                    placeholder="your_username"
                    value={regForm.username}
                    onChange={handleUsernameChange}
                    icon={AtSign}
                    required
                    autoComplete="username"
                    hint="3–30 chars, letters, numbers, _ . - only"
                    error={regErrors.username}
                    suffix={
                      checkingUsername ? (
                        <RefreshCw size={14} className="animate-spin text-muted-text/60" />
                      ) : regForm.username.length >= 3 && !regErrors.username ? (
                        <UserCheck size={14} className="text-green-400" />
                      ) : regErrors.username ? (
                        <UserX size={14} className="text-red-400" />
                      ) : null
                    }
                  />

                  {/* Email */}
                  <Field
                    id="reg-email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={regForm.email}
                    onChange={handleEmailChange}
                    icon={Mail}
                    required
                    autoComplete="email"
                    error={regErrors.email}
                    suffix={
                      checkingEmail ? (
                        <RefreshCw size={14} className="animate-spin text-muted-text/60" />
                      ) : regForm.email && !regErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email) ? (
                        <Check size={14} className="text-green-400" />
                      ) : null
                    }
                  />

                  {/* Phone */}
                  <Field
                    id="reg-phone"
                    label="Phone Number"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX (optional)"
                    value={regForm.phone}
                    onChange={(v) => setRegForm((p) => ({ ...p, phone: v }))}
                    icon={Phone}
                    autoComplete="tel"
                  />

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50"
                      />
                      <input
                        id="reg-password"
                        type={regForm.showPwd ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        value={regForm.password}
                        onChange={(e) =>
                          setRegForm((p) => ({ ...p, password: e.target.value }))
                        }
                        className="w-full bg-primary-bg border border-white/10 rounded-xl pl-10 pr-11 py-3.5 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold transition-colors placeholder:text-muted-text/50"
                      />
                      <button
                        type="button"
                        onClick={() => setRegForm((p) => ({ ...p, showPwd: !p.showPwd }))}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text/50 hover:text-champagne-gold transition-colors"
                      >
                        {regForm.showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <PasswordStrength password={regForm.password} />
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/50"
                      />
                      <input
                        id="reg-confirm-password"
                        type={regForm.showConfirm ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        value={regForm.confirmPassword}
                        onChange={(e) => {
                          setRegForm((p) => ({ ...p, confirmPassword: e.target.value }));
                          if (regErrors.confirmPassword)
                            setRegErrors((p) => ({ ...p, confirmPassword: "" }));
                        }}
                        className={`w-full bg-primary-bg border rounded-xl pl-10 pr-11 py-3.5 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold transition-colors placeholder:text-muted-text/50 ${
                          regErrors.confirmPassword ? "border-red-500/60" : "border-white/10"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setRegForm((p) => ({ ...p, showConfirm: !p.showConfirm }))
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text/50 hover:text-champagne-gold transition-colors"
                      >
                        {regForm.showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {regErrors.confirmPassword && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle size={11} /> {regErrors.confirmPassword}
                      </p>
                    )}
                    {!regErrors.confirmPassword &&
                      regForm.confirmPassword &&
                      regForm.password === regForm.confirmPassword && (
                        <p className="text-xs text-green-400 flex items-center gap-1.5">
                          <CheckCircle size={11} /> Passwords match
                        </p>
                      )}
                  </div>

                  <button
                    id="register-submit"
                    type="submit"
                    disabled={isLoading || checkingEmail || checkingUsername || !!Object.values(regErrors).find(Boolean)}
                    className={btnPrimary}
                  >
                    {isLoading ? <RefreshCw size={15} className="animate-spin" /> : null}
                    {isLoading ? "Creating Account…" : "Create Account"}
                  </button>

                  <p className="text-center text-sm text-muted-text">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="text-champagne-gold hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── FORGOT PASSWORD ── */}
              {view === "forgot" && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleForgot}
                  className={inputCard}
                >
                  <Field
                    id="forgot-email"
                    label="Registered Email"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={setForgotEmail}
                    icon={Mail}
                    required
                  />

                  <button id="forgot-submit" type="submit" disabled={isLoading} className={btnPrimary}>
                    {isLoading ? <RefreshCw size={15} className="animate-spin" /> : null}
                    {isLoading ? "Sending…" : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="text-center text-sm text-champagne-gold hover:underline"
                  >
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

// ─────────────────────────── Status Badge ───────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/-/g, " ");
  const map: Record<string, string> = {
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "on hold": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  const cls = map[s] || "bg-white/10 text-muted-text border-white/10";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cls} flex items-center gap-1.5 capitalize`}>
      <Check size={11} /> {s}
    </span>
  );
}

// ─────────────────────────── Order Card ───────────────────────────
function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-luxury-brown/50 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex flex-wrap gap-5">
            <div>
              <span className="text-[10px] text-muted-text uppercase tracking-widest block mb-1">Order</span>
              <span className="text-warm-ivory font-serif text-lg">#{order.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-text uppercase tracking-widest block mb-1">Date</span>
              <span className="text-warm-ivory text-sm">{order.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-text uppercase tracking-widest block mb-1">Total</span>
              <span className="text-champagne-gold font-bold">{order.total}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-muted-text hover:text-champagne-gold transition-colors"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-luxury-brown border border-white/10 shrink-0">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-warm-ivory font-medium text-sm truncate">{item.name}</h4>
                <span className="text-xs text-muted-text">Qty: {item.quantity} · {item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-white/10 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {order.billing?.address_1 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={13} className="text-champagne-gold" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-champagne-gold">Billing</span>
                  </div>
                  <p className="text-sm text-warm-ivory/80 font-light leading-relaxed">
                    {order.billing.first_name} {order.billing.last_name}<br />
                    {order.billing.address_1}{order.billing.address_2 ? `, ${order.billing.address_2}` : ""}<br />
                    {order.billing.city}, {order.billing.state} {order.billing.postcode}<br />
                    {order.billing.country}
                  </p>
                </div>
              )}
              {order.shipping?.address_1 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={13} className="text-champagne-gold" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-champagne-gold">Shipping</span>
                  </div>
                  <p className="text-sm text-warm-ivory/80 font-light leading-relaxed">
                    {order.shipping.first_name} {order.shipping.last_name}<br />
                    {order.shipping.address_1}{order.shipping.address_2 ? `, ${order.shipping.address_2}` : ""}<br />
                    {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}<br />
                    {order.shipping.country}
                  </p>
                </div>
              )}
              <div className="sm:col-span-2 bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={13} className="text-champagne-gold" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-champagne-gold">Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  {parseFloat(order.discount_total) > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span><span>-{order.discount_display}</span>
                    </div>
                  )}
                  {parseFloat(order.shipping_total) > 0 && (
                    <div className="flex justify-between text-warm-ivory/70">
                      <span>Shipping</span><span>{order.shipping_display}</span>
                    </div>
                  )}
                  {parseFloat(order.total_tax) > 0 && (
                    <div className="flex justify-between text-warm-ivory/70">
                      <span>Tax</span><span>{order.tax_display}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-warm-ivory font-semibold border-t border-white/10 pt-2">
                    <span>Total</span>
                    <span className="text-champagne-gold">{order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────── Dashboard ───────────────────────────
function Dashboard() {
  const { user, logout, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AccountTab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [billingForm, setBillingForm] = useState<any>({});
  const [shippingForm, setShippingForm] = useState<any>({});
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const fetchCustomerData = useCallback(async () => {
    setCustomerLoading(true);
    try {
      const res = await fetch("/api/account/customer");
      if (res.ok) {
        const data = await res.json();
        setCustomerData(data);
        setProfileForm({
          first_name: data.first_name || user?.firstName || "",
          last_name: data.last_name || user?.lastName || "",
          email: data.email || user?.email || "",
          phone: data.phone || data.billing?.phone || "",
        });
        setBillingForm(data.billing || {});
        setShippingForm(data.shipping || {});
      }
    } catch { /* silent */ }
    finally { setCustomerLoading(false); }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/account/orders");
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) {
          const fmt = (n: string) => `₹${parseFloat(n || "0").toLocaleString("en-IN")}`;
          setOrders(
            raw.map((o: any) => ({
              id: o.id,
              date: new Date(o.date_created).toLocaleDateString("en-IN", {
                year: "numeric", month: "long", day: "numeric",
              }),
              status: o.status,
              total: fmt(o.total),
              discount_total: o.discount_total || "0",
              discount_display: fmt(o.discount_total),
              shipping_total: o.shipping_total || "0",
              shipping_display: fmt(o.shipping_total),
              total_tax: o.total_tax || "0",
              tax_display: fmt(o.total_tax),
              billing: o.billing,
              shipping: o.shipping,
              items: (o.line_items || []).map((it: any) => ({
                name: it.name,
                price: fmt(it.total),
                quantity: it.quantity,
                image: it.image?.src || "",
              })),
            }))
          );
        }
      }
    } catch { /* silent */ }
    finally { setOrdersLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    fetchCustomerData();
    fetchOrders();
  }, [fetchCustomerData, fetchOrders]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/account/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          email: profileForm.email,
          phone: profileForm.phone,
          billing: { ...billingForm, phone: profileForm.phone, email: profileForm.email },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Profile updated successfully.", "success");
        if (data.user) setUser(data.user);
        await fetchCustomerData();
      } else {
        showToast(data.error || "Failed to update profile.", "error");
      }
    } catch { showToast("Network error. Try again.", "error"); }
    finally { setIsSavingProfile(false); }
  };

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const res = await fetch("/api/account/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing: billingForm }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Billing address saved.", "success");
        setIsEditingBilling(false);
        await fetchCustomerData();
      } else { showToast(data.error || "Failed to save.", "error"); }
    } catch { showToast("Network error.", "error"); }
    finally { setIsSavingAddress(false); }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const res = await fetch("/api/account/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping: shippingForm }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Shipping address saved.", "success");
        setIsEditingShipping(false);
        await fetchCustomerData();
      } else { showToast(data.error || "Failed to save.", "error"); }
    } catch { showToast("Network error.", "error"); }
    finally { setIsSavingAddress(false); }
  };

  const inputCls =
    "bg-primary-bg border border-white/10 rounded-xl px-4 py-3 text-warm-ivory text-sm focus:outline-none focus:border-champagne-gold transition-colors w-full";

  const AddrDisplay = ({ label, addr, icon: Icon, onEdit }: any) => (
    <div className="bg-luxury-brown/50 border border-white/10 rounded-2xl p-5 group relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-champagne-gold" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-champagne-gold">{label}</span>
        </div>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-text hover:text-champagne-gold opacity-0 group-hover:opacity-100 transition-all"
        >
          <Edit2 size={13} />
        </button>
      </div>
      {addr?.address_1 ? (
        <p className="text-sm text-warm-ivory/80 font-light leading-relaxed">
          {addr.first_name} {addr.last_name}<br />
          {addr.address_1}{addr.address_2 ? `, ${addr.address_2}` : ""}<br />
          {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postcode}<br />
          {addr.country}
          {addr.phone && <><br />{addr.phone}</>}
        </p>
      ) : (
        <p className="text-sm text-muted-text font-light">No address saved.</p>
      )}
      <button
        onClick={onEdit}
        className="mt-3 text-xs text-champagne-gold hover:underline font-medium"
      >
        {addr?.address_1 ? "Edit" : "+ Add address"}
      </button>
    </div>
  );

  const AddrForm = ({ title, formData, setFormData, onSave, onCancel, saving, showPhone = false }: any) => (
    <form onSubmit={onSave} className="bg-luxury-brown/50 border border-champagne-gold/30 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-warm-ivory uppercase tracking-wider">{title}</h3>
        <button type="button" onClick={onCancel} className="text-muted-text hover:text-red-400 transition-colors">
          <X size={15} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">First Name</label>
          <input type="text" value={formData.first_name || ""} onChange={e => setFormData((p: any) => ({ ...p, first_name: e.target.value }))} placeholder="First name" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">Last Name</label>
          <input type="text" value={formData.last_name || ""} onChange={e => setFormData((p: any) => ({ ...p, last_name: e.target.value }))} placeholder="Last name" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">Address Line 1 *</label>
          <input required type="text" value={formData.address_1 || ""} onChange={e => setFormData((p: any) => ({ ...p, address_1: e.target.value }))} placeholder="Street address" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">Address Line 2</label>
          <input type="text" value={formData.address_2 || ""} onChange={e => setFormData((p: any) => ({ ...p, address_2: e.target.value }))} placeholder="Apt, suite, floor (optional)" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">City *</label>
          <input required type="text" value={formData.city || ""} onChange={e => setFormData((p: any) => ({ ...p, city: e.target.value }))} placeholder="City" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">State *</label>
          <input required type="text" value={formData.state || ""} onChange={e => setFormData((p: any) => ({ ...p, state: e.target.value }))} placeholder="State" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">PIN / ZIP *</label>
          <input required type="text" value={formData.postcode || ""} onChange={e => setFormData((p: any) => ({ ...p, postcode: e.target.value }))} placeholder="Postcode" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">Country *</label>
          <select required value={formData.country || "IN"} onChange={e => setFormData((p: any) => ({ ...p, country: e.target.value }))} className={`${inputCls} appearance-none`}>
            <option value="IN">India</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="AE">UAE</option>
            <option value="SG">Singapore</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
          </select>
        </div>
        {showPhone && (
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-text uppercase tracking-wider mb-1 block">Phone</label>
            <input type="tel" value={formData.phone || ""} onChange={e => setFormData((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" className={inputCls} />
          </div>
        )}
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-white/10 text-muted-text hover:text-warm-ivory text-xs font-semibold uppercase tracking-wider transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-60 flex items-center gap-2">
          {saving && <RefreshCw size={12} className="animate-spin" />}
          Save Address
        </button>
      </div>
    </form>
  );

  return (
    <>
      <AnimatePresence mode="popLayout">
        {toast && <Toast key="toast" message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 w-full pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* Header Banner */}
            <div className="bg-luxury-brown/60 border border-white/10 rounded-3xl p-8 sm:p-10 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
              <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="w-20 h-20 rounded-full bg-champagne-gold/10 border-2 border-champagne-gold/40 flex items-center justify-center text-champagne-gold shrink-0">
                  <User size={36} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-champagne-gold bg-champagne-gold/10 px-3 py-1 rounded-full border border-champagne-gold/20">
                    My Account
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif text-warm-ivory mt-2">
                    {customerData?.first_name
                      ? `Welcome, ${customerData.first_name}`
                      : user?.firstName
                      ? `Welcome, ${user.firstName}`
                      : "My Account"}
                  </h1>
                  <p className="text-sm text-muted-text font-light">{user?.email}</p>
                  {(user?.username || customerData?.username) && (
                    <p className="text-xs text-muted-text/60 font-light mt-0.5">
                      @{customerData?.username || user?.username}
                    </p>
                  )}
                </div>
              </div>
              <button
                id="logout-btn"
                onClick={() => logout()}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-xl border border-white/10 text-muted-text hover:text-red-400 hover:border-red-400/30 transition-all"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 flex flex-col gap-2">
                {[
                  { id: "orders", label: "My Orders", icon: Package, count: orders.length },
                  { id: "addresses", label: "Addresses", icon: MapPin },
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
                        <Icon size={17} />
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
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 text-warm-ivory/80 hover:border-champagne-gold/40 hover:text-champagne-gold text-sm font-medium transition-all mt-3"
                >
                  <div className="flex items-center gap-3"><Heart size={17} /><span>Wishlist</span></div>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">

                  {/* Orders */}
                  {activeTab === "orders" && (
                    <motion.div key="orders" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-5">
                      <h2 className="text-xl font-serif text-warm-ivory">Order History</h2>
                      {ordersLoading ? (
                        <div className="py-16 flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-2xl">
                          <RefreshCw className="w-6 h-6 text-champagne-gold animate-spin" />
                          <span className="text-sm text-muted-text">Loading orders…</span>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="py-16 text-center bg-white/5 border border-white/10 rounded-2xl p-8">
                          <ShoppingBag className="w-12 h-12 text-champagne-gold/40 mx-auto mb-4" />
                          <h3 className="text-lg font-serif text-warm-ivory mb-2">No orders yet</h3>
                          <p className="text-sm text-muted-text font-light mb-6">Explore our catalog and place your first luxury order.</p>
                          <Link href="/collections" className="inline-block px-6 py-3 rounded-full bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors">
                            Browse Collections
                          </Link>
                        </div>
                      ) : (
                        orders.map((o) => <OrderCard key={o.id} order={o} />)
                      )}
                    </motion.div>
                  )}

                  {/* Addresses */}
                  {activeTab === "addresses" && (
                    <motion.div key="addresses" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-5">
                      <h2 className="text-xl font-serif text-warm-ivory">Saved Addresses</h2>
                      {customerLoading ? (
                        <div className="py-12 flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-2xl">
                          <RefreshCw className="w-5 h-5 text-champagne-gold animate-spin" />
                          <span className="text-sm text-muted-text">Loading…</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {isEditingBilling ? (
                            <div className="sm:col-span-2">
                              <AddrForm title="Billing Address" formData={billingForm} setFormData={setBillingForm} onSave={handleSaveBilling} onCancel={() => { setIsEditingBilling(false); setBillingForm(customerData?.billing || {}); }} saving={isSavingAddress} showPhone />
                            </div>
                          ) : (
                            <AddrDisplay label="Billing Address" addr={customerData?.billing} icon={CreditCard} onEdit={() => { setIsEditingBilling(true); setIsEditingShipping(false); }} />
                          )}
                          {isEditingShipping ? (
                            <div className="sm:col-span-2">
                              <AddrForm title="Shipping Address" formData={shippingForm} setFormData={setShippingForm} onSave={handleSaveShipping} onCancel={() => { setIsEditingShipping(false); setShippingForm(customerData?.shipping || {}); }} saving={isSavingAddress} />
                            </div>
                          ) : (
                            <AddrDisplay label="Shipping Address" addr={customerData?.shipping} icon={Truck} onEdit={() => { setIsEditingShipping(true); setIsEditingBilling(false); }} />
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Settings */}
                  {activeTab === "settings" && (
                    <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="bg-luxury-brown/50 border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
                      <div>
                        <h2 className="text-xl font-serif text-warm-ivory">Account Details</h2>
                        <p className="text-xs text-muted-text font-light mt-1">All changes sync directly with your Miorah account.</p>
                      </div>
                      {customerLoading ? (
                        <div className="py-8 flex justify-center">
                          <RefreshCw className="w-5 h-5 text-champagne-gold animate-spin" />
                        </div>
                      ) : (
                        <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">First Name</label>
                              <input type="text" value={profileForm.first_name} onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Last Name</label>
                              <input type="text" value={profileForm.last_name} onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Email Address</label>
                              <input type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-widest text-muted-text font-semibold">Phone Number</label>
                              <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" className={inputCls} />
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <button type="submit" disabled={isSavingProfile} className="px-6 py-3 rounded-xl bg-champagne-gold text-primary-bg text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-60 flex items-center gap-2">
                              {isSavingProfile && <RefreshCw size={12} className="animate-spin" />}
                              Save Changes
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Read-only account info */}
                      <div className="pt-4 border-t border-white/10">
                        <h3 className="text-sm font-semibold text-warm-ivory mb-3">Account Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="bg-white/5 rounded-xl p-3">
                            <span className="text-[10px] uppercase tracking-widest text-muted-text block mb-1">Customer ID</span>
                            <span className="text-warm-ivory font-mono">#{user?.id}</span>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <span className="text-[10px] uppercase tracking-widest text-muted-text block mb-1">Username</span>
                            <span className="text-warm-ivory">@{customerData?.username || user?.username || "—"}</span>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <span className="text-[10px] uppercase tracking-widest text-muted-text block mb-1">Member Since</span>
                            <span className="text-warm-ivory text-xs">
                              {customerData?.date_created
                                ? new Date(customerData.date_created).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
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
function AccountPageContent() {
  const { isAuthenticated, checkSession, isLoading } = useAuthStore();
  const [sessionChecked, setSessionChecked] = useState(false);
  const checkedRef = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get("redirect") || undefined;

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    checkSession().finally(() => setSessionChecked(true));
  }, [checkSession]);

  // If already authenticated and there's a redirect param, send them there
  useEffect(() => {
    if (sessionChecked && isAuthenticated && redirectUrl) {
      router.push(redirectUrl);
    }
  }, [sessionChecked, isAuthenticated, redirectUrl, router]);

  if (!sessionChecked || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
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
    : <AuthPanel onSuccess={() => setSessionChecked(true)} redirectUrl={redirectUrl} />;
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-champagne-gold animate-spin" />
          </div>
          <p className="text-sm text-muted-text font-light">Loading your account…</p>
        </div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
