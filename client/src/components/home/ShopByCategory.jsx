import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categoryService } from '../../services/categoryService'
import { useRealtimeCategories } from '../../services/realtimeService'

const DEFAULT_ROW_1 = [
  { name: 'Cosmetics',            slug: 'cosmetics',           img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&q=80' },
  { name: 'Womens Stitched',      slug: 'womens-stitched',     img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&q=80' },
  { name: 'Kids Clothing',        slug: 'kids-clothing',       img: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=160&q=80' },
  { name: 'Mens Stitched',        slug: 'mens-stitched',       img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=160&q=80' },
  { name: 'Jewellery',            slug: 'jewellery',           img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=160&q=80' },
  { name: 'Fashion Accessories',  slug: 'fashion-accessories', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&q=80' },
  { name: 'Bedding',              slug: 'bedding',             img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=160&q=80' },
  { name: 'Festive Collection',   slug: 'festive-collection',  img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=160&q=80' },
  { name: 'Islamic Accessories',  slug: 'islamic-accessories', img: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=160&q=80' },
]

const DEFAULT_ROW_2 = [
  { name: 'Womens Unstitched',    slug: 'women-s-unstitched',  img: '/images/products/unstitched-shirt/product-1-1.webp' },
  { name: 'Mens Unstitched',      slug: 'mens-unstitched',     img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&q=80' },
  { name: 'Womens Handbags',      slug: 'womens-handbags',     img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&q=80' },
  { name: 'Kid Accessories',      slug: 'kid-accessories',     img: 'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?w=160&q=80' },
  { name: 'Kitchenware',          slug: 'kitchenware',         img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=160&q=80' },
  { name: 'Home Essentials',      slug: 'home-essentials',     img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&q=80' },
  { name: 'Shoes',                slug: 'shoes',               img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=160&q=80' },
  { name: 'Home Decor',           slug: 'home-decor',          img: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=160&q=80' },
  { name: 'Mother & Baby',        slug: 'mother-baby',         img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=160&q=80' },
]

export default function ShopByCategory() {
  const row1Ref = useRef(null)
  const row2Ref = useRef(null)
  const [row1, setRow1] = useState(DEFAULT_ROW_1)
  const [row2, setRow2] = useState(DEFAULT_ROW_2)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const loadData = useCallback(() => {
    categoryService.getAll()
      .then(res => {
        const cats = res.data?.categories || []
        if (cats.length > 0) {
          // Map DB categories by slug or name
          const catMap = new Map()
          cats.forEach(c => {
            catMap.set(c.slug, c)
            catMap.set(c.name.toLowerCase(), c)
          })

          // Enrich Row 1
          const updatedRow1 = DEFAULT_ROW_1.map(item => {
            const found = catMap.get(item.slug) || catMap.get(item.name.toLowerCase())
            return {
              ...item,
              to: `/category/${found ? found.slug : item.slug}`,
              img: found?.imageUrl || found?.image?.url || item.img,
            }
          })

          // Enrich Row 2
          const updatedRow2 = DEFAULT_ROW_2.map(item => {
            const found = catMap.get(item.slug) || catMap.get(item.name.toLowerCase())
            return {
              ...item,
              to: `/category/${found ? found.slug : item.slug}`,
              img: (item.slug === 'women-s-unstitched') 
                ? '/images/products/unstitched-shirt/product-1-1.webp'
                : (found?.imageUrl || found?.image?.url || item.img),
            }
          })

          setRow1(updatedRow1)
          setRow2(updatedRow2)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time listener for category changes in Supabase
  useRealtimeCategories(loadData)

  const updateScrollControls = useCallback(() => {
    const rows = [row1Ref.current, row2Ref.current].filter(Boolean)
    setCanScrollLeft(rows.some(row => row.scrollLeft > 1))
    setCanScrollRight(rows.some(
      row => row.scrollLeft + row.clientWidth < row.scrollWidth - 1
    ))
  }, [])

  useEffect(() => {
    const rows = [row1Ref.current, row2Ref.current].filter(Boolean)
    const frame = window.requestAnimationFrame(updateScrollControls)
    const observer = new ResizeObserver(updateScrollControls)

    rows.forEach(row => {
      observer.observe(row)
      row.addEventListener('scroll', updateScrollControls, { passive: true })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      rows.forEach(row => row.removeEventListener('scroll', updateScrollControls))
    }
  }, [row1, row2, updateScrollControls])

  const scroll = (direction) => {
    const viewportWidth = row1Ref.current?.clientWidth || 320
    const amount = Math.max(240, Math.round(viewportWidth * 0.75))
    const delta = direction === 'left' ? -amount : amount
    row1Ref.current?.scrollBy({ left: delta, behavior: 'smooth' })
    row2Ref.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="py-4">
      <div className="container-markaz">
        <div className="card-markaz p-6 sm:p-7 relative group">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
              Shop by category
            </h2>
            <Link
              to="/shop/categories"
              className="flex items-center gap-1 text-xs font-bold text-[#0c5a37] hover:text-[#00b884] transition-colors font-sans"
            >
              <span>See more</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Row 1 */}
          <div
            ref={row1Ref}
            className="flex items-start gap-6 sm:gap-8 overflow-x-auto scrollbar-none no-scrollbar pb-4 scroll-smooth"
          >
            {row1.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.to || `/category/${cat.slug}`}
                className="flex flex-col items-center text-center group/item flex-shrink-0 w-20 sm:w-24"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 p-1 border border-gray-200/70 shadow-2xs group-hover/item:border-[#0c5a37] group-hover/item:scale-105 transition-all overflow-hidden mb-2">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 leading-tight group-hover/item:text-[#0c5a37] transition-colors line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Row 2 */}
          <div
            ref={row2Ref}
            className="flex items-start gap-6 sm:gap-8 overflow-x-auto scrollbar-none no-scrollbar pt-2 pb-1 scroll-smooth"
          >
            {row2.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.to || `/category/${cat.slug}`}
                className="flex flex-col items-center text-center group/item flex-shrink-0 w-20 sm:w-24"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 p-1 border border-gray-200/70 shadow-2xs group-hover/item:border-[#0c5a37] group-hover/item:scale-105 transition-all overflow-hidden mb-2">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 leading-tight group-hover/item:text-[#0c5a37] transition-colors line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Carousel controls only appear when more categories exist off-screen. */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous categories"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-700 hover:text-[#0c5a37] hover:border-[#0c5a37] transition-all z-10 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Next categories"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-700 hover:text-[#0c5a37] hover:border-[#0c5a37] transition-all z-10 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
