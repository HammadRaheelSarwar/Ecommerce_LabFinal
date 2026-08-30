import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const DEFAULT = {
  title: 'TIMELESS ELEGANCE',
  subtitle: 'Discover watches designed to make every second memorable.',
  ctaText: 'SHOP WATCHES',
  ctaUrl: '/category/watches',
  image: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=80' },
}

export default function WatchesSection({ data = DEFAULT }) {
  const d = { ...DEFAULT, ...data }

  return (
    <section className="relative py-24 overflow-hidden bg-black">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={d.image?.url || DEFAULT.image.url} alt="Watches" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/75" />
        {/* Gold vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/90" />
      </div>

      {/* Gold decorative lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="container-luxury relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-sans text-gold text-xs tracking-[0.4em] uppercase mb-4">Timepieces</p>
          <h2 className="font-serif font-bold text-white mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            {d.title}
          </h2>
          <div className="divider-gold w-24 mx-auto mb-6" />
          <p className="text-white/60 text-base font-sans max-w-xl mx-auto mb-10 leading-relaxed">
            {d.subtitle}
          </p>
          <Link to={d.ctaUrl} className="btn-gold text-xs">
            {d.ctaText} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
