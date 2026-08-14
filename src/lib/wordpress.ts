const WP_URL = (process.env.NEXT_PUBLIC_WC_URL || "https://springgreen-rook-492819.hostingersite.com").replace(/\/$/, "");

export async function getHomePageData() {
  try {
    const timestamp = new Date().getTime();
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages?slug=home&_embed&t=${timestamp}`, {
      cache: 'no-store'
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
