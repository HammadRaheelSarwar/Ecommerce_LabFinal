import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import ProductCard from '../components/ui/ProductCard'

export default function WishlistPage() {
  const { wishlist, favoriteItems } = useWishlist()
  const [products, setProducts] = useState(favoriteItems || [])
  const [loading, setLoading]   = useState(false)

  // Keep synced with favoriteItems
  useEffect(() => {
    if (favoriteItems && favoriteItems.length > 0) {
      setProducts(favoriteItems)
    } else if (wishlist.length > 0) {
      setLoading(true)
      // Hydrate from API if items were stored as IDs only
      Promise.all(
        wishlist.slice(0, 24).map(idOrSlug =>
          productService.getById(idOrSlug)
            .then(r => r.data.product)
            .catch(() => productService.getBySlug(idOrSlug).then(r => r.data.product).catch(() => null))
        )
      )
        .then(results => setProducts(results.filter(Boolean)))
        .finally(() => setLoading(false))
    } else {
      setProducts([])
    }
  }, [favoriteItems, wishlist])

  const totalCount = products.length

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-16">
      {/* Header Banner matching Markaz */}
      <div className="bg-white border-b border-gray-200/80 py-8 sm:py-10 shadow-2xs">
        <div className="container-markaz">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-sans mb-2">
            <Link to="/" className="hover:text-[#0c5a37] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#0c5a37] font-semibold">Favorites</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#070A56] tracking-tight">
                My Favorites
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm font-sans mt-1">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} saved for quick ordering
              </p>
            </div>
            {totalCount > 0 && (
              <Link
                to="/shop"
                className="btn-mint text-xs px-5 py-2.5 inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-markaz py-8">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center max-w-xl mx-auto border border-gray-200/80 shadow-xs my-8">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <Heart size={32} />
            </div>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Your favorites list is empty
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm font-sans mb-7 leading-relaxed">
              Tap the heart icon on any product in our catalog to save it here and order anytime!
            </p>
            <Link to="/shop" className="btn-mint text-xs px-6 py-3 inline-flex items-center gap-2">
              <ShoppingBag size={15} />
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {products.map((p, i) => (
              <ProductCard key={p._id || p.id || p.slug || i} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
