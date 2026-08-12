const WP_URL = (process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com").replace(/\/$/, "");

export async function getHomePageData() {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages?slug=home&_embed`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0 && data[0].acf) {
      return data[0].acf;
    }
    return null;
  } catch (error) {
    console.error("Error fetching home page ACF data:", error);
    return null;
  }
}
