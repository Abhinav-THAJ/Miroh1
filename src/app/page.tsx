import Navbar from "@/components/layout/Navbar";
import EditorialShowcase from "@/components/home/EditorialShowcase";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import OnamCollection from "@/components/home/OnamCollection";
import Footer from "@/components/layout/Footer";
import HomeProductsClient from "@/components/home/HomeProductsClient";
import { getHomePageData } from "@/lib/wordpress";

// Server component: fetches WordPress ACF data fresh on every request (no client cache issues)
export default async function Home() {
  const acfData = await getHomePageData();

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-champagne-gold selection:text-luxury-black">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Client component handles WooCommerce fetching for Hero/NewArrivals/BestSellers */}
        <HomeProductsClient heroAcfData={acfData?.hero} />
        <EditorialShowcase acfData={acfData?.editorial_showcase} />
        <OnamCollection acfData={acfData?.onam_collection} />
        <FeaturedCollections acfData={acfData?.featured_collections} />
      </main>

      <Footer />
    </div>
  );
}
