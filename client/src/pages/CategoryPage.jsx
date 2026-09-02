import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, ArrowUp, SlidersHorizontal, Star, Sparkles, Filter } from 'lucide-react'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { CATEGORIES_DATA } from '../data/categoriesData'
import ProductCard from '../components/ui/ProductCard'



export default function CategoryPage() {
  const { slug, subSlug } = useParams()
  const [searchParams] = useSearchParams()
  const subcategoryQuery = searchParams.get('subcategory')

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('popular')
  const [priceFilter, setPriceFilter] = useState('all')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Find category from CATEGORIES_DATA or backend
  const activeCategoryData = useMemo(() => {
    if (!slug) return null
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return (
      CATEGORIES_DATA.find(c => c.slug === cleanSlug || c.id === cleanSlug) ||
      CATEGORIES_DATA.find(c => c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug) ||
      { name: slug.replace(/-/g, ' '), slug, subcategories: [] }
    )
  }, [slug])

  // Identify active subcategory
  const activeSubSlug = subSlug || subcategoryQuery || ''
  const activeSubcategory = useMemo(() => {
    if (!activeSubSlug || !activeCategoryData?.subcategories) return null
    const cleanSub = activeSubSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return (
      activeCategoryData.subcategories.find(s => s.slug === cleanSub) ||
      activeCategoryData.subcategories.find(s => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSub) ||
      { name: activeSubSlug.replace(/-/g, ' '), slug: activeSubSlug }
    )
  }, [activeSubSlug, activeCategoryData])

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    // Try fetching category & products from server API
    categoryService.getBySlug(slug)
      .then(res => {
        if (!isMounted) return
        const cat = res.data.category
        setCategory(cat)

        const queryParams = {
          category: cat._id,
          limit: 100,
        }
        if (activeSubcategory?.name) {
          queryParams.subcategory = activeSubcategory.name
        }

        return productService.getAll(queryParams)
      })
      .then(res => {
        if (!isMounted) return
        setProducts(res?.data?.products || [])
      })
      .catch(() => {
        if (!isMounted) return
        // Try fetching by slug directly if category object failed
        productService.getAll({ category: slug, limit: 100 })
          .then(res => {
            if (isMounted) setProducts(res?.data?.products || [])
          })
          .catch(() => {
            if (isMounted) setProducts([])
          })
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [slug, activeSubcategory, activeCategoryData])

  // Scroll listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filtered & sorted products
  const displayProducts = useMemo(() => {
    let list = [...products]

    if (priceFilter === 'under-1000') list = list.filter(p => (p.salePrice || p.basePrice) <= 1000)
    else if (priceFilter === 'under-2000') list = list.filter(p => (p.salePrice || p.basePrice) <= 2000)
    else if (priceFilter === 'under-3000') list = list.filter(p => (p.salePrice || p.basePrice) <= 3000)

    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice))
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice))
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }

    // Always display user-added Pink Floral Gown first in the list
    list.sort((a, b) => {
      const isA = a.sku === 'MZ779014450ANMCL' || a.name?.includes('Pink Floral')
      const isB = b.sku === 'MZ779014450ANMCL' || b.name?.includes('Pink Floral')
      if (isA && !isB) return -1
      if (!isA && isB) return 1
      return 0
    })

    return list
  }, [products, sortBy, priceFilter])

  const categoryName = category?.name || activeCategoryData?.name || slug
  const currentSubTitle = activeSubcategory?.name || categoryName

  return (
    <div className="bg-[#FAF6F0] min-h-screen pb-16">
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8 pt-3 md:pt-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 md:mb-5 flex items-center flex-wrap gap-1.5 text-[12px] md:text-[13px] text-[#98A2B3]">
          <Link to="/" className="hover:text-[#344054] transition">Home</Link>
          <ChevronRight size={13} className="text-[#98A2B3]" />
          <Link to="/shop/categories" className="hover:text-[#344054] transition">Shop</Link>
          <ChevronRight size={13} className="text-[#98A2B3]" />
          <Link to={`/category/${activeCategoryData?.slug || slug}`} className="hover:text-[#344054] transition">
            {categoryName}
          </Link>
          {activeSubcategory && (
            <>
              <ChevronRight size={13} className="text-[#98A2B3]" />
              <span className="text-[#070A56] font-semibold" aria-current="page">
                {activeSubcategory.name}
              </span>
            </>
          )}
        </nav>

        {/* Markaz Header Banner Card */}
        <div className="bg-gradient-to-r from-[#FFF5F2] via-[#FCF8F5] to-[#F5FAF8] border border-[#F2E8E4] rounded-3xl p-5 sm:p-7 md:p-8 mb-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-block bg-[#E53935] text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                SHOP {currentSubTitle.toUpperCase()}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#070A56] tracking-tight leading-tight">
                Hand-picked for {currentSubTitle}
              </h1>
              <p className="text-[#667085] text-xs sm:text-sm mt-1.5 max-w-xl font-light">
                Curated by Markaz — refreshed regularly with what's selling now. Cash on delivery ready.
              </p>
            </div>
            {activeSubcategory?.img && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-[#EAECF0] p-1 shadow-xs overflow-hidden flex-shrink-0 self-start md:self-auto">
                <img
                  src={activeSubcategory.img}
                  alt={currentSubTitle}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sibling Subcategories Bar */}
        {activeCategoryData?.subcategories?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#070A56] uppercase tracking-wider">
                Explore {categoryName}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              <Link
                to={`/category/${activeCategoryData.slug}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  !activeSubcategory
                    ? 'bg-[#070A56] text-white shadow-xs'
                    : 'bg-white border border-[#EAECF0] text-[#344054] hover:border-[#02BC87] hover:text-[#02BC87]'
                }`}
              >
                All {categoryName}
              </Link>
              {activeCategoryData.subcategories.map((sub) => {
                const isSelected = activeSubcategory?.slug === sub.slug
                return (
                  <Link
                    key={sub.slug}
                    to={`/category/${activeCategoryData.slug}/${sub.slug}`}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#070A56] text-white shadow-xs'
                        : 'bg-white border border-[#EAECF0] text-[#344054] hover:border-[#02BC87] hover:text-[#02BC87]'
                    }`}
                  >
                    {sub.img && (
                      <span className="w-4 h-4 rounded-full overflow-hidden inline-block flex-shrink-0">
                        <img src={sub.img} alt="" className="w-full h-full object-cover" />
                      </span>
                    )}
                    <span>{sub.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Controls & Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#EAECF0] p-3 sm:p-4 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#667085] flex items-center gap-1">
              <Filter size={14} className="text-[#02BC87]" /> Filter:
            </span>
            <button
              onClick={() => setPriceFilter(priceFilter === 'under-1000' ? 'all' : 'under-1000')}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                priceFilter === 'under-1000'
                  ? 'bg-[#02BC87] border-[#02BC87] text-white font-bold'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              Under PKR 1,000
            </button>
            <button
              onClick={() => setPriceFilter(priceFilter === 'under-2000' ? 'all' : 'under-2000')}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                priceFilter === 'under-2000'
                  ? 'bg-[#02BC87] border-[#02BC87] text-white font-bold'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              Under PKR 2,000
            </button>
            <button
              onClick={() => setPriceFilter(priceFilter === 'under-3000' ? 'all' : 'under-3000')}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                priceFilter === 'under-3000'
                  ? 'bg-[#02BC87] border-[#02BC87] text-white font-bold'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              Under PKR 3,000
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-[#667085] font-medium">
              {displayProducts.length} products
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-800 outline-none focus:border-[#02BC87] font-medium cursor-pointer"
            >
              <option value="popular">Popular / Trending</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Product Grid (6 columns on desktop matching Markaz) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-gray-200 animate-pulse h-72">
                <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3" />
                <div className="h-3 bg-gray-100 rounded-full w-4/5 mb-2" />
                <div className="h-4 bg-gray-100 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EAECF0] p-12 text-center my-6">
            <h3 className="font-bold text-lg text-[#070A56] mb-1">No products found</h3>
            <p className="text-xs text-[#667085] mb-4">Try clearing your filters or check other subcategories.</p>
            <button
              onClick={() => setPriceFilter('all')}
              className="px-5 py-2 rounded-full bg-[#02BC87] text-white text-xs font-bold hover:bg-[#02a779] transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {displayProducts.map((p, i) => (
              <ProductCard key={p._id || i} product={p} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#070A56] text-white shadow-xl flex items-center justify-center hover:bg-[#02BC87] transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  )
}
