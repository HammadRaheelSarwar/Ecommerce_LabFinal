import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const CATS = [
  { label: 'For Him',          url: '/shop?subcategory=men-perfumes' },
  { label: 'For Her',          url: '/shop?subcategory=women-perfumes' },
  { label: 'Unisex',           url: '/shop?subcategory=unisex-perfumes' },
  { label: 'Luxury Collection',url: '/shop?subcategory=luxury-fragrances' },
]

const DEFAULT = {
  title: 'THE ART OF FRAGRANCE',
  subtitle: 'A scent that lingers long after you leave.',
  ctaText: 'EXPLORE FRAGRANCES',
  ctaUrl: '/category/perfumes',
  image: { url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=1400&q=80' },
}

export default function PerfumeSection({ data = DEFAULT }) {
  const d = { ...DEFAULT, ...data }

  return (
    <section className="section-padding bg-black-premium">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={d.image?.url || DEFAULT.image.url}
                alt="Perfumes"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            {/* Gold frame accent */}
            <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 border border-gold/20 pointer-events-none" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-sans text-gold text-xs tracking-[0.4em] uppercase mb-4">Fragrances</p>
            <h2 className="font-serif font-bold text-white mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {d.title}
            </h2>
            <div className="divider-gold w-24 mb-6" />
            <p className="text-white/60 text-base font-sans mb-8 leading-relaxed">{d.subtitle}</p>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {CATS.map(cat => (
                <Link
                  key={cat.label}
                  to={cat.url}
                  className="px-4 py-2 border border-gold/30 text-[11px] text-gold/80 tracking-widest uppercase font-sans hover:border-gold hover:text-gold hover:bg-gold/5 transition-all duration-300"
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            <Link to={d.ctaUrl} className="btn-gold text-xs">
              {d.ctaText} <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
