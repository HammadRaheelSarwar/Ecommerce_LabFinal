import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { categoryService } from '../../services/categoryService'
import { useRealtimeCategories } from '../../services/realtimeService'

export default function ShopByCategory() {
  const scrollRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])

  const loadData = useCallback(() => {
    categoryService.getAll()
      .then(res => {
        const cats = res.data?.categories || []
        setCategories(cats)

        // Build list of real subcategories and categories
        const list = []
        cats.forEach(cat => {
          // Add the main category
          list.push({
            name: cat.name,
            to: `/category/${cat.slug}`,
            img: cat.image?.url || cat.imageUrl || '/images/products/unstitched-shirt/product-1-1.webp',
          })
          // Add all real subcategories
          ;(cat.subcategories || []).forEach((sub, sIdx) => {
            const defaultSubImg = sub.img || `/images/products/unstitched-shirt/product-${(sIdx % 48) + 1}-1.webp`
            list.push({
              name: sub.name,
              to: `/category/${cat.slug}?subcategory=${encodeURIComponent(sub.name)}`,
              img: defaultSubImg,
            })
          })
        })
        setItems(list)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time listener for category changes in Supabase
  useRealtimeCategories(loadData)

  const scroll = (direction) => {
    const amount = direction === 'left' ? -320 : 320
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <section className="py-4">
      <div className="container-markaz">
        <div className="card-markaz p-6 sm:p-7 relative group">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
              Shop by category
            </h2>
            <Link
              to="/shop/categories"
              className="flex items-center gap-1 text-xs font-bold text-[#0c5a37] hover:text-[#00b884] transition-colors font-sans"
            >
              <span>See more</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Real Categories List */}
          <div
            ref={scrollRef}
            className="flex items-start gap-6 sm:gap-8 overflow-x-auto scrollbar-none no-scrollbar pb-3 scroll-smooth"
          >
            {items.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.to}
                className="flex flex-col items-center text-center group/item flex-shrink-0 w-24 sm:w-28"
              >
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-[#FAF6F0] p-1 border border-gray-200/80 shadow-2xs group-hover/item:border-[#0c5a37] group-hover/item:scale-105 transition-all overflow-hidden mb-2">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-gray-800 leading-tight group-hover/item:text-[#0c5a37] transition-colors line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Scroll Arrow */}
          {items.length > 5 && (
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-700 hover:text-[#0c5a37] hover:border-[#0c5a37] transition-all z-10 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
