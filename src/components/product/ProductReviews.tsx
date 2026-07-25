"use client";

import { useState } from "react";
import { Star, CheckCircle, ThumbsUp, MessageSquare, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductDetail } from "@/lib/data";

interface ProductReviewsProps {
  product: ProductDetail;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [userComment, setUserComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mockReviews = [
    {
      id: 1,
      name: "Ananya Sharma",
      location: "Mumbai",
      date: "3 days ago",
      rating: 5,
      title: "Absolutely Stunning Quality!",
      comment: "I was hesitant ordering jewelry online, but Miorah exceeded all expectations! The shine, weight, and finish feel exactly like solid 18k gold. Wore it to a wedding reception and received endless compliments.",
      verified: true,
      likes: 14,
    },
    {
      id: 2,
      name: "Priya V.",
      location: "Bengaluru",
      date: "1 week ago",
      rating: 5,
      title: "Truly Waterproof & Anti-Tarnish",
      comment: "I've been wearing this every single day for over two weeks, including in the shower. Not a single trace of fading or skin greenness! Highly recommend.",
      verified: true,
      likes: 9,
    },
    {
      id: 3,
      name: "Meera R.",
      location: "Delhi",
      date: "2 weeks ago",
      rating: 4,
      title: "Luxury Packaging & Fast Delivery",
      comment: "Arrived in a gorgeous velvet box with wax seal detail. Looks super expensive and luxurious. The lock clasp is very firm and secure.",
      verified: true,
      likes: 6,
    },
  ];

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userComment) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsWriteReviewOpen(false);
      setUserName("");
      setUserComment("");
    }, 2000);
  };

  return (
    <div className="mt-20 py-16 border-t border-white/10" id="reviews">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne-gold block mb-2">
            Verified Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-warm-ivory">
            Customer <span className="italic text-champagne-gold font-light">Reviews</span>
          </h2>
        </div>
        <button
          onClick={() => setIsWriteReviewOpen(true)}
          className="mt-4 md:mt-0 px-6 py-3 rounded-xl bg-champagne-gold text-primary-bg font-medium uppercase tracking-wider text-xs hover:bg-white transition-colors shadow-lg"
        >
          Write a Review
        </button>
      </div>

      {/* Review Summary Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 p-8 rounded-2xl bg-white/5 border border-white/10 items-center">
        {/* Big Score */}
        <div className="flex flex-col items-center justify-center text-center lg:border-r border-white/10 lg:pr-8">
          <span className="text-6xl font-serif font-bold text-warm-ivory mb-2">
            {product.rating}
          </span>
          <div className="flex text-champagne-gold mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="fill-champagne-gold" />
            ))}
          </div>
          <p className="text-xs text-muted-text">Based on {product.reviewCount} verified reviews</p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="lg:col-span-2 space-y-2">
          {[
            { stars: "5 Stars", percentage: 88, count: 33 },
            { stars: "4 Stars", percentage: 10, count: 4 },
            { stars: "3 Stars", percentage: 2, count: 1 },
            { stars: "2 Stars", percentage: 0, count: 0 },
            { stars: "1 Star", percentage: 0, count: 0 },
          ].map((bar) => (
            <div key={bar.stars} className="flex items-center gap-4 text-xs">
              <span className="w-16 text-muted-text">{bar.stars}</span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-champagne-gold rounded-full"
                  style={{ width: `${bar.percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-text">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-champagne-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < rev.rating ? "fill-champagne-gold" : "text-white/20"}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-text">{rev.date}</span>
              </div>

              <h4 className="font-serif text-lg text-warm-ivory mb-2">{rev.title}</h4>
              <p className="text-sm text-muted-text font-light leading-relaxed mb-6">
                "{rev.comment}"
              </p>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-warm-ivory block">{rev.name}</span>
                {rev.verified && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle size={10} /> Verified Buyer ({rev.location})
                  </span>
                )}
              </div>
              <button className="flex items-center gap-1.5 text-xs text-muted-text hover:text-champagne-gold transition-colors">
                <ThumbsUp size={12} /> {rev.likes}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isWriteReviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-luxury-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-luxury-brown border border-champagne-gold/30 rounded-2xl p-6 sm:p-8 w-full max-w-lg relative shadow-2xl">
              <button
                onClick={() => setIsWriteReviewOpen(false)}
                className="absolute top-4 right-4 text-warm-ivory hover:text-champagne-gold p-1"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-serif text-warm-ivory mb-2">Write a Review</h3>
              <p className="text-xs text-muted-text mb-6">
                Share your experience with {product.name}
              </p>

              {submitted ? (
                <div className="py-8 text-center text-champagne-gold">
                  <CheckCircle size={48} className="mx-auto mb-3" />
                  <p className="text-lg font-serif text-warm-ivory">Thank you for your review!</p>
                  <p className="text-xs text-muted-text mt-1">Your feedback has been submitted.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-warm-ivory block mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="text-champagne-gold"
                        >
                          <Star
                            size={24}
                            className={star <= userRating ? "fill-champagne-gold" : "text-white/20"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-warm-ivory block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-primary-bg border border-white/10 rounded-lg p-3 text-sm text-warm-ivory placeholder:text-muted-text focus:outline-none focus:border-champagne-gold"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-warm-ivory block mb-1">
                      Review
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Write your review here..."
                      className="w-full bg-primary-bg border border-white/10 rounded-lg p-3 text-sm text-warm-ivory placeholder:text-muted-text focus:outline-none focus:border-champagne-gold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-champagne-gold text-primary-bg font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={14} /> Submit Review
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
