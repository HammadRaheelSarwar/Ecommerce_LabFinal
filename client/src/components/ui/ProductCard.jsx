import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

export default function ProductCard({ product, index = 0, showUrgency = true }) {
  const { addToCart, setCartOpen } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [hovered, setHovered] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  if (!product) return null

  const productIdentifier = product.slug || product._id || product.id

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [{ url: product.image?.url || '/images/placeholder.jpg' }]

  const inWish = isInWishlist(product._id)
  const price  = product.salePrice || product.basePrice
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice
  const discountAmount = hasDiscount ? (product.basePrice - product.salePrice) : 0

  // Calculate stock urgency
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0
  const isUrgent = totalStock > 0 && totalStock <= 5

  const handlePrevImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveImageIdx(0)
  }

  const handleNextImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveImageIdx(1)
  }

  const handleWheelScroll = (e) => {
    if (images.length <= 1) return
    if (Math.abs(e.deltaY) > 15 || Math.abs(e.deltaX) > 15) {
      if (e.deltaY > 0 || e.deltaX > 0) {
        setActiveImageIdx(1)
      } else {
        setActiveImageIdx(0)
      }
    }
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, product.variants?.[0]?.size || '', product.variants?.[0]?.color || '', 1)
    setCartOpen(true)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  // 1 Pink Floral Model image shows FIRST (activeImageIdx = 0)
  // 2 Pink Floral Cloth image shows SECOND (activeImageIdx = 1) when scroll or arrow click
  const currentIdx = activeImageIdx
  const activeImageUrl = images[currentIdx]?.url || images[0]?.url

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-2xl p-3 border border-gray-200/70 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between h-full relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={`/product/${encodeURIComponent(productIdentifier)}`}
        state={{ product }}
        className="block flex-1 flex flex-col"
      >
        {/* Image Container with Rounded Corners & Scroll Support */}
        <div
          className="relative aspect-square sm:aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden mb-3"
          onWheel={handleWheelScroll}
        >
          <img
            src={activeImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            loading="lazy"
          />

          {/* Left / Right Circular Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              {activeImageIdx > 0 && (
                <button
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  title="Show 1 Pink (Model)"
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white shadow-md border border-gray-200/60 flex items-center justify-center text-gray-700 hover:text-black z-10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              {activeImageIdx === 0 && (
                <button
                  onClick={handleNextImage}
                  aria-label="Next image"
                  title="Show 2 Pink (Cloth)"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white shadow-md border border-gray-200/60 flex items-center justify-center text-gray-700 hover:text-black z-10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </>
          )}

          {/* Dots Indicator with Click to Switch */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-full z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActiveImageIdx(i)
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIdx === i ? 'w-3.5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
            {product.isBestSeller || product.isFeatured ? (
              <span className="inline-flex items-center gap-1 bg-[#00b884] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Top pick
              </span>
            ) : hasDiscount ? (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                -{product.discountPercentage}%
              </span>
            ) : product.isNewArrival ? (
              <span className="bg-[#0c5a37] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                New
              </span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
              inWish
                ? 'text-rose-500 bg-white shadow-sm'
                : 'text-gray-400 hover:text-rose-500 bg-white/80 hover:bg-white shadow-xs'
            }`}
          >
            <Heart size={14} fill={inWish ? 'currentColor' : 'none'} />
          </button>

          {/* Urgency Badge */}
          {showUrgency && isUrgent && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                Only {totalStock} left
              </span>
            </div>
          )}

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className={`absolute bottom-2 right-2 p-2 rounded-full bg-[#0c5a37] hover:bg-[#00b884] text-white shadow-md transition-all z-10 ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
            title="Quick add to bag"
          >
            <ShoppingBag size={14} />
          </button>
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-gray-900 text-xs sm:text-sm font-sans font-medium line-clamp-2 leading-snug group-hover:text-[#0c5a37] transition-colors mb-1.5">
              {product.name}
            </h3>
          </div>

          <div>
            {/* Pricing (PKR format like screenshot) */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[#0c5a37] font-sans font-extrabold text-sm sm:text-base">
                PKR {price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-gray-400 text-xs line-through font-sans">
                  {product.basePrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Discount savings label (like screenshot: "Save PKR 4") */}
            {hasDiscount && (
              <p className="text-rose-600 text-[11px] font-bold font-sans mt-0.5">
                Save PKR {discountAmount.toLocaleString()}
              </p>
            )}

            {/* Star Rating (like screenshot: ★ 5.0) */}
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-gray-700 font-sans">
                {product.rating > 0 ? Number(product.rating).toFixed(1) : '5.0'}
              </span>
              {product.reviewCount > 0 && (
                <span className="text-[10px] text-gray-400 font-sans">({product.reviewCount})</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
