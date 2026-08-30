import { useWishlist } from '../../context/WishlistContext'
import { useEffect, useState } from 'react'
import { productService } from '../../services/productService'
import ProductCard from '../../components/ui/ProductCard'
import { ProductGridSkeleton } from '../../components/ui/Skeleton'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AccountWishlistPage() {
  const { wishlist } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!wishlist.length) { setProducts([]); return }
    setLoading(true)
    Promise.all(wishlist.slice(0, 20).map(id =>
      productService.getById(id).then(r => r.data.product).catch(() => null)
    ))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [wishlist])

  return (
    <div>
      <h2 className="font-sans font-bold text-white text-sm tracking-widest uppercase mb-6">My Wishlist ({wishlist.length})</h2>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-black-card border border-white/5">
          <Heart size={36} className="text-gold/20 mx-auto mb-3" />
          <p className="text-gray-mid text-sm font-sans mb-4">Your wishlist is empty.</p>
          <Link to="/shop" className="btn-gold text-xs">EXPLORE COLLECTION</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}
