import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const ITEMS = [
  { name: 'Rings',      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80', url: '/shop?subcategory=rings' },
  { name: 'Necklaces',  img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80', url: '/shop?subcategory=necklaces' },
  { name: 'Bracelets',  img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80', url: '/shop?subcategory=bracelets' },
  { name: 'Earrings',   img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80', url: '/shop?subcategory=earrings' },
]

export default function JewelrySection() {
  return (
    <section className="section-padding bg-black">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="font-sans text-gold text-xs tracking-[0.4em] uppercase mb-3">Fine Jewelry</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">SHINE DIFFERENTLY</h2>
          <p className="text-gray-mid text-sm font-sans mt-3 max-w-md mx-auto">
            Jewelry that tells your story. Crafted for the moments that matter.
          </p>
          <div className="divider-gold w-24 mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={item.url} className="group block relative overflow-hidden aspect-square">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-0 border border-transparent group-hover:border-gold/50 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-serif text-white text-lg font-bold group-hover:text-gold transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-gold/80 tracking-widest uppercase font-sans">Shop</span>
                    <ArrowRight size={10} className="text-gold" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link to="/category/jewelry" className="btn-outline-gold text-xs">
            VIEW ALL JEWELRY <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
