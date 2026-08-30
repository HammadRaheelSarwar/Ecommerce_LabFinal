import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const DEFAULT = {
  title: 'UP TO 50% OFF',
  subtitle: 'Selected styles. Limited time.',
  ctaText: 'SHOP THE SALE',
  ctaUrl: '/shop?isOnSale=true',
  image: { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80' },
}

export default function SaleBanner({ data = DEFAULT }) {
  const d = { ...DEFAULT, ...data }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden"
    >
      <div className="relative h-72 md:h-96">
        <img
          src={d.image?.url || DEFAULT.image.url}
          alt="Sale"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/70" />
        {/* Gold borders */}
        <div className="absolute inset-6 md:inset-10 border border-gold/30 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="font-sans text-gold text-xs tracking-[0.4em] uppercase mb-3">Limited Time</p>
          <h2 className="font-serif font-bold text-white mb-3" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
            {d.title}
          </h2>
          <p className="font-sans text-white/70 text-base mb-8">{d.subtitle}</p>
          <Link to={d.ctaUrl} className="btn-gold text-xs">
            {d.ctaText} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
