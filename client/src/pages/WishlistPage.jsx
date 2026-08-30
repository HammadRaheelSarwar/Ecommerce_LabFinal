import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { Heart, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import ProductCard from '../components/ui/ProductCard'

export default function WishlistPage() {
  const { wishlist } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (wishlist.length === 0) { setProducts([]); return }
    setLoading(true)
    // Fetch products by IDs — we batch fetch
    Promise.all(wishlist.slice(0, 20).map(id =>
      productService.getById(id).then(r => r.data.product).catch(() => null)
    ))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [wishlist])

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-black-premium border-b border-white/5 py-12 text-center">
        <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">Saved Items</p>
        <h1 className="font-serif text-4xl font-bold text-white">MY WISHLIST</h1>
      </div>

      <div className="container-luxury py-10">
        {wishlist.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <Heart size={48} className="text-gold/20 mb-4" />
            <p className="font-serif text-2xl text-white/50 mb-3">Your wishlist is empty</p>
            <p className="text-gray-mid text-sm font-sans mb-8">Save items you love and come back to them later.</p>
            <Link to="/shop" className="btn-gold text-xs">EXPLORE COLLECTION</Link>
          </div>
        ) : loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
