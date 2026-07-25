import CheckoutClient from "@/components/checkout/CheckoutClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
      <Navbar />
      <main className="flex-1 w-full pt-28 pb-20">
        <CheckoutClient />
      </main>
      <Footer />
    </div>
  );
}
