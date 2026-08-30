import { Truck, Banknote, RotateCcw, ShieldCheck } from 'lucide-react'

const TRUST_PILLARS = [
  { icon: Truck,       text: 'Lowest delivery price in Pakistan' },
  { icon: Banknote,    text: 'Cash on Delivery available' },
  { icon: RotateCcw,   text: '7-day easy returns' },
  { icon: ShieldCheck, text: 'Verified Suppliers' },
]

export default function AnnouncementBar() {
  return (
    <div className="bg-[#050505] text-white/90 text-[11px] font-sans py-2 border-b border-white/10 relative z-50">
      <div className="container-markaz">
        {/* Desktop: 4 items evenly distributed */}
        <div className="hidden md:flex items-center justify-between">
          {TRUST_PILLARS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <item.icon size={13} className="text-[#00b884]" />
              <span className="font-medium tracking-wide">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Mobile: horizontal ticker */}
        <div className="flex md:hidden overflow-hidden whitespace-nowrap">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...TRUST_PILLARS, ...TRUST_PILLARS].map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-1.5 px-4 text-white/80">
                <item.icon size={12} className="text-[#00b884]" />
                <span className="font-medium">{item.text}</span>
                <span className="mx-2 text-white/20">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
