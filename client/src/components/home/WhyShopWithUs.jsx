import { motion } from 'framer-motion'
import { Shield, Truck, Star, Banknote } from 'lucide-react'

const BENEFITS = [
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    desc: 'Pay at your doorstep anywhere across Pakistan with total peace of mind.',
  },
  {
    icon: Truck,
    title: 'Fast Nationwide Delivery',
    desc: 'Prompt doorstep delivery via premier courier partners.',
  },
  {
    icon: Shield,
    title: '7-Day Easy Returns',
    desc: 'Hassle-free return and exchange policy on all purchases.',
  },
  {
    icon: Star,
    title: '100% Authentic Quality',
    desc: 'Every item inspected and guaranteed by verified suppliers.',
  },
]

export default function WhyShopWithUs() {
  return (
    <section className="py-10">
      <div className="container-markaz">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0c5a37] flex items-center justify-center flex-shrink-0">
                <b.icon size={22} className="text-[#00b884]" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-gray-900 text-sm mb-1">
                  {b.title}
                </h4>
                <p className="text-gray-500 text-xs font-sans leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
