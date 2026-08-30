import { Link } from 'react-router-dom'
import { Instagram, Facebook, ShieldCheck, Truck, RotateCcw, Banknote } from 'lucide-react'

const SHOP_LINKS = [
  { label: 'Women Corner',      to: '/category/women' },
  { label: 'Men\'s Fashion',    to: '/category/men' },
  { label: 'Luxury Watches',    to: '/category/watches' },
  { label: 'Perfumes & Scents', to: '/category/perfumes' },
  { label: 'Jewellery',         to: '/category/jewelry' },
  { label: 'Shoes & Bags',      to: '/category/accessories' },
  { label: 'Festive Deals',     to: '/shop?isOnSale=true' },
]

const HELP_LINKS = [
  { label: 'Contact Us',           to: '/contact' },
  { label: 'Delivery Information', to: '/delivery' },
  { label: 'Return Policy',        to: '/returns' },
  { label: 'Privacy Policy',       to: '/privacy' },
  { label: 'Terms & Conditions',   to: '/terms' },
  { label: 'FAQs',                 to: '/faqs' },
]

export default function Footer() {
  return (
    <footer className="bg-[#083523] text-white pt-14 pb-8 border-t border-emerald-900/40">
      <div className="container-markaz">
        {/* Trust row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Banknote size={24} className="text-[#00b884] flex-shrink-0" />
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-white">Cash on Delivery</h5>
              <p className="text-[11px] text-white/60">Pay when your order arrives</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck size={24} className="text-[#00b884] flex-shrink-0" />
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-white">Nationwide Shipping</h5>
              <p className="text-[11px] text-white/60">Delivering to all cities</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw size={24} className="text-[#00b884] flex-shrink-0" />
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-white">7-Day Easy Returns</h5>
              <p className="text-[11px] text-white/60">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#00b884] flex-shrink-0" />
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-white">100% Authentic</h5>
              <p className="text-[11px] text-white/60">Quality-verified suppliers</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-3">
              <img src="/logo.png" alt="AllAvailable" className="h-8 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-white/70 text-xs leading-relaxed font-sans mb-4">
              Pakistan's premier destination for fashion, beauty, luxury watches, fine fragrances and lifestyle products. Everything you desire, all available.
            </p>
            <div className="flex gap-2">
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#00b884] transition-colors">
                <Instagram size={15} />
              </a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#00b884] transition-colors">
                <Facebook size={15} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h6 className="font-sans text-xs font-bold tracking-wider uppercase text-white mb-4">
              Categories
            </h6>
            <ul className="space-y-2">
              {SHOP_LINKS.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-white/70 text-xs hover:text-[#00b884] transition-colors font-sans">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h6 className="font-sans text-xs font-bold tracking-wider uppercase text-white mb-4">
              Customer Care
            </h6>
            <ul className="space-y-2">
              {HELP_LINKS.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-white/70 text-xs hover:text-[#00b884] transition-colors font-sans">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h6 className="font-sans text-xs font-bold tracking-wider uppercase text-white mb-4">
              Direct Support
            </h6>
            <p className="text-white/70 text-xs font-sans leading-relaxed mb-3">
              Gulberg III, MM Alam Road, Lahore, Pakistan<br />
              Mon - Sat (10:00 AM – 8:00 PM PKT)
            </p>
            <p className="text-[#00b884] text-xs font-bold font-sans">
              Hotline: +92 (300) 123-4567<br />
              concierge@allavailable.com
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 font-sans">
          <p>© {new Date().getFullYear()} All Available. Online Shopping in Pakistan.</p>
          <p>Cash on Delivery Available Nationwide</p>
        </div>
      </div>
    </footer>
  )
}
