import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import ProductCard from '../ui/ProductCard'
import { productService } from '../../services/productService'

export default function ProductSectionRow({
  title,
  emoji,
  badgeText,
  seeAllLink = '/shop',
  filterParams = {},
  initialProducts = [],
}) {
  const scrollRef = useRef(null)
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading]   = useState(initialProducts.length === 0)

  useEffect(() => {
    if (initialProducts.length > 0) return
    setLoading(true)
    productService.getAll({ limit: 10, ...filterParams })
      .then(res => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const scroll = (direction) => {
    const amount = direction === 'left' ? -350 : 350
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="py-6">
      <div className="container-markaz">
        {/* Header with Green Accent Line */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="w-8 h-1 bg-[#00b884] rounded-full mb-1.5" />
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight flex items-center gap-1.5">
                {title} {emoji && <span>{emoji}</span>}
              </h2>
              {badgeText && (
                <span className="text-xs font-semibold text-gray-500 font-sans">
                  {badgeText}
                </span>
              )}
            </div>
          </div>

          <Link
            to={seeAllLink}
            className="flex items-center gap-1 text-xs font-bold text-[#0c5a37] hover:text-[#00b884] transition-colors font-sans"
          >
            <span>See all</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Horizontal Card Carousel */}
        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none no-scrollbar pb-2 scroll-smooth"
          >
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex-shrink-0 w-44 sm:w-52 h-72 bg-white rounded-2xl p-3 border border-gray-200 animate-pulse" />
              ))
            ) : (
              products.map((p, i) => (
                <div key={p._id} className="flex-shrink-0 w-44 sm:w-52 flex">
                  <ProductCard product={p} index={i} />
                </div>
              ))
            )}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={() => scroll('left')}
            aria-label="Previous products"
            className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-700 hover:text-[#0c5a37] hover:border-[#0c5a37] transition-all z-10 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll('right')}
            aria-label="Next products"
            className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-700 hover:text-[#0c5a37] hover:border-[#0c5a37] transition-all z-10 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
