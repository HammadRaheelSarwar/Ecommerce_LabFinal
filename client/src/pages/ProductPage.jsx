import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Heart, Star, Minus, Plus, Share2,
  ChevronLeft, ChevronRight, ZoomIn, ShieldCheck, Truck, RotateCcw, Banknote
} from 'lucide-react'
import toast from 'react-hot-toast'
import { productService } from '../services/productService'
import { reviewService } from '../services/contentService'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ui/ProductCard'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, setCartOpen } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { isAuthenticated } = useAuth()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [tab, setTab] = useState('description')
  const [zoomOpen, setZoomOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setSelectedSize('')
    setSelectedColor('')
    setQuantity(1)
    setSelectedImage(0)

    productService.getBySlug(slug)
      .then(res => {
        const p = res.data.product
        setProduct(p)
        // Auto-select first available variant
        const firstVariant = p.variants?.find(v => v.stock > 0)
        if (firstVariant) {
          setSelectedSize(firstVariant.size || '')
          setSelectedColor(firstVariant.color || '')
        }
        return productService.getAll({ category: p.category?._id, limit: 6 })
      })
      .then(res => setRelated((res.data.products || []).filter(p => p.slug !== slug)))
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!product) return
    reviewService.getApproved({ product: slug, limit: 5 })
      .then(res => setReviews(res.data.reviews || []))
      .catch(() => {})
  }, [slug, product])

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#f8f6f0] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0c5a37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inWish = isInWishlist(product._id)
  const price = product.salePrice || product.basePrice
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice
  const discountAmount = hasDiscount ? (product.basePrice - product.salePrice) : 0

  // Variants logic
  const variants = product.variants || []
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))]
  const colorsForSize = [...new Set(
    variants
      .filter(v => (!selectedSize || v.size === selectedSize) && v.stock > 0)
      .map(v => v.color)
      .filter(Boolean)
  )]

  const selectedVariant = variants.find(
    v => (!selectedSize || v.size === selectedSize) &&
         (!selectedColor || v.color === selectedColor)
  )
  const stock = selectedVariant ? selectedVariant.stock : variants.reduce((s, v) => s + (v.stock || 0), 0)
  const isOutOfStock = stock <= 0

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    if (colorsForSize.length > 0 && !selectedColor) {
      toast.error('Please select a color')
      return
    }
    setAddingToCart(true)
    addToCart(product, selectedSize, selectedColor, quantity)
    setAddingToCart(false)
    setCartOpen(true)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-gray-900 pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200/80 py-3 shadow-2xs">
        <div className="container-markaz">
          <nav className="flex items-center gap-2 text-xs font-sans text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#0c5a37]">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[#0c5a37]">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/category/${product.category.slug}`} className="hover:text-[#0c5a37] capitalize">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-markaz py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">
            {/* LEFT — Product Images */}
            <div>
              {/* Main Image Box */}
              <div
                className="relative aspect-square sm:aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-gray-200/60 cursor-zoom-in group"
                onClick={() => setZoomOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    src={product.images?.[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Badge (Top pick / Discount) */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {product.isBestSeller || product.isFeatured ? (
                    <span className="bg-[#00b884] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                      ● Top pick
                    </span>
                  ) : hasDiscount ? (
                    <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                      -{product.discountPercentage}% OFF
                    </span>
                  ) : null}
                </div>

                <button className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full text-gray-700 shadow-xs transition-colors">
                  <ZoomIn size={16} />
                </button>

                {/* Left/Right Arrows */}
                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedImage(i => (i - 1 + product.images.length) % product.images.length) }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-[#0c5a37] transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedImage(i => (i + 1) % product.images.length) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-[#0c5a37] transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        i === selectedImage ? 'border-[#0c5a37] shadow-xs' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Product Details */}
            <div className="flex flex-col justify-between space-y-5">
              <div>
                {/* Brand / Category */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0c5a37] uppercase tracking-wider font-sans">
                    {product.brand || product.category?.name || 'Verified Supplier'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Share product"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-2 transition-colors ${inWish ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                      title="Add to Wishlist"
                    >
                      <Heart size={18} fill={inWish ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="font-sans font-black text-2xl sm:text-3xl text-gray-900 leading-snug mb-2">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-900 font-sans">
                      {product.rating > 0 ? Number(product.rating).toFixed(1) : '5.0'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-sans">
                    ({product.reviewCount || 12} customer reviews)
                  </span>
                </div>

                {/* Price Display (Markaz PKR format) */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-5">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-sans font-black text-2xl sm:text-3xl text-[#0c5a37]">
                      PKR {price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-gray-400 text-base line-through font-sans">
                        PKR {product.basePrice.toLocaleString()}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full font-sans">
                        Save PKR {discountAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 font-sans">
                    Inclusive of all local taxes. Cash on Delivery available at checkout.
                  </p>
                </div>

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                      Select Size: {selectedSize && <span className="text-[#0c5a37] font-extrabold">{selectedSize}</span>}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(size => {
                        const hasStock = variants.some(v => v.size === size && v.stock > 0)
                        return (
                          <button
                            key={size}
                            disabled={!hasStock}
                            onClick={() => { setSelectedSize(size); setSelectedColor('') }}
                            className={`min-w-[3rem] h-10 px-3 rounded-xl border text-xs font-bold font-sans transition-all ${
                              selectedSize === size
                                ? 'border-[#0c5a37] bg-[#0c5a37] text-white shadow-xs'
                                : !hasStock
                                  ? 'border-gray-200 text-gray-300 line-through cursor-not-allowed bg-gray-50'
                                  : 'border-gray-200 text-gray-700 hover:border-[#0c5a37]'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {colorsForSize.length > 0 && (
                  <div className="mb-5">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                      Select Color: {selectedColor && <span className="text-[#0c5a37] font-extrabold">{selectedColor}</span>}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {colorsForSize.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold font-sans transition-all ${
                            selectedColor === color
                              ? 'border-[#0c5a37] bg-emerald-50 text-[#0c5a37]'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Urgency Tag */}
                {stock > 0 && stock <= 5 && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                    <span>⚡ Hurry! Only {stock} items left in stock</span>
                  </div>
                )}

                {/* Qty & Add to Cart Controls */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900 font-sans">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(stock || 10, q + 1))}
                      disabled={quantity >= stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || addingToCart}
                    className="btn-mint flex-1 py-3 text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <ShoppingBag size={16} />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                  </button>
                </div>

                {/* Trust Highlights Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 text-gray-700">
                    <Banknote size={18} className="text-[#00b884] flex-shrink-0" />
                    <span className="text-[11px] font-bold">Cash on Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 text-gray-700">
                    <Truck size={18} className="text-[#00b884] flex-shrink-0" />
                    <span className="text-[11px] font-bold">Fast Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 text-gray-700">
                    <RotateCcw size={18} className="text-[#00b884] flex-shrink-0" />
                    <span className="text-[11px] font-bold">7-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 text-gray-700">
                    <ShieldCheck size={18} className="text-[#00b884] flex-shrink-0" />
                    <span className="text-[11px] font-bold">Verified Seller</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (Description / Specifications / Reviews) */}
        <div className="card-markaz mt-8 p-6 sm:p-8">
          <div className="flex gap-6 border-b border-gray-200 pb-3 mb-6 overflow-x-auto">
            {['description', 'specifications', 'reviews'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs font-bold uppercase tracking-wider transition-colors pb-2 -mb-3 capitalize ${
                  tab === t
                    ? 'text-[#0c5a37] border-b-2 border-[#0c5a37]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            {tab === 'description' && (
              <div className="prose max-w-none text-gray-700 text-xs sm:text-sm leading-relaxed font-sans">
                <p>{product.description || 'No detailed description provided.'}</p>
              </div>
            )}

            {tab === 'specifications' && (
              <div className="space-y-2 max-w-md text-xs font-sans">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-bold text-gray-800">{product.brand || 'All Available'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Category</span>
                  <span className="font-bold text-gray-800">{product.category?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">SKU</span>
                  <span className="font-bold text-gray-800">{product.sku}</span>
                </div>
              </div>
            )}

            {tab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-gray-500 font-sans">No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map(r => (
                    <div key={r._id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">{r.user?.fullName || 'Verified Buyer'}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-sans">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel / Shelf */}
        {related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-extrabold text-xl text-gray-900">
                You May Also Like
              </h3>
              <Link to="/shop" className="text-xs font-bold text-[#0c5a37] hover:underline font-sans">
                See all products →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
