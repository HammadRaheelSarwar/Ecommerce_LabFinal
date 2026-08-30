import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import ProductCard from '../components/ui/ProductCard'
import { ProductGridSkeleton } from '../components/ui/Skeleton'

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory]   = useState(null)
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    setLoading(true)
    categoryService.getBySlug(slug)
      .then(res => {
        setCategory(res.data.category)
        return productService.getAll({ category: res.data.category._id, limit: 24 })
      })
      .then(res => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-gray-900 pb-16">
      {/* Category Header */}
      <div className="bg-[#0c5a37] text-white py-8 sm:py-12 relative overflow-hidden">
        <div className="container-markaz relative z-10">
          <div className="flex items-center gap-2 text-xs text-emerald-200 font-sans mb-2">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-white">Shop</Link>
            <span>/</span>
            <span className="text-white font-bold capitalize">{category?.name || slug}</span>
          </div>
          <h1 className="font-sans font-black text-3xl sm:text-4xl text-white capitalize tracking-tight">
            {category?.name || slug}
          </h1>
          {category?.description && (
            <p className="text-white/80 text-xs sm:text-sm font-sans mt-2 max-w-xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Subcategory Pills Bar */}
      {category?.subcategories?.length > 0 && (
        <div className="bg-white border-b border-gray-200 overflow-x-auto scrollbar-none py-3 shadow-2xs">
          <div className="container-markaz flex gap-2">
            <Link
              to={`/category/${slug}`}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold bg-[#0c5a37] text-white"
            >
              All
            </Link>
            {category.subcategories.map(sub => (
              <Link
                key={sub.slug}
                to={`/shop?subcategory=${sub.slug}`}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0c5a37] transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container-markaz py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans font-bold text-lg text-gray-900">
            Products in {category?.name || slug}
          </h2>
          <span className="text-xs font-semibold text-gray-500 font-sans">
            {products.length} products
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-gray-200 animate-pulse h-72">
                <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3" />
                <div className="h-3 bg-gray-100 rounded-full w-4/5 mb-2" />
                <div className="h-4 bg-gray-100 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card-markaz p-12 text-center my-6">
            <h3 className="font-sans font-bold text-lg text-gray-800 mb-1">No products found in this category</h3>
            <p className="text-xs text-gray-500 mb-4">Check back soon or explore other departments.</p>
            <Link to="/shop" className="btn-forest text-xs px-5 py-2 inline-block">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
