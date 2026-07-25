import React from "react";
import { ShieldCheck, Video, RotateCcw } from "lucide-react";

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 bg-primary-bg">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif text-warm-ivory mb-12 text-center">
          Shipping & Return Policy
        </h1>
        
        <div className="space-y-12 text-muted-text font-light leading-relaxed bg-white/[0.02] p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl">
          
          <section>
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw className="text-champagne-gold w-6 h-6" />
              <h2 className="text-2xl font-serif text-champagne-gold">Replacement Policy</h2>
            </div>
            <p className="mb-6">
              We take pride in the quality of our handcrafted luxury imitation jewellery. To ensure fairness and transparency, our replacement policy is strictly as follows:
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
              <ul className="list-disc pl-5 space-y-3 text-warm-ivory/90">
                <li>
                  A product will <strong>only be replaced</strong> if the wrong product is delivered to you, or if the product arrives damaged.
                </li>
                <li>
                  <strong>Mandatory Requirement:</strong> You must record a clear, continuous <strong>unboxing video</strong> right from the start of opening the sealed package. This video is strictly required to process any replacement claims.
                </li>
              </ul>
            </div>
            <p className="text-sm">
              <strong className="text-champagne-gold uppercase tracking-widest text-xs">Note:</strong> Without a valid unboxing video, we will not be able to entertain any claims for damaged or incorrect items. We do not offer returns or exchanges for reasons other than those stated above (e.g., change of mind).
            </p>
          </section>

          <hr className="border-white/10" />

          <section>
            <div className="flex items-center gap-3 mb-6">
              <Video className="text-champagne-gold w-6 h-6" />
              <h2 className="text-2xl font-serif text-champagne-gold">Unboxing Video Guidelines</h2>
            </div>
            <p className="mb-4">
              To ensure your claim is approved smoothly, please follow these guidelines when recording your unboxing video:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The video must start with the package fully sealed.</li>
              <li>Show the shipping label clearly in the video before opening.</li>
              <li>The video must be continuous and unedited (no pauses or cuts).</li>
              <li>Clearly show the item and any damage or discrepancy immediately upon unboxing.</li>
            </ul>
          </section>

          <hr className="border-white/10" />

          <section>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-champagne-gold w-6 h-6" />
              <h2 className="text-2xl font-serif text-champagne-gold">Shipping Information</h2>
            </div>
            <p className="mb-4">
              We strive to deliver your orders safely and on time. Once your order is dispatched, you will receive a tracking link via email or SMS to monitor your shipment.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Processing Time:</strong> Orders are typically processed within 1-2 business days.</li>
              <li><strong>Delivery Time:</strong> Express delivery typically takes 2-4 business days depending on your location.</li>
              <li>If you have any issues with delivery, please contact our support team.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
