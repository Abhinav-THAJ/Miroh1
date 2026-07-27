"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide the preloader after a delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-primary-bg flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center relative">
            {/* Pulsing glow behind logo */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-32 h-32 bg-champagne-gold/20 rounded-full blur-2xl"
            />
            
            {/* Text Logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 mb-6 flex flex-col items-center"
            >
              <h1 className="text-4xl sm:text-5xl font-serif text-champagne-gold tracking-[0.2em] uppercase">
                Miorah
              </h1>
              <span className="text-xs text-warm-ivory/70 tracking-[0.3em] uppercase mt-2 font-light">
                The Reflection of Beauty
              </span>
            </motion.div>

            {/* Loading Bar */}
            <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden mt-2">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-champagne-gold/80"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
