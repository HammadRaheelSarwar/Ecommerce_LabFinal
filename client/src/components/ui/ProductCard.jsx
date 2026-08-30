import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

export default function ProductCard({ product, index = 0, showUrgency = true }) {
  const { addToCart, setCartOpen } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [hovered, setHovered] = useState(false)

  if (!product) return null

  const mainImg  = product.images?.find(i => i.isMain)  || product.images?.[0]
  const hoverImg = product.images?.find(i => i.isHover) || product.images?.[1]
  const inWish = isInWishlist(product._id)
  const price  = product.salePrice || product.basePrice
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice
  const discountAmount = hasDiscount ? (product.basePrice - product.salePrice) : 0

  // Calculate stock urgency
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0
  const isUrgent = totalStock > 0 && totalStock <= 5

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-2xl p-3 border border-gray-200/70 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="block flex-1 flex flex-col">
        {/* Image Container with Rounded Corners */}
        <div className="relative aspect-square sm:aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden mb-3">
          <img
            src={hovered && hoverImg ? hoverImg.url : mainImg?.url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            loading="lazy"
          />

          {/* Top Badges (like screenshot: "● Top pick" or "-29%") */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
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
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              inWish
                ? 'text-rose-500 bg-white shadow-sm'
                : 'text-gray-400 hover:text-rose-500 bg-white/80 hover:bg-white shadow-xs'
            }`}
          >
            <Heart size={14} fill={inWish ? 'currentColor' : 'none'} />
          </button>

          {/* Urgency Badge at bottom of image (like screenshot: "Only 3 left" / "Only 4 left") */}
          {showUrgency && isUrgent && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                Only {totalStock} left
              </span>
            </div>
          )}

          {/* Quick Add Button (appears on hover) */}
          <button
            onClick={handleQuickAdd}
            className={`absolute bottom-2 right-2 p-2 rounded-full bg-[#0c5a37] hover:bg-[#00b884] text-white shadow-md transition-all ${
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
