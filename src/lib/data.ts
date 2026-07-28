export interface ProductDetail {
  id: string | number;
  slug: string;
  name: string;
  sku?: string;
  price: string;
  originalPrice?: string;
  category: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description: string;
  images: string[];
  colors?: { name: string; hex: string; image?: string }[];
  specs?: Partial<{
    material: string;
    plating: string;
    stone: string;
    weight: string;
    dimensions: string;
    closure: string;
    waterResistant: string;
    antiTarnish: string;
    hypoallergenic: string;
    [key: string]: string | undefined;
  }>;
  features: string[];
  inStock: boolean;
  completeTheLookIds?: (string | number)[];
}

export const ALL_PRODUCTS: ProductDetail[] = [
  {
    id: "MI0036",
    slug: "cosmic-bold-huggies",
    name: "Cosmic Bold Huggies",
    price: "₹850",
    originalPrice: "₹1,200",
    category: "Earrings",
    isBestSeller: true,
    isNewArrival: true,
    rating: 4.9,
    reviewCount: 38,
    shortDescription: "Sleek, modern gold huggie hoop earrings with celestial zircon stones. Engineered for lightweight everyday luxury.",
    description: "Inspired by the radiant alignment of celestial bodies, the Cosmic Bold Huggies offer an understated statement of elegance. Hand-finished in 18k gold plating over hypoallergenic 925 sterling silver, these huggies feature precision-set micro cubic zirconia that capture the light from every angle.",
    images: [
      "/images/products/MI0036/MI0036-1.png",
      "/images/products/MI0036/MI0036-2.png",
    ],
    colors: [
      { name: "18k Yellow Gold", hex: "#D4AF37" },
      { name: "Rose Gold", hex: "#C28A72" },
      { name: "Silver Rhodium", hex: "#E0E0E0" },
    ],
    specs: {
      material: "925 Sterling Silver",
      plating: "18k Heavy Gold Plating (2.5 Microns)",
      stone: "Grade AAA Cubic Zirconia",
      weight: "4.2 grams (pair)",
      dimensions: "14mm Outer Diameter, 4mm Width",
      closure: "Secure Hinged Snap Closure",
      waterResistant: "Yes (Water & Sweat Proof)",
      antiTarnish: "100% Anti-Tarnish Coating",
      hypoallergenic: "Nickel-Free & Lead-Free",
    },
    features: [
      "Water-resistant & sweat-proof for everyday wear",
      "Signature anti-tarnish protective barrier",
      "Ergonomic snap closure for secure comfort",
      "Handcrafted by master artisans",
    ],
    inStock: true,
    completeTheLookIds: ["MI0008", "MI0030"],
  },
  {
    id: "MI0016",
    slug: "emerald-sparkle-drop",
    name: "Emerald Sparkle Drop Earrings",
    price: "₹1,200",
    originalPrice: "₹1,650",
    category: "Earrings",
    isBestSeller: true,
    isNewArrival: true,
    rating: 5.0,
    reviewCount: 52,
    shortDescription: "Exquisite drop earrings featuring vivid emerald green and ruby red stones surrounded by sparkling diamond-cut zircons.",
    description: "Designed to evoke regal grandeur, the Emerald Sparkle Drop Earrings blend vintage romance with modern geometric lines. Featuring rich emerald-toned crystal glass droplets nestled in an ornate 18k gold frame, these earrings turn heads effortlessly at evening soirées and festive celebrations.",
    images: [
      "/images/products/MI0016/MI0016-1 Green.png",
      "/images/products/MI0016/MI0016-2 Green.png",
      "/images/products/MI0016/MI0016-1 Green & Red.png",
      "/images/products/MI0016/MI0016-1 Red.png",
    ],
    colors: [
      { name: "Emerald Green", hex: "#046307", image: "/images/products/MI0016/MI0016-1 Green.png" },
      { name: "Ruby Red", hex: "#9B111E", image: "/images/products/MI0016/MI0016-1 Red.png" },
      { name: "Dual Emerald & Ruby", hex: "#2E5B37", image: "/images/products/MI0016/MI0016-1 Green & Red.png" },
    ],
    specs: {
      material: "High-Grade Brass & Silver Alloy",
      plating: "24k Antique Gold Foil Plating",
      stone: "Hydrothermal Emerald & Ruby Crystals",
      weight: "8.5 grams (pair)",
      dimensions: "38mm Length, 16mm Width",
      closure: "Comfort Push Back with Bullet Stopper",
      waterResistant: "Splash Proof",
      antiTarnish: "Advanced Electro-Coated Anti-Tarnish",
      hypoallergenic: "Hypoallergenic Alloy Base",
    },
    features: [
      "Royal jewel-toned crystals with diamond-cut brilliance",
      "Lightweight construct designed for hours of comfortable wear",
      "Signature Miorah vintage filigree back detailing",
    ],
    inStock: true,
    completeTheLookIds: ["MI0027", "MI0030"],
  },
  {
    id: "MI0027",
    slug: "ruby-radiance-choker",
    name: "Ruby Radiance Choker Set",
    price: "₹2,100",
    originalPrice: "₹2,990",
    category: "Chokers",
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 29,
    shortDescription: "A breathtaking neckpiece featuring vibrant ruby red accents woven with intricate golden motif work.",
    description: "The Ruby Radiance Choker Set represents the zenith of heritage artisan craftsmanship. Crafted with gold lattice patterns holding lustrous ruby-red central stones, this choker drapes gracefully along the collarbone. Comes complete with matching drop earrings.",
    images: [
      "/images/products/MI0027/MI0027-1.png",
      "/images/products/MI0027/MI0027-2.png",
    ],
    colors: [
      { name: "Deep Ruby Red", hex: "#800020" },
      { name: "Emerald Green", hex: "#004B23" },
    ],
    specs: {
      material: "Premium Brass Base",
      plating: "18k Antique Matte Gold",
      stone: "Synthetic Rubies & Kundan Stones",
      weight: "32.0 grams",
      dimensions: "Adjustable Velvet Thread Cord",
      closure: "Adjustable Dori (Cord)",
      waterResistant: "Avoid Direct Water",
      antiTarnish: "Protective Clear Lacquer Coated",
      hypoallergenic: "100% Skin Safe",
    },
    features: [
      "Includes matching ruby dangle earrings",
      "Flexible, ergonomic structure contours to the neckline",
      "Includes luxury velvet Miorah presentation box",
    ],
    inStock: true,
    completeTheLookIds: ["MI0016", "MI0030"],
  },
  {
    id: "MI0030",
    slug: "orbit-crystal-cuff",
    name: "Orbit Crystal Cuff Bracelet",
    price: "₹950",
    originalPrice: "₹1,400",
    category: "Bracelets",
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 41,
    shortDescription: "Modern open-cuff bracelet framed with twin brilliant-cut solitaire crystals in a floating orbit setting.",
    description: "Sculptural simplicity meets high-polish gold in the Orbit Crystal Cuff. Designed to be worn solo for a sleek minimalist look or stacked alongside fine watches and bangles. Its flexible open design ensures a tailored fit for any wrist size.",
    images: [
      "/images/products/MI0030/MI0030-1.png",
      "/images/products/MI0030/MI0030-2.png",
    ],
    colors: [
      { name: "Polished Gold", hex: "#E5C158" },
      { name: "Platinum Silver", hex: "#D8D8D8" },
    ],
    specs: {
      material: "Stainless Steel Core",
      plating: "PVD 18k Real Gold Ion Plating",
      stone: "Precision Swarovski Zirconia",
      weight: "11.2 grams",
      dimensions: "Flexible 60mm Diameter (Adjustable)",
      closure: "Open Cuff Slip-on",
      waterResistant: "100% Waterproof & Sweatproof",
      antiTarnish: "Never Tarnishes or Fades",
      hypoallergenic: "Medical Grade Stainless Steel",
    },
    features: [
      "PVD Gold Plating: won't tarnish or turn skin green",
      "Waterproof — wear it in the shower or pool",
      "Sleek open-cuff design fits all wrist sizes",
    ],
    inStock: true,
    completeTheLookIds: ["MI0036", "MI0008"],
  },
  {
    id: "MI0008",
    slug: "classic-horseshoe-pendant",
    name: "Classic Horseshoe Pendant Chain",
    price: "₹750",
    originalPrice: "₹1,100",
    category: "Chains",
    isBestSeller: true,
    rating: 4.7,
    reviewCount: 64,
    shortDescription: "Iconic lucky horseshoe charm studded with micro paved zircons on a delicate box chain.",
    description: "A talisman of good fortune and effortless grace. The Classic Horseshoe Pendant Chain features a polished horseshoe emblem studded with pave-set cubic zirconia. Suspended from an adjustable 18-inch gold chain, it is the ultimate layering essential.",
    images: [
      "/images/products/MI0008/MI0008-1.png",
      "/images/products/MI0008/MI0008-2.png",
    ],
    colors: [
      { name: "18k Champagne Gold", hex: "#D4AF37" },
    ],
    specs: {
      material: "925 Sterling Silver Base",
      plating: "18k Gold Vermeil",
      stone: "Micro-pave CZ Crystals",
      weight: "3.8 grams",
      dimensions: "16 inch + 2 inch extension chain",
      closure: "Lobster Clasp",
      waterResistant: "Water Resistant",
      antiTarnish: "Tarnish Resistant Lacquer",
      hypoallergenic: "Safe for sensitive skin",
    },
    features: [
      "Versatile length adjustable from 16 to 18 inches",
      "Symbolic horseshoe design for good luck",
      "Delicate yet strong Italian box chain construction",
    ],
    inStock: true,
    completeTheLookIds: ["MI0036", "MI0030"],
  },
  {
    id: "MI0035",
    slug: "kundan-choker-set",
    name: "Royal Kundan Statement Choker",
    price: "₹3,400",
    originalPrice: "₹4,500",
    category: "Chokers",
    isNewArrival: true,
    rating: 5.0,
    reviewCount: 19,
    shortDescription: "Grand Kundan choker handcrafted with un-cut glass stones and pearl drops for bridal and festive elegance.",
    description: "Elevate your couture wardrobe with the Royal Kundan Statement Choker. Featuring meticulous hand-set Kundan glass work bordered by freshwater pearl dangles, this regal masterpiece captures the timeless opulence of royal Indian courts.",
    images: [
      "/images/products/MI0035/MI0035-1.png",
      "/images/products/MI0035/MI0035-2.png",
    ],
    colors: [
      { name: "Pearl Ivory & Gold", hex: "#FDFBF7" },
    ],
    specs: {
      material: "Handcrafted Brass",
      plating: "22k Gold Foil Polishing",
      stone: "Uncut Kundan Glass & Faux Pearls",
      weight: "48 grams",
      dimensions: "Adjustable Thread Cord",
      closure: "Traditional Drawstring Dori",
      waterResistant: "Keep Away From Moisture",
      antiTarnish: "Anti-Oxidant Sealed",
      hypoallergenic: "Lead & Cadmium Free",
    },
    features: [
      "Artisanal Kundan setting with pearl cluster drops",
      "Includes statement chandelier earrings",
      "Perfect match for sarees, lehengas, and festive wear",
    ],
    inStock: true,
    completeTheLookIds: ["MI0016", "MI0030"],
  },
  {
    id: "MI0037",
    slug: "minimal-huggies",
    name: "Minimalist Gold Huggies",
    price: "₹850",
    originalPrice: "₹1,100",
    category: "Earrings",
    isNewArrival: true,
    rating: 4.8,
    reviewCount: 22,
    shortDescription: "Ultra-clean high polish gold huggie hoops designed to sit snug on the earlobe.",
    description: "The essential modern everyday hoop. Smooth, seamless, and high-shine, the Minimalist Gold Huggies bring effortless sophistication to casual and professional outfits alike.",
    images: [
      "/images/products/MI0037/MI0037-1.png",
      "/images/products/MI0037/MI0037-2.png",
    ],
    colors: [
      { name: "Gold", hex: "#D4AF37" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
    specs: {
      material: "925 Sterling Silver",
      plating: "18k Thick Gold Plating",
      weight: "2.8 grams",
      dimensions: "11mm Diameter",
      closure: "Click-in Hinged Closure",
      waterResistant: "Waterproof",
      antiTarnish: "Tarnish Proof",
      hypoallergenic: "Hypoallergenic",
    },
    features: [
      "Featherlight comfort for 24/7 wear",
      "Click-lock mechanism prevents accidental loss",
      "Ideal for second or third ear piercings",
    ],
    inStock: true,
    completeTheLookIds: ["MI0008", "MI0030"],
  },
  {
    id: "MI0010",
    slug: "pearl-drop-earrings",
    name: "Luminous Pearl Drop Earrings",
    price: "₹1,050",
    originalPrice: "₹1,450",
    category: "Earrings",
    isNewArrival: true,
    rating: 4.9,
    reviewCount: 31,
    shortDescription: "Graceful drop earrings featuring luminous baroque pearls dangling from cubic zirconia studs.",
    description: "A harmonious synthesis of classic luster and sparkling crystal pave. The Luminous Pearl Drop Earrings feature hand-selected baroque glass pearls suspended from gold geometric studs.",
    images: [
      "/images/products/MI0010/MI0010-1.png",
      "/images/products/MI0010/MI0010-2.png",
    ],
    colors: [
      { name: "Cream Pearl", hex: "#FAF0E6" },
    ],
    specs: {
      material: "925 Silver Post & Alloy Body",
      plating: "14k Champagne Gold Plating",
      stone: "High-Luster Glass Pearl & CZ",
      weight: "5.1 grams",
      dimensions: "28mm Drop",
      closure: "Sterling Silver Push Back",
      waterResistant: "Splashproof",
      antiTarnish: "Anti-Tarnish Coated",
      hypoallergenic: "Nickel Free",
    },
    features: [
      "Natural baroque pearl shape for unique organic appeal",
      "925 silver posts prevent ear irritation",
      "Comes in Miorah signature satin pouch",
    ],
    inStock: true,
    completeTheLookIds: ["MI0008", "MI0030"],
  },
  {
    id: "MI0005",
    slug: "aura-celestial-necklace",
    name: "Aura Celestial Layered Necklace",
    price: "₹1,450",
    originalPrice: "₹1,950",
    category: "Necklaces",
    isNewArrival: true,
    rating: 4.9,
    reviewCount: 16,
    shortDescription: "Pre-layered dual gold chain featuring a delicate starburst pendant and satellite bead chain.",
    description: "Take the guesswork out of neck layering. The Aura Celestial Layered Necklace combines two perfectly proportioned chains into a single easy clasp. Features an etched starburst medallion centered with a cubic zirconia stone.",
    images: [
      "/images/products/MI0005/MI0005-1.png",
      "/images/products/MI0005/MI0005-2.png",
    ],
    colors: [
      { name: "18k Yellow Gold", hex: "#D4AF37" },
    ],
    specs: {
      material: "316L Stainless Steel Base",
      plating: "18k Real Gold Vacuum Plating",
      stone: "Cubic Zirconia Star Center",
      weight: "7.4 grams",
      dimensions: "Inner chain 15 in, Outer chain 18 in + 2 in extender",
      closure: "Lobster Clasp",
      waterResistant: "100% Waterproof",
      antiTarnish: "No-Tarnish",
      hypoallergenic: "Hypoallergenic Steel",
    },
    features: [
      "Pre-layered 2-in-1 design never tangles",
      "100% tarnish-free PVD coating",
      "Adjustable length extension",
    ],
    inStock: true,
    completeTheLookIds: ["MI0036", "MI0030"],
  },
  {
    id: "MI0012",
    slug: "emerald-ruby-heritage",
    name: "Royal Green Cascade",
    price: "₹2,850",
    originalPrice: "₹3,500",
    category: "Chokers",
    isNewArrival: true,
    rating: 4.8,
    reviewCount: 24,
    shortDescription: "Statement Choker & Drop Earrings",
    description: "Handpicked Designer Jewellery featuring a Royal Green Cascade. A true statement choker with matching drop earrings.",
    images: [
      "/images/products/MI0012/MI0012-1 Green.png"
    ],
    features: [
      "Royal Essence Collection",
      "Statement design",
      "Matching drop earrings included"
    ],
    inStock: true,
  },

  {
    id: "MI0029",
    slug: "kundan-pearl-bridal-suite",
    name: "Imperial Bridal Suite",
    price: "₹4,950",
    originalPrice: "₹6,000",
    category: "Bridal Sets",
    isNewArrival: false,
    rating: 5.0,
    reviewCount: 18,
    shortDescription: "Show-Stopping Statement Suite Crafted for Unforgettable Moments",
    description: "The ultimate bridal statement. This Imperial Bridal Suite features layers of Kundan and Pearls for an unforgettable look on your special day.",
    images: [
      "/images/products/MI0029/MI0029-1.png"
    ],
    features: [
      "Bridal Luxury Collection",
      "Show-Stopping Statement Suite",
      "Kundan and Pearl Accents"
    ],
    inStock: true,
  },
];

// Fallback Helper Functions
export function getProductById(id: string | number): ProductDetail | undefined {
  const normalizedId = String(id).toLowerCase();
  return ALL_PRODUCTS.find(
    (p) => String(p.id).toLowerCase() === normalizedId || p.slug.toLowerCase() === normalizedId
  ) || ALL_PRODUCTS[0];
}

export function getProductBySlug(slug: string): ProductDetail | undefined {
  const normalizedSlug = slug.toLowerCase();
  return ALL_PRODUCTS.find(
    (p) => p.slug.toLowerCase() === normalizedSlug || String(p.id).toLowerCase() === normalizedSlug
  ) || ALL_PRODUCTS[0];
}

export function getBestSellers(): ProductDetail[] {
  return ALL_PRODUCTS.filter((p) => p.isBestSeller);
}

export function getNewArrivals(): ProductDetail[] {
  return ALL_PRODUCTS.filter((p) => p.isNewArrival);
}

export const MOCK_BEST_SELLERS = getBestSellers().map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  category: p.category,
  image1: p.images[0],
  image2: p.images[1] || p.images[0],
}));

export const MOCK_NEW_ARRIVALS = getNewArrivals().map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  image1: p.images[0],
}));

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  count?: number;
  image?: string;
}

export const MOCK_CATEGORIES: Category[] = [
  { id: "all", name: "All", slug: "all", count: ALL_PRODUCTS.length },
  { id: "earrings", name: "Earrings", slug: "earrings", count: ALL_PRODUCTS.filter(p => p.category === "Earrings").length },
  { id: "necklaces", name: "Necklaces", slug: "necklaces", count: ALL_PRODUCTS.filter(p => p.category === "Necklaces").length },
  { id: "chokers", name: "Chokers", slug: "chokers", count: ALL_PRODUCTS.filter(p => p.category === "Chokers").length },
  { id: "bracelets", name: "Bracelets", slug: "bracelets", count: ALL_PRODUCTS.filter(p => p.category === "Bracelets").length },
  { id: "chains", name: "Chains", slug: "chains", count: ALL_PRODUCTS.filter(p => p.category === "Chains").length },
  { id: "rings", name: "Rings", slug: "rings", count: ALL_PRODUCTS.filter(p => p.category === "Rings").length },
];

