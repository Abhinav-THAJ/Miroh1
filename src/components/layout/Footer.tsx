import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-luxury-black pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="MIORAH - The Reflection of Beauty"
                width={260}
                height={78}
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-text max-w-sm mb-8 font-light leading-relaxed">
              The Reflection of Beauty. Luxury handcrafted imitation jewellery blending timeless heritage with modern elegance.
            </p>

          </div>

          <div>
            <h4 className="text-warm-ivory uppercase tracking-widest text-sm font-semibold mb-6">Explore</h4>
            <ul className="space-y-4">
              {[
                { name: "Collections", href: "/collections" },
                { name: "New Arrivals", href: "/new-arrivals" },
                { name: "Best Sellers", href: "/best-sellers" },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "Shipping & Returns", href: "/shipping-returns" },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-muted-text hover:text-champagne-gold transition-colors font-light text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-warm-ivory uppercase tracking-widest text-sm font-semibold mb-6">Contact</h4>
            <ul className="space-y-4 text-muted-text font-light text-sm flex flex-col items-start">
              <li>Chalakudy, Thrissur</li>
              <li>Kerala, India</li>
              <li>
                <a href="mailto:miorah.thereflectionofbeauty@gmail.com" className="hover:text-champagne-gold transition-colors inline-block text-left break-all">
                  miorah.thereflectionofbeauty@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/918078894696" target="_blank" rel="noreferrer" className="hover:text-champagne-gold transition-colors inline-block text-left">
                  WhatsApp: +91 80788 94696
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-muted-text text-sm font-light">
          <p>&copy; {new Date().getFullYear()} Miorah. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://www.instagram.com/miorah_.in" target="_blank" rel="noreferrer" className="hover:text-champagne-gold transition-colors">Instagram</a>
            <a href="https://wa.me/918078894696" target="_blank" rel="noreferrer" className="hover:text-champagne-gold transition-colors">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
