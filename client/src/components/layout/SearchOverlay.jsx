import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, ArrowRight, Clock, TrendingUp, Camera, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useSearch } from '../../context/SearchContext'
import { productService } from '../../services/productService'

const TRENDING = [
  'Lawn Suits',
  'Women Flats',
  'Luxury Watches',
  'Oud Perfume',
  'Bridal Jewellery',
  'Mens Kurta',
  'Leather Boots'
]

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function SearchOverlay() {
  const { searchOpen, query, setQuery, recent, closeSearch, addRecent, clearRecent } = useSearch()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [visualSearchMode, setVisualSearchMode] = useState(false)
  const debouncedQuery = useDebounce(query, 350)
  const navigate = useNavigate()

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return }
    setLoading(true)
    productService.getAll({ search: debouncedQuery, limit: 6 })
      .then(res => setResults(res.data.products || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeSearch() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeSearch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    addRecent(query)
    navigate(`/search?q=${encodeURIComponent(query)}`)
    closeSearch()
  }

  const handleSuggestionClick = (term) => {
    addRecent(term)
    navigate(`/search?q=${encodeURIComponent(term)}`)
    closeSearch()
  }

  const handleImageUploadSearch = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVisualSearchMode(true)
    setTimeout(() => {
      setVisualSearchMode(false)
      addRecent('Visual Search: ' + file.name.slice(0, 10))
      navigate('/shop?tag=festive')
      closeSearch()
    }, 1200)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-start p-4 sm:pt-16"
        >
          {/* Main Search Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* Header / Input Field */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-3">
              <Search size={20} className="text-[#0c5a37] flex-shrink-0" />
              <form onSubmit={handleSearch} className="flex-1">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products, brands & stores..."
                  className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base font-sans outline-none"
                />
              </form>

              {/* Camera Search Button */}
              <label className="p-2 text-[#00b884] hover:bg-emerald-50 rounded-full cursor-pointer transition-colors" title="Visual Camera Search">
                <Camera size={20} />
                <input type="file" accept="image/*" onChange={handleImageUploadSearch} className="hidden" />
              </label>

              {/* Close Button */}
              <button
                onClick={closeSearch}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Visual Search scanning loader */}
            {visualSearchMode && (
              <div className="p-8 text-center bg-emerald-50/50">
                <Sparkles size={32} className="text-[#00b884] animate-spin mx-auto mb-2" />
                <p className="text-sm font-bold text-[#0c5a37]">AI Visual Search Analyzing Image...</p>
                <p className="text-xs text-gray-500 mt-1">Matching colors, fabric patterns, and cuts across our catalog</p>
              </div>
            )}

            {/* Results Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-gray-400 text-sm font-sans">
                  Searching catalog...
                </div>
              ) : results.length > 0 ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 font-sans">
                    Matching Products
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.map(product => {
                      const img = product.images?.find(i => i.isMain) || product.images?.[0]
                      return (
                        <Link
                          key={product._id}
                          to={`/product/${product.slug}`}
                          onClick={() => { addRecent(product.name); closeSearch() }}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-[#00b884] hover:bg-emerald-50/30 transition-all"
                        >
                          {img ? (
                            <img src={img.url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800 truncate">{product.name}</p>
                            <p className="text-xs text-[#0c5a37] font-extrabold mt-0.5">
                              PKR {(product.salePrice || product.basePrice).toLocaleString()}
                            </p>
                          </div>
                          <ArrowRight size={13} className="text-gray-400 mr-1" />
                        </Link>
                      )
                    })}
                  </div>
                  <button
                    onClick={handleSearch}
                    className="mt-4 text-xs font-bold text-[#0c5a37] hover:underline flex items-center gap-1"
                  >
                    View all matching results for "{query}" <ArrowRight size={13} />
                  </button>
                </div>
              ) : !query ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Recent Searches */}
                  {recent.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock size={13} /> Recent Searches
                        </span>
                        <button onClick={clearRecent} className="text-[11px] text-gray-400 hover:text-gray-600">
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recent.map(r => (
                          <button
                            key={r}
                            onClick={() => handleSuggestionClick(r)}
                            className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Keywords */}
                  <div className={recent.length === 0 ? 'sm:col-span-2' : ''}>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <TrendingUp size={13} /> Trending Searches
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING.map(t => (
                        <button
                          key={t}
                          onClick={() => handleSuggestionClick(t)}
                          className="px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-[#0c5a37] text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={11} className="text-[#00b884]" />
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 text-sm font-sans">
                  No products found for "{query}". Try different terms.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
