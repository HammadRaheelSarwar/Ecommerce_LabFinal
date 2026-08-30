import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const WOMEN_IMG = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80'
const MEN_IMG   = 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&q=80'

export default function MenWomenBanner({ data }) {
  return (
    <section className="section-padding bg-black">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className="font-sans text-gold text-xs tracking-[0.4em] uppercase mb-2">Collections</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">HIS & HER WORLD</h2>
          <div className="divider-gold w-24 mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Women */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Link to="/category/women" className="group relative block aspect-[3/4] overflow-hidden">
              <img
                src={data?.image?.url || WOMEN_IMG}
                alt="Women Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/40 transition-all duration-500" />
              <div className="absolute bottom-8 left-8">
                <p className="text-gold text-xs tracking-[0.3em] uppercase font-sans mb-2">The Collection</p>
                <h3 className="font-serif text-3xl font-bold text-white mb-4">WOMEN</h3>
                <div className="flex items-center gap-2 text-white/70 group-hover:text-gold transition-colors">
                  <span className="text-xs tracking-widest uppercase font-sans font-semibold">
                    {data?.ctaText || 'EXPLORE'}
                  </span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Men */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Link to="/category/men" className="group relative block aspect-[3/4] overflow-hidden">
              <img
                src={data?.secondaryImage?.url || MEN_IMG}
                alt="Men Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/40 transition-all duration-500" />
              <div className="absolute bottom-8 left-8">
                <p className="text-gold text-xs tracking-[0.3em] uppercase font-sans mb-2">The Collection</p>
                <h3 className="font-serif text-3xl font-bold text-white mb-4">MEN</h3>
                <div className="flex items-center gap-2 text-white/70 group-hover:text-gold transition-colors">
                  <span className="text-xs tracking-widest uppercase font-sans font-semibold">
                    {data?.secondaryCtaText || 'EXPLORE'}
                  </span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
