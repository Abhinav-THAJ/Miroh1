"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Mail, MapPin, Send, CheckCircle, AlertCircle, Loader2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────── Email Validation ───────────────────────────
// Checks: has @, proper local part, known domain format, valid TLD (2–10 chars)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,10}$/;

function isValidEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) return false;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length < 1) return false;
  if (!domain || !domain.includes(".")) return false;
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) return false;
  // Reject obviously mistyped TLDs
  if (["con", "cmo", "con", "gmal", "gamil"].includes(tld)) return false;
  return true;
}

type ToastType = "error" | "success";
interface ToastData { message: string; type: ToastType }

export default function ContactPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const emailValid = isValidEmail(form.email);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!emailValid) {
      showToast("Please enter a valid email address (e.g. yourname@gmail.com).", "error");
      return;
    }

    if (form.name.trim().length < 2) {
      showToast("Please enter your full name.", "error");
      return;
    }

    if (form.message.trim().length < 10) {
      showToast("Please write a message of at least 10 characters.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("success");
        setForm({ name: "", email: "", message: "" });
        setEmailTouched(false);
      } else {
        showToast(data.message || "Something went wrong. Please try again.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "bg-white/5 border rounded-xl px-4 py-3.5 text-warm-ivory placeholder:text-muted-text/40 text-sm outline-none transition-all w-full";

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
      <Navbar />

      {/* Toast */}
      <AnimatePresence mode="popLayout">
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className={`fixed top-24 right-6 z-[999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-green-950/90 border-green-500/30 text-green-200"
                : "bg-red-950/90 border-red-500/30 text-red-200"
            }`}
          >
            {toast.type === "success"
              ? <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-400" />
              : <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />}
            <p className="text-sm leading-relaxed flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 transition-opacity shrink-0">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="relative pt-40 pb-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-brown/40 to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-champagne-gold/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative container mx-auto px-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="uppercase tracking-[0.4em] text-champagne-gold text-xs font-semibold block mb-6"
            >
              We&apos;d love to hear from you
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-serif text-warm-ivory mb-6 leading-tight"
            >
              Get in <span className="italic text-champagne-gold font-light">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-muted-text max-w-xl mx-auto font-light text-lg leading-relaxed"
            >
              Our team is here to assist you with inquiries, custom requests, and all things jewellery.
            </motion.p>
          </div>
        </section>

        {/* Main Grid */}
        <section className="pb-32 container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Left — Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-2 flex flex-col gap-6"
            >
              <div className="bg-luxury-brown/60 border border-white/8 rounded-3xl p-8 flex flex-col gap-7 backdrop-blur-sm">
                <h2 className="text-2xl font-serif text-warm-ivory">Contact Information</h2>
                <div className="w-12 h-[1px] bg-champagne-gold/50" />

                {/* Email */}
                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/20 flex items-center justify-center text-champagne-gold shrink-0 group-hover:bg-champagne-gold group-hover:text-primary-bg transition-all">
                    <Mail size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-text mb-1 font-semibold">Email</p>
                    <a href="mailto:miorah.thereflectionofbeauty@gmail.com" className="text-warm-ivory hover:text-champagne-gold transition-colors text-sm leading-relaxed break-all">
                      miorah.thereflectionofbeauty@gmail.com
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/20 flex items-center justify-center text-champagne-gold shrink-0 group-hover:bg-champagne-gold group-hover:text-primary-bg transition-all">
                    <MapPin size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-text mb-1 font-semibold">Location</p>
                    <p className="text-warm-ivory text-sm leading-relaxed">
                      Chalakudy, Thrissur<br />Kerala, India
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/20 flex items-center justify-center text-champagne-gold shrink-0 group-hover:bg-champagne-gold group-hover:text-primary-bg transition-all">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-text mb-1 font-semibold">WhatsApp</p>
                    <a href="https://wa.me/918078894696?text=Hi%20miorah%2C%20I%20would%20like%20to%20know%20more%20about%20your%20jewellery" target="_blank" rel="noreferrer" className="text-warm-ivory hover:text-champagne-gold transition-colors text-sm">
                      +91 80788 94696
                    </a>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/918078894696?text=Hi%20miorah%2C%20I%20would%20like%20to%20know%20more%20about%20your%20jewellery"
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white py-4 px-6 rounded-2xl font-medium text-sm tracking-wide transition-all shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Chat with us on WhatsApp
              </a>

              {/* Manager */}
              <div className="border border-champagne-gold/20 rounded-2xl p-6 bg-champagne-gold/5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-semibold mb-1">Managed By</p>
                <p className="text-warm-ivory font-serif text-2xl">Amrutha Mohan</p>
              </div>
            </motion.div>

            {/* Right — Form / Success */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <AnimatePresence mode="wait">

                {/* ── SUCCESS ── */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-luxury-brown/60 border border-green-500/30 rounded-3xl p-10 backdrop-blur-sm flex flex-col items-center justify-center gap-6 text-center min-h-[460px]"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <CheckCircle size={36} className="text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-warm-ivory mb-2">Message Sent!</h2>
                      <p className="text-muted-text text-sm font-light max-w-xs">
                        Thank you for reaching out. Our team will get back to you within 24 hours.
                      </p>
                    </div>
                    <button
                      onClick={() => setStep("form")}
                      className="px-6 py-3 rounded-xl border border-champagne-gold/30 text-champagne-gold hover:bg-champagne-gold hover:text-luxury-black text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}

                {/* ── CONTACT FORM ── */}
                {step === "form" && (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    noValidate
                    className="bg-luxury-brown/60 border border-white/8 rounded-3xl p-10 backdrop-blur-sm flex flex-col gap-8 h-full"
                  >
                    <div>
                      <h2 className="text-2xl font-serif text-warm-ivory mb-1">Send a Message</h2>
                      <p className="text-muted-text text-sm font-light">We&apos;ll get back to you within 24 hours.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="contact-name" className="text-[10px] uppercase tracking-[0.2em] text-muted-text font-semibold">
                          Full Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          placeholder="Enter your name"
                          className={`${inputBase} border-white/10 focus:border-champagne-gold`}
                        />
                      </div>

                      {/* Email Address */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="contact-email" className="text-[10px] uppercase tracking-[0.2em] text-muted-text font-semibold">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="contact-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={form.email}
                            onChange={e => {
                              setForm({ ...form, email: e.target.value });
                              if (emailTouched) setEmailTouched(true);
                            }}
                            onBlur={() => setEmailTouched(true)}
                            placeholder="yourname@gmail.com"
                            className={`${inputBase} pr-10 ${
                              emailTouched && form.email
                                ? emailValid
                                  ? "border-green-500/50 focus:border-green-500"
                                  : "border-red-500/50 focus:border-red-500"
                                : "border-white/10 focus:border-champagne-gold"
                            }`}
                          />
                          {/* Inline status icon */}
                          {emailTouched && form.email && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                              {emailValid
                                ? <CheckCircle size={15} className="text-green-400" />
                                : <AlertCircle size={15} className="text-red-400" />}
                            </div>
                          )}
                        </div>
                        {/* Inline error message */}
                        {emailTouched && form.email && !emailValid && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-400 flex items-center gap-1.5"
                          >
                            <AlertCircle size={11} />
                            Enter a valid email — e.g. yourname@gmail.com
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-2 flex-1">
                      <label htmlFor="contact-message" className="text-[10px] uppercase tracking-[0.2em] text-muted-text font-semibold">
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={7}
                        required
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        placeholder="Enter your message..."
                        className={`${inputBase} border-white/10 focus:border-champagne-gold resize-none flex-1`}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      id="contact-submit"
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-3 bg-champagne-gold text-primary-bg py-4 rounded-2xl font-semibold tracking-wider uppercase text-sm hover:bg-white transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting
                        ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                        : <><Send size={16} /> Send Message</>}
                    </button>
                  </motion.form>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
