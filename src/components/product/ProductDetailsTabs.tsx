"use client";

import { Shield, Sparkles, Award, CheckCircle2 } from "lucide-react";
import { ProductDetail } from "@/lib/data";

interface ProductDetailsTabsProps {
  product: ProductDetail;
}

export default function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  // Extract technical specifications
  const specsEntries = Object.entries(product.specs || {});

  return (
    <div className="mt-20 border-t border-white/10 pt-16">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center text-champagne-gold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-champagne-gold font-semibold block">
              Craftsmanship & Details
            </span>
            <h2 className="text-3xl font-serif text-warm-ivory">
              Product Specifications
            </h2>
          </div>
        </div>

        {/* Product Specifications Card & Table */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2 text-sm text-warm-ivory font-serif">
              <Sparkles className="w-4 h-4 text-champagne-gold" />
              <span>{product.name} — Technical Specs</span>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest bg-champagne-gold/10 text-champagne-gold border border-champagne-gold/30">
              Verified Specs
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <table className="w-full text-left text-sm">
              <tbody>
                {specsEntries.map(([key, value], idx) => {
                  const formattedKey = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());

                  return (
                    <tr
                      key={key}
                      className={
                        idx % 2 === 0
                          ? "bg-transparent"
                          : "bg-white/[0.02]"
                      }
                    >
                      <td className="py-4 px-6 font-medium text-champagne-gold w-1/3 border-b border-white/5 border-r border-white/5">
                        {formattedKey}
                      </td>
                      <td className="py-4 px-6 text-warm-ivory font-light border-b border-white/5">
                        {value}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Highlights Footer */}
          {product.features && product.features.length > 0 && (
            <div className="p-6 sm:p-8 bg-white/[0.02] border-t border-white/10">
              <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-champagne-gold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Key Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-warm-ivory/90 font-light">
                    <CheckCircle2 className="w-4 h-4 text-champagne-gold shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
