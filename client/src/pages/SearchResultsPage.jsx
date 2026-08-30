import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../services/productService'
import ProductCard from '../components/ui/ProductCard'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import { Search } from 'lucide-react'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(false)
  const [total, setTotal]       = useState(0)

  useEffect(() => {
    if (!q.trim()) return
    setLoading(true)
    productService.getAll({ search: q, limit: 20 })
      .then(res => {
        setProducts(res.data.products || [])
        setTotal(res.data.pagination?.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-black-premium border-b border-white/5 py-12 text-center">
        <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">Search Results</p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
          "{q}"
        </h1>
        {total > 0 && (
          <p className="text-gray-mid text-sm font-sans mt-2">{total} products found</p>
        )}
      </div>

      <div className="container-luxury py-10">
        {!q.trim() ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gold/20 mb-4" />
            <p className="font-serif text-2xl text-white/40">Start typing to search</p>
          </div>
        ) : loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-white/40 mb-3">No results found</p>
            <p className="text-gray-mid font-sans text-sm">Try different keywords or browse all products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
