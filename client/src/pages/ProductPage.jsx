import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Heart, Star, Minus, Plus, Share2,
  ChevronLeft, ChevronRight, ZoomIn, ShieldCheck, Truck, RotateCcw,
  Banknote, X, Check, Zap, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { productService } from '../services/productService'
import { reviewService } from '../services/contentService'
import { analyticsService } from '../services/analyticsService'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { addRecentlyViewed, getRecentlyViewed } from '../utils/recentlyViewed'
import ProductCard from '../components/ui/ProductCard'
import BuyNowModal from '../components/product/BuyNowModal'
import { CATEGORIES_DATA } from '../data/categoriesData'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, setCartOpen } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [categoryProducts, setCategoryProducts] = useState([])
  const [recentlyViewedList, setRecentlyViewedList] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Gallery state
  const [selectedImage, setSelectedImage] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })

  // Variant selection
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buyNowOpen, setBuyNowOpen] = useState(false)
  const [tab, setTab] = useState('description')

  // Load product & associated sections
  useEffect(() => {
    setLoading(true)
    setSelectedSize('')
    setSelectedColor('')
    setQuantity(1)
    setSelectedImage(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    productService.getBySlug(slug)
      .then(res => {
        const p = res.data?.product
        if (!p) {
          setProduct(null)
          return
        }
        setProduct(p)

        // Track view and record recently viewed
        analyticsService.trackProductView(p)
        addRecentlyViewed(p)
        setRecentlyViewedList(getRecentlyViewed(p.slug))

        // Pre-select variant if available
        const firstInStock = p.variants?.find(v => v.stock > 0) || p.variants?.[0]
        if (firstInStock) {
          if (firstInStock.size) setSelectedSize(firstInStock.size)
          if (firstInStock.color) setSelectedColor(firstInStock.color)
        }

        // Fetch similar products via backend endpoint
        productService.getSimilar(p.slug, 12)
          .then(simRes => setSimilarProducts(simRes.data?.products || []))
          .catch(() => {})

        // Fetch category siblings
        const catId = p.category?._id || p.category?.id || p.categoryId || p.category_id
        if (catId) {
          productService.getAll({ category: catId, limit: 12 })
            .then(catRes => {
              setCategoryProducts((catRes.data?.products || []).filter(item => item.slug !== p.slug))
            })
            .catch(() => {})
        }

        // Fetch approved reviews safely without breaking product state
        reviewService.getApproved({ product: p.slug, limit: 10 })
          .then(revRes => {
            if (revRes?.data?.reviews) setReviews(revRes.data.reviews)
          })
          .catch(() => {})
      })
      .catch((err) => {
        console.warn('Could not load product:', err)
        setProduct(null)
      })
      .finally(() => setLoading(false))
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0c5a37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-xs">
          <h2 className="font-sans text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 text-xs font-sans mb-6">The requested product could not be found or has been removed.</p>
          <Link to="/shop" className="btn-mint text-xs px-6 py-2.5 inline-flex items-center gap-2">
            <span>Browse All Products</span>
          </Link>
        </div>
      </div>
    )
  }

  const inWish = isInWishlist(product._id)
  const price = product.salePrice || product.basePrice
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice
  const discountAmount = hasDiscount ? (product.basePrice - product.salePrice) : 0

  // Variants calculations
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

  const totalStock = variants.length > 0
    ? (selectedVariant ? selectedVariant.stock : variants.reduce((sum, v) => sum + (v.stock || 0), 0))
    : 10 // fallback if simple product without variants

  const isOutOfStock = totalStock <= 0
  const isUrgentStock = totalStock > 0 && totalStock <= 5

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80', isMain: true }]

  // Validation helper
  const validateSelection = () => {
    if (isOutOfStock) {
      toast.error('This product is currently out of stock.')
      return false
    }
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size.')
      return false
    }
    if (colorsForSize.length > 0 && !selectedColor) {
      toast.error('Please select a color.')
      return false
    }
    return true
  }

  // Add to Cart
  const handleAddToCart = () => {
    if (!validateSelection()) return
    setAddingToCart(true)
    addToCart(product, selectedSize, selectedColor, quantity)
    analyticsService.trackAddToCart(product, { size: selectedSize, color: selectedColor }, quantity)
    setAddingToCart(false)
    setCartOpen(true)
  }

  // Buy Now
  const handleBuyNow = () => {
    if (!validateSelection()) return
    analyticsService.trackBuyNowClick(product, { size: selectedSize, color: selectedColor }, quantity)
    setBuyNowOpen(true)
  }

  // Wishlist toggle
  const handleToggleFavorite = () => {
    toggleWishlist(product)
    analyticsService.trackAddToWishlist(product)
  }

  // Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Product link copied!')
    }
  }

  // Image Hover Zoom handler
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPos({ x, y })
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-gray-900 pb-20 md:pb-16 font-sans">
      {/* Top Breadcrumbs */}
      <div className="bg-white border-b border-[#EAECF0] py-3.5 shadow-2xs">
        <div className="container-markaz">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#070A56] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-400" />
            <Link to="/shop" className="hover:text-[#070A56] transition-colors">Shop</Link>
            {product.category && (
              <>
                <ChevronRight size={12} className="text-gray-400" />
                <Link to={`/category/${product.category.slug || ''}`} className="hover:text-[#070A56] capitalize transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            {product.subcategory && (
              <>
                <ChevronRight size={12} className="text-gray-400" />
                <Link
                  to={`/category/${product.category?.slug || 'all'}/${encodeURIComponent(product.subcategory)}`}
                  className="hover:text-[#070A56] capitalize transition-colors"
                >
                  {product.subcategory}
                </Link>
              </>
            )}
            <ChevronRight size={12} className="text-gray-400" />
            <span className="text-[#070A56] font-bold truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Details Card */}
      <div className="container-markaz py-6 sm:py-8">
        <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-[#EAECF0] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
            {/* ── LEFT: Product Images & Gallery (5 cols on lg) ── */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
              {/* Main Image Viewport */}
              <div
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setZoomOpen(true)}
                className="relative aspect-square bg-[#F8F9FA] rounded-2xl overflow-hidden mb-3.5 border border-[#EAECF0] cursor-zoom-in group select-none"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    src={images[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                    style={
                      isZooming
                        ? {
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            transform: 'scale(1.8)',
                            transition: 'transform 0.1s ease-out',
                          }
                        : undefined
                    }
                  />
                </AnimatePresence>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.isBestSeller ? (
                    <span className="bg-[#070A56] text-[#D4AF37] text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-[#D4AF37]/30">
                      <Sparkles size={11} /> BEST SELLER
                    </span>
                  ) : hasDiscount ? (
                    <span className="bg-[#E53935] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                      {product.discountPercentage || Math.round((discountAmount / product.basePrice) * 100)}% OFF
                    </span>
                  ) : product.isNewArrival ? (
                    <span className="bg-[#02BC87] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                      NEW ARRIVAL
                    </span>
                  ) : null}
                </div>

                {/* Quick Zoom Button */}
                <button
                  type="button"
                  aria-label="Zoom image"
                  onClick={(e) => { e.stopPropagation(); setZoomOpen(true) }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition-all z-10"
                >
                  <ZoomIn size={17} />
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(i => (i - 1 + images.length) % images.length)
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-gray-800 shadow-md flex items-center justify-center hover:bg-[#070A56] hover:text-[#D4AF37] transition-all z-10"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(i => (i + 1) % images.length)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-gray-800 shadow-md flex items-center justify-center hover:bg-[#070A56] hover:text-[#D4AF37] transition-all z-10"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[#F8F9FA] p-1 ${
                        i === selectedImage
                          ? 'border-[#D4AF37] shadow-sm scale-102'
                          : 'border-[#EAECF0] opacity-70 hover:opacity-100 hover:border-gray-300'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product Information & Action Buttons (7 cols on lg) ── */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between">
              <div>
                {/* Brand & Action Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] sm:text-xs font-bold text-[#070A56] tracking-[0.15em] uppercase">
                    {product.brand || product.category?.name || 'All Available Exclusive'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      title="Share product"
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Share2 size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      title={inWish ? 'Remove from Favorites' : 'Add to Favorites'}
                      className={`p-2 rounded-full transition-all ${
                        inWish
                          ? 'text-rose-600 bg-rose-50'
                          : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Heart size={20} fill={inWish ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans tracking-tight leading-snug mb-3">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100/80">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={13}
                          className={star <= Math.round(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#0c5a37] font-sans ml-1">
                      {product.rating ? Number(product.rating).toFixed(1) : '4.9'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-sans">
                    ({product.reviewCount || reviews.length || 18} Verified Reviews)
                  </span>
                </div>

                {/* Price Display (Clean Markaz Emerald Card) */}
                <div className="bg-[#F0FDF4] rounded-2xl p-4 sm:p-5 border border-[#DCFCE7] mb-6">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-[#0c5a37] tracking-tight">
                      PKR {price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-gray-400 text-base line-through font-sans">
                        PKR {product.basePrice.toLocaleString()}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="bg-[#E53935] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                        Save PKR {discountAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#0c5a37] font-medium mt-1.5 flex items-center gap-1.5">
                    <Check size={14} className="text-[#00b884]" /> Inclusive of all local taxes. Cash on delivery available nationwide.
                  </p>
                </div>

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Size: {selectedSize ? <strong className="text-[#0c5a37]">{selectedSize}</strong> : <span className="text-gray-400 font-normal">Please select</span>}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(size => {
                        const hasStock = variants.some(v => v.size === size && v.stock > 0)
                        const isSelected = selectedSize === size
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={!hasStock}
                            onClick={() => { setSelectedSize(size); setSelectedColor('') }}
                            className={`min-w-[3.2rem] h-10 px-3.5 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#0c5a37] text-white border-[#0c5a37] shadow-sm scale-102'
                                : !hasStock
                                  ? 'border-gray-200 text-gray-300 line-through cursor-not-allowed bg-gray-50'
                                  : 'border-gray-200 text-gray-700 bg-white hover:border-[#00b884]'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {colorsForSize.length > 0 && (
                  <div className="mb-5">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                      Color: {selectedColor ? <strong className="text-[#0c5a37]">{selectedColor}</strong> : <span className="text-gray-400 font-normal">Please select</span>}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {colorsForSize.map(color => {
                        const isSelected = selectedColor === color
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#0c5a37] text-white border-[#0c5a37] shadow-sm'
                                : 'border-gray-200 text-gray-700 bg-white hover:border-[#00b884]'
                            }`}
                          >
                            {color}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Urgency or Out of Stock Tag */}
                {isOutOfStock ? (
                  <div className="mb-5 p-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" /> Out of Stock
                  </div>
                ) : isUrgentStock ? (
                  <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                    <Zap size={14} className="text-amber-600 fill-amber-600 animate-bounce" />
                    <span>Hurry! Only {totalStock} item{totalStock > 1 ? 's' : ''} left in stock.</span>
                  </div>
                ) : null}

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-[#F8F9FA] p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-[#0c5a37] hover:bg-white transition-all disabled:opacity-30 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-black text-[#0c5a37]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.min(totalStock || 10, q + 1))}
                      disabled={quantity >= totalStock || isOutOfStock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-[#0c5a37] hover:bg-white transition-all disabled:opacity-30 cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    Max: {totalStock || 1}
                  </span>
                </div>

                {/* ── ACTION BUTTONS: ADD TO CART & BUY NOW (Markaz Style) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {/* ADD TO CART: White background, Emerald Green border & text */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || addingToCart}
                    className="w-full bg-white hover:bg-emerald-50/80 text-[#0c5a37] border-2 border-[#0c5a37] font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider text-xs sm:text-sm"
                  >
                    <ShoppingBag size={18} />
                    <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                  </button>

                  {/* BUY NOW: Solid Vibrant Markaz Emerald Green */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full bg-gradient-to-r from-[#00b884] to-[#0c5a37] hover:brightness-105 text-white font-black py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider text-xs sm:text-sm"
                  >
                    <Zap size={18} className="fill-white" />
                    <span>BUY NOW</span>
                  </button>
                </div>

                {/* Dedicated Add to Favorites Button */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    inWish
                      ? 'border-rose-200 bg-rose-50/70 text-rose-600'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#00b884] hover:text-[#0c5a37]'
                  }`}
                >
                  <Heart size={16} fill={inWish ? 'currentColor' : 'none'} />
                  <span>{inWish ? '♥ Added to Favorites' : '♡ Add to Favorites'}</span>
                </button>

                {/* Trust Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 mt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
                    <Banknote size={18} className="text-[#00b884] flex-shrink-0" />
                    <span className="text-[11px] font-bold text-gray-800">Cash on Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
                    <Truck size={18} className="text-[#00b884] flex-shrink-0" />
                    <span className="text-[11px] font-bold text-gray-800">Fast Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
                    <RotateCcw size={18} className="text-[#00b884] flex-shrink-0" />
                    <span className="text-[11px] font-bold text-gray-800">7-Day Easy Returns</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
                    <ShieldCheck size={18} className="text-[#00b884] flex-shrink-0" />
                    <span className="text-[11px] font-bold text-gray-800">Verified Supplier</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 mt-8 border border-[#EAECF0] shadow-xs">
          <div className="flex gap-6 border-b border-gray-200 pb-3 mb-6 overflow-x-auto">
            {[
              { key: 'description', label: 'Description' },
              { key: 'specifications', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${reviews.length})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-xs sm:text-sm font-bold uppercase tracking-wider transition-all pb-2.5 -mb-3 capitalize ${
                  tab === t.key
                    ? 'text-[#0c5a37] border-b-2 border-[#00b884]'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <div className="text-gray-700 text-xs sm:text-sm leading-relaxed max-w-3xl space-y-3 font-sans">
              <p>{product.description || product.shortDescription || 'Experience authentic Pakistani craftsmanship and luxury retail quality with this piece from All Available.'}</p>
            </div>
          )}

          {tab === 'specifications' && (
            <div className="max-w-md space-y-2 text-xs font-sans">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Brand</span>
                <span className="font-bold text-gray-900">{product.brand || 'All Available'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Category</span>
                <span className="font-bold text-gray-900">{product.category?.name}</span>
              </div>
              {product.subcategory && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Subcategory</span>
                  <span className="font-bold text-gray-900">{product.subcategory}</span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Material</span>
                  <span className="font-bold text-gray-900">{product.material}</span>
                </div>
              )}
              {product.gender && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Gender</span>
                  <span className="font-bold text-gray-900 capitalize">{product.gender}</span>
                </div>
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-gray-500">No customer reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map(r => (
                  <div key={r._id} className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE8DC]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#070A56]">{r.user?.fullName || 'Verified Customer'}</span>
                      <div className="flex gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={11} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 font-sans">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── SIMILAR ITEMS / YOU MAY ALSO LIKE (Requirement 8) ── */}
        {similarProducts.length > 0 && (
          <section aria-label="Similar Items" className="mt-12">
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="w-8 h-1 bg-[#D4AF37] rounded-full mb-1.5" />
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#070A56]">
                  Similar Items
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Hand-picked alternatives with matching category, style and pricing.
                </p>
              </div>
              <Link to={`/category/${product.category?.slug || 'all'}`} className="text-xs font-bold text-[#070A56] hover:text-[#D4AF37] transition-colors font-sans">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {similarProducts.slice(0, 6).map((p, i) => (
                <ProductCard key={p._id || i} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── MORE FROM THIS CATEGORY (Requirement 9) ── */}
        {categoryProducts.length > 0 && (
          <section aria-label="More from Category" className="mt-12">
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="w-8 h-1 bg-[#02BC87] rounded-full mb-1.5" />
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#070A56]">
                  More From {product.category?.name || 'This Category'}
                </h3>
              </div>
              <Link to={`/category/${product.category?.slug || 'all'}`} className="text-xs font-bold text-[#070A56] hover:text-[#02BC87] transition-colors font-sans">
                Browse Category →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categoryProducts.slice(0, 6).map((p, i) => (
                <ProductCard key={p._id || i} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── RECENTLY VIEWED (Requirement 9 & 30) ── */}
        {recentlyViewedList.length > 0 && (
          <section aria-label="Recently Viewed" className="mt-12">
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="w-8 h-1 bg-gray-400 rounded-full mb-1.5" />
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#070A56]">
                  Recently Viewed
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {recentlyViewedList.slice(0, 6).map((p, i) => (
                <ProductCard key={p._id || i} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── STICKY PRODUCT ACTIONS ON MOBILE (Requirement 27) ── */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-[#EAECF0] shadow-2xl">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className="flex-1 bg-[#050505] text-[#D4AF37] border-2 border-[#D4AF37] font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 disabled:opacity-50 uppercase tracking-wider"
          >
            <ShoppingBag size={15} />
            <span>ADD TO CART</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 bg-[#D4AF37] text-black font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 disabled:opacity-50 uppercase tracking-wider"
          >
            <Zap size={15} className="fill-black" />
            <span>BUY NOW</span>
          </button>
        </div>
      </div>

      {/* ── BUY NOW MODAL (Requirements 10–24) ── */}
      <BuyNowModal
        isOpen={buyNowOpen}
        onClose={() => setBuyNowOpen(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
      />

      {/* ── LIGHTBOX ZOOM MODAL ── */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setZoomOpen(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
          >
            <X size={24} />
          </button>
          <img
            src={images[selectedImage]?.url}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
