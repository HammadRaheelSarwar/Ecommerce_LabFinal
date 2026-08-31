import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowUp } from 'lucide-react'
import { CATEGORIES_DATA, BUDGET_BUCKETS } from '../data/categoriesData'

export default function AllCategoriesPage() {
  const [categories] = useState(CATEGORIES_DATA)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="bg-[#FAF6F0] min-h-screen">
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8 pb-12 md:pb-16 pt-3 md:pt-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 md:mb-6 flex items-center gap-1.5 text-[12px] md:text-[13px] text-[#98A2B3]">
          <Link className="hover:text-[#344054] transition" to="/shop">
            Shop
          </Link>
          <ChevronRight size={13} className="text-[#98A2B3]" />
          <span className="text-[#344054] font-medium" aria-current="page">
            All categories
          </span>
        </nav>

        {/* Header */}
        <header className="mb-7 md:mb-10">
          <h1 className="m-0 text-[26px] md:text-[34px] lg:text-[40px] font-semibold tracking-tight text-[#070A56] leading-[1.1]">
            Shop by category
          </h1>
          <p className="mt-3 text-[13px] md:text-[15px] text-[#667085] max-w-[58ch] leading-relaxed font-light">
            Browse all {categories.length} categories on Markaz. Tap any category to see its subcategories and products.
          </p>
        </header>

        {/* Shop by Budget */}
        <section aria-label="Shop by budget" className="mb-7 md:mb-10 rounded-3xl border border-[#EAECF0] bg-white p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#02BC87]/10 text-[#02704D]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
              </svg>
            </span>
            <h2 className="m-0 text-[16px] md:text-[18px] font-semibold tracking-tight text-[#070A56]">
              Shop by budget
            </h2>
          </div>
          <p className="m-0 mb-4 text-[12.5px] md:text-[13.5px] text-[#667085] leading-relaxed">
            Find products that fit your price point — every bucket is cash-on-delivery ready.
          </p>
          <ul role="list" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-2.5 list-none p-0 m-0">
            {BUDGET_BUCKETS.map((bucket, idx) => (
              <li key={idx}>
                <Link
                  className="block w-full text-center rounded-xl border border-[#EAECF0] bg-white px-3 py-2.5 text-[13px] font-medium text-[#070A56] tracking-tight hover:border-[#02BC87] hover:text-[#02BC87] transition-colors"
                  to={`/shop?maxPrice=${bucket.maxPrice}`}
                >
                  {bucket.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {categories.map((cat) => (
            <article
              key={cat.id || cat.slug}
              className="group rounded-3xl border border-[#EAECF0] bg-white overflow-hidden transition hover:border-[#D0D5DD] shadow-2xs"
            >
              {/* Category Header Link */}
              <Link
                className="flex items-center gap-3 md:gap-4 p-4 md:p-5 border-b border-[#F2F4F7] hover:bg-[#FAFAFA] transition-colors"
                aria-label={`Shop ${cat.name}`}
                to={`/category/${cat.slug}`}
              >
                <div className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full overflow-hidden bg-[#F5FBF8]">
                  <img
                    alt={cat.name}
                    loading="lazy"
                    className="object-contain p-1 w-full h-full"
                    src={cat.icon}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&q=80'
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 text-[16px] md:text-[18px] font-semibold text-[#070A56] truncate">
                    {cat.name}
                  </h2>
                  <p className="m-0 mt-0.5 text-[12px] md:text-[13px] text-[#667085]">
                    {cat.subcategories?.length || cat.count || 0} subcategories
                  </p>
                </div>
                <ChevronRight size={18} className="text-[#98A2B3] shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>

              {/* Subcategories 4-Column Grid */}
              <ul className="grid grid-cols-4 gap-2 md:gap-3 p-3 md:p-4 list-none m-0" role="list">
                {cat.subcategories?.map((sub, sIdx) => (
                  <li key={sIdx}>
                    <Link
                      aria-label={`Shop ${sub.name}`}
                      title={sub.name}
                      className="block group/item text-center"
                      to={`/category/${cat.slug}/${sub.slug}`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-[#F5FBF8] border border-[#F2F4F7] transition-transform duration-200 group-hover/item:scale-[1.05] group-hover/item:shadow-sm group-hover/item:border-[#E0F2EA]">
                        <img
                          alt={sub.name}
                          loading="lazy"
                          className="object-cover w-full h-full"
                          src={sub.img}
                          onError={(e) => {
                            e.currentTarget.src = cat.icon || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&q=80'
                          }}
                        />
                      </div>
                      <span className="block mt-1.5 text-[11px] md:text-[12px] leading-tight text-[#344054] line-clamp-2 break-words group-hover/item:text-[#070A56]">
                        {sub.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#070A56] text-white shadow-xl flex items-center justify-center hover:bg-[#02BC87] transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  )
}
