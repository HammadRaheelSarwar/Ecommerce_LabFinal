import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const DEFAULT = {
  title: 'THE SIGNATURE COLLECTION',
  subtitle: 'Curated with precision. Crafted for you.',
  ctaText: 'DISCOVER COLLECTION',
  ctaUrl: '/shop?isFeatured=true',
  image: { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80' },
}

export default function FeaturedCollection({ data = DEFAULT }) {
  const d = { ...DEFAULT, ...data }

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[70vh] min-h-[500px]">
        <img
          src={d.image?.url || DEFAULT.image.url}
          alt="Featured Collection"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-end pb-16">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <p className="font-sans text-gold text-xs tracking-[0.4em] uppercase mb-4">Exclusive</p>
              <h2 className="font-serif font-bold text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                {d.title}
              </h2>
              <p className="text-white/60 text-base font-sans mb-8 leading-relaxed">{d.subtitle}</p>
              <Link to={d.ctaUrl} className="btn-gold text-xs">
                {d.ctaText} <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
