import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../ui/ProductCard'
import { ProductGridSkeleton } from '../ui/Skeleton'
import { productService } from '../../services/productService'

export default function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    productService.getAll({ isNewArrival: true, limit: 8, sort: 'newest' })
      .then(res => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section-padding bg-black">
      <div className="container-luxury">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <p className="font-sans text-gold text-xs tracking-[0.4em] uppercase mb-2">Latest</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">NEW ARRIVALS</h2>
            <div className="divider-gold w-24 mt-3" />
          </div>
          <Link
            to="/shop?isNewArrival=true"
            className="flex items-center gap-2 text-xs text-gold hover:text-gold-soft font-sans font-bold tracking-widest uppercase transition-colors self-start md:self-end"
          >
            VIEW ALL <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <p className="text-center text-gray-mid font-sans py-12">No new arrivals yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </section>
  )
}
