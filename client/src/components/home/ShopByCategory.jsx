import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const ROW_1 = [
  { name: 'Cosmetics',            slug: 'perfumes',    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&q=80' },
  { name: 'Womens Stitched',      slug: 'women',       img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&q=80' },
  { name: 'Kids Clothing',        slug: 'women',       img: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=160&q=80' },
  { name: 'Mens Stitched',        slug: 'men',         img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=160&q=80' },
  { name: 'Jewellery',            slug: 'jewelry',     img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=160&q=80' },
  { name: 'Fashion Accessories',  slug: 'accessories', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&q=80' },
  { name: 'Bedding',              slug: 'accessories', img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=160&q=80' },
  { name: 'Festive Collection',   slug: 'women',       img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=160&q=80' },
  { name: 'Islamic Accessories',  slug: 'accessories', img: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=160&q=80' },
]

const ROW_2 = [
  { name: 'Womens Unstitched',    slug: 'women',       img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=160&q=80' },
  { name: 'Mens Unstitched',      slug: 'men',         img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&q=80' },
  { name: 'Womens Handbags',      slug: 'accessories', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&q=80' },
  { name: 'Kid Accessories',      slug: 'accessories', img: 'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?w=160&q=80' },
  { name: 'Kitchenware',          slug: 'accessories', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=160&q=80' },
  { name: 'Home Essentials',      slug: 'accessories', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&q=80' },
  { name: 'Shoes',                slug: 'accessories', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=160&q=80' },
  { name: 'Home Decor',           slug: 'accessories', img: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=160&q=80' },
  { name: 'Mother & Baby',        slug: 'accessories', img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=160&q=80' },
]

export default function ShopByCategory() {
  const row1Ref = useRef(null)
  const row2Ref = useRef(null)

  const scroll = (direction) => {
    const amount = direction === 'left' ? -320 : 320
    row1Ref.current?.scrollBy({ left: amount, behavior: 'smooth' })
    row2Ref.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="py-4">
      <div className="container-markaz">
        <div className="card-markaz p-6 sm:p-7 relative group">
          {/* Header (Screenshot 1: Shop by category + See all ->) */}
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
            {ROW_1.map((cat, idx) => (
              <Link
                key={idx}
                to={`/category/${cat.slug}`}
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
            {ROW_2.map((cat, idx) => (
              <Link
                key={idx}
                to={`/category/${cat.slug}`}
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

          {/* Right Scroll Arrow */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-700 hover:text-[#0c5a37] hover:border-[#0c5a37] transition-all z-10"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
