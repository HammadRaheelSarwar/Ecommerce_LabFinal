import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, Check, Sparkles, ArrowUpDown } from 'lucide-react'
import ProductCard from '../components/ui/ProductCard'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'

import { useRealtimeProducts, useRealtimeCategories } from '../services/realtimeService'

const SORT_OPTIONS = [
  { label: 'Popular / Trending', value: 'popular' },
  { label: 'Newest Arrivals',     value: 'newest' },
  { label: 'Price: Low to High',  value: 'price_asc' },
  { label: 'Price: High to Low',  value: 'price_desc' },
  { label: 'Top Rated',          value: 'rating' },
]

const OCCASION_TITLES = {
  festive: 'Eid Edit',
  wedding: 'Wedding Ready',
  casual: 'Daily Wear',
  formal: 'Office Looks',
  perfume: 'Glow-up',
  gift: 'Gift Mode',
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const LIMIT = 24

  // Read params
  const category    = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcategory') || ''
  const sort        = searchParams.get('sort') || 'popular'
  const isNewArrival= searchParams.get('isNewArrival') || ''
  const isBestSeller= searchParams.get('isBestSeller') || ''
  const isOnSale    = searchParams.get('isOnSale') || ''
  const isFeatured  = searchParams.get('isFeatured') || ''
  const minPrice    = searchParams.get('minPrice') || ''
  const maxPrice    = searchParams.get('maxPrice') || ''
  const gender      = searchParams.get('gender') || ''
  const origin      = searchParams.get('origin') || ''
  const tag         = searchParams.get('tag') || ''

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    setSearchParams(p)
    setPage(1)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productService.getAll({
        category: category === 'china' ? undefined : category,
        subcategory,
        sort,
        isNewArrival: isNewArrival || undefined,
        isBestSeller: isBestSeller || undefined,
        isOnSale: isOnSale || undefined,
        isFeatured: isFeatured || undefined,
        minPrice,
        maxPrice,
        gender,
        tag: tag || undefined,
        page,
        limit: LIMIT,
      })
      setProducts(res.data.products || [])
      setTotal(res.data.pagination?.total ?? res.data.total ?? 0)
    } catch (_) {}
    finally { setLoading(false) }
  }, [category, subcategory, sort, isNewArrival, isBestSeller, isOnSale, isFeatured, minPrice, maxPrice, gender, tag, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const loadCategories = useCallback(() => {
    categoryService.getAll().then(res => setCategories(res.data?.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Real-time listener for products & categories in Supabase
  useRealtimeProducts(fetchProducts)
  useRealtimeCategories(loadCategories)

  // Build dynamic chips from real data
  const quickChips = [
    { label: 'All Products', val: '', type: 'all' },
  ]
  categories.forEach(c => {
    quickChips.push({ label: `👗 ${c.name}`, val: c.slug || c._id, type: 'category' })
    ;(c.subcategories || []).forEach(s => {
      quickChips.push({ label: `🪡 ${s.name}`, val: s.name, type: 'subcategory' })
    })
  })
  quickChips.push({ label: '⚡ Top Deals', val: 'deals', type: 'deals' })

  // Page title
  let pageTitle = 'All Products'
  if (isNewArrival) pageTitle = 'Latest Onboarded Brands & New Arrivals'
  else if (isBestSeller) pageTitle = 'Trending Now — Top Picks'
  else if (isOnSale) pageTitle = 'Festive Discounts & Deals'
  else if (isFeatured) pageTitle = 'Featured Collection'
  else if (origin === 'china') pageTitle = 'Shop Factory-Direct from China'
  else if (tag) pageTitle = OCCASION_TITLES[tag] || tag.replace(/-/g, ' ')
  else if (subcategory) pageTitle = subcategory.replace(/-/g, ' ')
  else if (category) pageTitle = category

  const totalPages = Math.ceil(total / LIMIT)
  const hasFilters = !!(category || subcategory || isNewArrival || isBestSeller || isOnSale || isFeatured || minPrice || maxPrice || gender || origin || tag)

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-gray-900 pb-16">
      {/* Top Breadcrumb & Title Bar */}
      <div className="bg-white border-b border-gray-200/80 py-6 sm:py-8 shadow-2xs">
        <div className="container-markaz">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sans mb-1">
                <Link to="/" className="hover:text-[#0c5a37]">Home</Link>
                <span>/</span>
                <span className="text-[#0c5a37] font-semibold">Shop</span>
                {category && (
                  <>
                    <span>/</span>
                    <span className="capitalize">{category}</span>
                  </>
                )}
              </div>
              <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-gray-900 capitalize tracking-tight">
                {pageTitle}
              </h1>
            </div>
            {total > 0 && (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full self-start sm:self-auto font-sans">
                {total.toLocaleString()} products available
              </span>
            )}
          </div>

          {/* Quick Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-5 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {quickChips.map(chip => {
              const isActive = (chip.type === 'all' && !category && !subcategory && !origin && !isOnSale && !tag) ||
                (chip.type === 'category' && category === chip.val) ||
                (chip.type === 'subcategory' && subcategory === chip.val) ||
                (chip.type === 'deals' && isOnSale === 'true')

              const handleClick = () => {
                if (chip.type === 'all') {
                  setSearchParams({})
                } else if (chip.type === 'deals') {
                  setParam('isOnSale', 'true')
                } else if (chip.type === 'category') {
                  setParam('category', chip.val)
                } else if (chip.type === 'subcategory') {
                  setParam('subcategory', chip.val)
                }
              }

              return (
                <button
                  key={chip.label}
                  onClick={handleClick}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-[#0c5a37] text-white border-[#0c5a37] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#0c5a37] hover:text-[#0c5a37]'
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container-markaz py-6">
        {/* Filter & Sorting Controls Toolbar */}
        <div className="card-markaz p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#0c5a37] bg-white text-xs font-bold text-gray-800 transition-colors shadow-2xs font-sans"
            >
              <SlidersHorizontal size={14} className="text-[#0c5a37]" />
              <span>Filters</span>
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-[#00b884] ml-1" />
              )}
            </button>

            {/* Active filter pills */}
            {isNewArrival && <FilterPill label="New Arrivals" onRemove={() => setParam('isNewArrival', '')} />}
            {isBestSeller && <FilterPill label="Top Picks" onRemove={() => setParam('isBestSeller', '')} />}
            {isOnSale     && <FilterPill label="On Sale" onRemove={() => setParam('isOnSale', '')} />}
            {isFeatured   && <FilterPill label="Featured" onRemove={() => setParam('isFeatured', '')} />}
            {origin       && <FilterPill label={`Origin: ${origin}`} onRemove={() => setParam('origin', '')} />}
            {category     && <FilterPill label={`Category: ${category}`} onRemove={() => setParam('category', '')} />}
            {tag          && <FilterPill label={`Occasion: ${OCCASION_TITLES[tag] || tag}`} onRemove={() => setParam('tag', '')} />}
            {hasFilters && (
              <button
                onClick={() => setSearchParams({})}
                className="text-xs text-rose-600 font-bold hover:underline ml-1 font-sans"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-bold text-gray-500 font-sans hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl text-gray-800 text-xs font-bold font-sans px-3 py-2 pr-8 outline-none focus:border-[#0c5a37] cursor-pointer shadow-2xs"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Cards Grid (2 cols mobile, 3 sm, 4 md, 5 lg, 6 xl like Markaz) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-gray-200 animate-pulse h-72">
                <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3" />
                <div className="h-3 bg-gray-100 rounded-full w-4/5 mb-2" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card-markaz p-12 text-center my-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0c5a37] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={28} />
            </div>
            <h3 className="font-sans font-black text-xl text-gray-900 mb-1">No products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 font-sans">
              We couldn't find anything matching your active filters. Try resetting them or searching for something else.
            </p>
            <button
              onClick={() => setSearchParams({})}
              className="btn-forest text-xs px-6 py-2.5 font-sans"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0c5a37] hover:text-[#0c5a37] disabled:opacity-40 font-sans transition-colors shadow-2xs"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3),
              Math.min(totalPages, page + 2)
            ).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-xs font-bold font-sans transition-all ${
                  p === page
                    ? 'bg-[#0c5a37] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0c5a37] hover:text-[#0c5a37]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0c5a37] hover:text-[#0c5a37] disabled:opacity-40 font-sans transition-colors shadow-2xs"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Filter Slide-over Drawer (Clean White Layout) */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-80 bg-white text-gray-900 border-r border-gray-200 z-50 overflow-y-auto flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#0c5a37] text-white">
                <span className="font-sans text-sm font-bold tracking-wide">Filter Products</span>
                <button onClick={() => setFiltersOpen(false)} className="p-1 hover:text-gray-200">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-6 flex-1">
                {/* Sourcing Origin (Pakistan / China) */}
                <div>
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 font-sans">
                    Supplier Origin
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setParam('origin', origin === 'pakistan' ? '' : 'pakistan'); setFiltersOpen(false) }}
                      className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        origin === 'pakistan' ? 'border-[#0c5a37] bg-emerald-50 text-[#0c5a37]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>🇵🇰 Pakistan</span>
                    </button>
                    <button
                      onClick={() => { setParam('origin', origin === 'china' ? '' : 'china'); setFiltersOpen(false) }}
                      className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        origin === 'china' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>🇨🇳 China</span>
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 font-sans">
                    Category
                  </h5>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <button
                        key={cat.slug}
                        onClick={() => { setParam('category', category === cat.slug ? '' : cat.slug); setFiltersOpen(false) }}
                        className={`flex items-center justify-between w-full text-left text-xs font-medium py-1.5 px-2 rounded-lg transition-colors ${
                          category === cat.slug ? 'text-[#0c5a37] bg-emerald-50 font-bold' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {category === cat.slug && <Check size={14} className="text-[#0c5a37]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Badges */}
                <div>
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 font-sans">
                    Badge & Deals
                  </h5>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Trending Now (Top pick)', key: 'isBestSeller', val: isBestSeller },
                      { label: 'New Arrivals',             key: 'isNewArrival', val: isNewArrival },
                      { label: 'Discounted Deals',         key: 'isOnSale',     val: isOnSale },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setParam(f.key, f.val ? '' : 'true')}
                        className="flex items-center gap-2 w-full text-left text-xs font-medium py-1 text-gray-700 hover:text-[#0c5a37]"
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${f.val ? 'border-[#0c5a37] bg-[#0c5a37] text-white' : 'border-gray-300'}`}>
                          {f.val && <Check size={10} />}
                        </span>
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range (PKR) */}
                <div>
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 font-sans">
                    Price Range (PKR)
                  </h5>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min PKR"
                      value={minPrice}
                      onChange={e => setParam('minPrice', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 outline-none focus:border-[#0c5a37]"
                    />
                    <span className="text-gray-400 text-xs">–</span>
                    <input
                      type="number"
                      placeholder="Max PKR"
                      value={maxPrice}
                      onChange={e => setParam('maxPrice', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 outline-none focus:border-[#0c5a37]"
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="btn-mint w-full py-2.5 text-xs font-bold uppercase tracking-wider"
                >
                  Apply Filters
                </button>
                {hasFilters && (
                  <button
                    onClick={() => { setSearchParams({}); setFiltersOpen(false) }}
                    className="w-full py-2 text-xs font-bold text-gray-500 hover:text-rose-600 text-center block"
                  >
                    Reset All
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0c5a37] text-xs font-bold">
      {label}
      <button onClick={onRemove} className="hover:text-rose-600">
        <X size={12} />
      </button>
    </span>
  )
}
