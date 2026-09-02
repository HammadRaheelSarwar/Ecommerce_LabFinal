import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowUp, ShoppingBag } from 'lucide-react'
import { categoryService } from '../services/categoryService'
import { useRealtimeCategories } from '../services/realtimeService'

const BUDGET_BUCKETS = [
  { label: 'Under PKR 1,000', maxPrice: 1000 },
  { label: 'Under PKR 1,500', maxPrice: 1500 },
  { label: 'Under PKR 2,500', maxPrice: 2500 },
  { label: 'Under PKR 5,000', maxPrice: 5000 },
]

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const loadCategories = useCallback(() => {
    categoryService.getAll()
      .then(res => {
        setCategories(res.data?.categories || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Real-time updates when categories change in Supabase
  useRealtimeCategories(loadCategories)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="bg-[#FAF6F0] min-h-screen">
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8 pb-12 md:pb-16 pt-3 md:pt-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 md:mb-6 flex items-center gap-1.5 text-[12px] md:text-[13px] text-[#98A2B3]">
          <Link className="hover:text-[#344054] transition" to="/shop">
            Shop
          </Link>
          <ChevronRight size={13} className="text-[#98A2B3]" />
          <span className="text-[#344054] font-medium" aria-current="page">
            All categories
          </span>
        </nav>

        {/* Header */}
        <header className="mb-7 md:mb-10">
          <h1 className="m-0 text-[26px] md:text-[34px] lg:text-[40px] font-semibold tracking-tight text-[#0c5a37] leading-[1.1]">
            Shop by Category
          </h1>
          <p className="mt-3 text-[13px] md:text-[15px] text-[#667085] max-w-[58ch] leading-relaxed font-light">
            Browse authentic product categories directly from verified Pakistani suppliers. Tap any category to explore its collection.
          </p>
        </header>

        {/* Shop by Budget */}
        <section aria-label="Shop by budget" className="mb-7 md:mb-10 rounded-3xl border border-[#EAECF0] bg-white p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#00b884]/10 text-[#0c5a37]">
              <ShoppingBag size={15} />
            </span>
            <h2 className="m-0 text-[16px] md:text-[18px] font-semibold tracking-tight text-[#0c5a37]">
              Shop by budget
            </h2>
          </div>
          <p className="m-0 mb-4 text-[12.5px] md:text-[13.5px] text-[#667085] leading-relaxed">
            Find products that fit your price point — every item is cash-on-delivery ready nationwide.
          </p>
          <ul role="list" className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-2.5 list-none p-0 m-0">
            {BUDGET_BUCKETS.map((bucket, idx) => (
              <li key={idx}>
                <Link
                  className="block w-full text-center rounded-xl border border-[#EAECF0] bg-white px-3 py-2.5 text-[13px] font-bold text-[#0c5a37] tracking-tight hover:border-[#00b884] hover:text-[#00b884] transition-colors"
                  to={`/shop?maxPrice=${bucket.maxPrice}`}
                >
                  {bucket.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Categories Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-[#0c5a37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-xs">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl p-8 border border-gray-200">
            <p className="text-gray-600 font-bold mb-2">No categories available</p>
            <Link to="/shop" className="btn-mint text-xs px-5 py-2 inline-block">Browse Shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {categories.map((cat) => (
              <article
                key={cat.id || cat._id}
                className="group rounded-3xl border border-[#EAECF0] bg-white overflow-hidden transition hover:border-[#0c5a37]/40 shadow-xs"
              >
                {/* Category Header Link */}
                <Link
                  className="flex items-center gap-3 md:gap-4 p-4 md:p-5 border-b border-[#F2F4F7] hover:bg-[#FAFAFA] transition-colors"
                  aria-label={`Shop ${cat.name}`}
                  to={`/category/${cat.slug}`}
                >
                  <div className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl overflow-hidden bg-[#FAF6F0] p-1 border border-gray-200">
                    <img
                      alt={cat.name}
                      loading="lazy"
                      className="object-cover w-full h-full rounded-xl"
                      src={cat.image?.url || cat.imageUrl || '/images/products/unstitched-shirt/product-1-1.webp'}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-[16px] md:text-[18px] font-bold text-gray-900 truncate">
                      {cat.name}
                    </h2>
                    <p className="m-0 mt-0.5 text-[12px] md:text-[13px] text-gray-500">
                      {cat.subcategories?.length || 0} collections
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-[#98A2B3] shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Subcategories Grid */}
                <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3 p-4 list-none m-0" role="list">
                  {(cat.subcategories || []).map((sub, sIdx) => {
                    const subImg = sub.img || `/images/products/unstitched-shirt/product-${(sIdx % 48) + 1}-1.webp`
                    return (
                      <li key={sIdx}>
                        <Link
                          aria-label={`Shop ${sub.name}`}
                          title={sub.name}
                          className="block group/item text-center"
                          to={`/category/${cat.slug}?subcategory=${encodeURIComponent(sub.name)}`}
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FAF6F0] border border-gray-200 transition-transform duration-200 group-hover/item:scale-105 group-hover/item:border-[#0c5a37]">
                            <img
                              alt={sub.name}
                              loading="lazy"
                              className="object-cover w-full h-full"
                              src={subImg}
                            />
                          </div>
                          <span className="block mt-1.5 text-[11px] md:text-[12px] font-semibold text-gray-700 line-clamp-2 break-words group-hover/item:text-[#0c5a37]">
                            {sub.name}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#0c5a37] text-white shadow-xl flex items-center justify-center hover:bg-[#00b884] transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  )
}
