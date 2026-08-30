import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Camera } from 'lucide-react'
import { useSearch } from '../../context/SearchContext'

const OCCASIONS = [
  { id: 'eid',     label: 'Eid edit',      icon: '✨', bg: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100', query: 'festive' },
  { id: 'wedding', label: 'Wedding ready', icon: '♡',  bg: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',     query: 'wedding' },
  { id: 'daily',   label: 'Daily wear',    icon: '❄',  bg: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',         query: 'casual' },
  { id: 'office',  label: 'Office looks',  icon: '🏛', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100', query: 'formal' },
  { id: 'glow',    label: 'Glow-up',       icon: '✨', bg: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100', query: 'perfume' },
  { id: 'gift',    label: 'Gift mode',     icon: '🎁', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', query: 'gift' },
]

export default function ShopByOccasion() {
  const [activePill, setActivePill] = useState('eid')
  const { openSearch } = useSearch()

  return (
    <section className="py-6">
      <div className="container-markaz">
        {/* Header (Screenshot 2) */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
          <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
            Shop by occasion
          </h2>
          <p className="text-xs text-gray-500 font-sans">
            Pick a vibe, we'll do the curating.
          </p>
        </div>

        {/* Occasion Filter Pills (Screenshot 2) */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none no-scrollbar pb-4 mb-2">
          {OCCASIONS.map((pill) => (
            <Link
              key={pill.id}
              to={`/shop?tag=${pill.query}`}
              onClick={() => setActivePill(pill.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${pill.bg} ${
                activePill === pill.id ? 'ring-2 ring-[#0c5a37]/30 scale-102' : ''
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </Link>
          ))}
        </div>

        {/* Visual Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Big Left Feature Card: Unstitched, unmatched (Screenshot 2) */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-xs group min-h-[420px] lg:min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80"
              alt="Unstitched, unmatched"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold">
                <Sparkles size={12} className="text-[#00b884]" />
                Editor's pick
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="font-sans font-black text-2xl sm:text-3xl leading-tight mb-2">
                Unstitched, unmatched.
              </h3>
              <p className="text-white/80 text-xs sm:text-sm font-sans mb-4 max-w-sm">
                Lawn, khaddar and chiffon from trusted sellers.
              </p>
              <Link
                to="/category/women"
                className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#00b884] transition-colors"
              >
                <span>Browse suits</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: 2x2 Categories + 1 Wide Banner */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 2x2 Grid (Screenshot 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Cosmetics */}
              <Link
                to="/category/perfumes"
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group overflow-hidden h-36"
              >
                <div>
                  <h4 className="font-sans font-bold text-gray-900 text-base group-hover:text-[#0c5a37] transition-colors">
                    Cosmetics
                  </h4>
                  <span className="text-xs font-semibold text-[#0c5a37] inline-flex items-center gap-1 mt-1 font-sans">
                    Shop now <ArrowRight size={12} />
                  </span>
                </div>
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80"
                    alt="Cosmetics"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
              </Link>

              {/* Card 2: Jewellery */}
              <Link
                to="/category/jewelry"
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group overflow-hidden h-36"
              >
                <div>
                  <h4 className="font-sans font-bold text-gray-900 text-base group-hover:text-[#0c5a37] transition-colors">
                    Jewellery
                  </h4>
                  <span className="text-xs font-semibold text-[#0c5a37] inline-flex items-center gap-1 mt-1 font-sans">
                    Shop now <ArrowRight size={12} />
                  </span>
                </div>
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80"
                    alt="Jewellery"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
              </Link>

              {/* Card 3: Shoes */}
              <Link
                to="/category/accessories"
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group overflow-hidden h-36"
              >
                <div>
                  <h4 className="font-sans font-bold text-gray-900 text-base group-hover:text-[#0c5a37] transition-colors">
                    Shoes
                  </h4>
                  <span className="text-xs font-semibold text-[#0c5a37] inline-flex items-center gap-1 mt-1 font-sans">
                    Shop now <ArrowRight size={12} />
                  </span>
                </div>
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80"
                    alt="Shoes"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
              </Link>

              {/* Card 4: Electronics */}
              <Link
                to="/category/watches"
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group overflow-hidden h-36"
              >
                <div>
                  <h4 className="font-sans font-bold text-gray-900 text-base group-hover:text-[#0c5a37] transition-colors">
                    Electronics
                  </h4>
                  <span className="text-xs font-semibold text-[#0c5a37] inline-flex items-center gap-1 mt-1 font-sans">
                    Shop now <ArrowRight size={12} />
                  </span>
                </div>
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80"
                    alt="Electronics"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
              </Link>
            </div>

            {/* Wide Banner: Factory-direct from China (Screenshot 2) */}
            <Link
              to="/shop?origin=china"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group overflow-hidden flex-1"
            >
              <div className="max-w-md">
                <h4 className="font-sans font-extrabold text-gray-900 text-lg sm:text-xl group-hover:text-[#0c5a37] transition-colors">
                  Factory-direct from China
                </h4>
                <p className="text-xs text-gray-500 mt-1 font-sans">
                  Buy just one — door-to-door across Pakistan.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 mt-2 font-sans">
                  Explore China Direct <ArrowRight size={13} />
                </span>
              </div>
              <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80"
                  alt="Shipping"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
          </div>
        </div>

        {/* Snap it. Find it. (Screenshot 2 Bottom Banner) */}
        <div className="mt-6 bg-[#083523] text-white rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#00b884] flex-shrink-0">
              <Camera size={24} />
            </div>
            <div>
              <h3 className="font-sans font-extrabold text-lg text-white">
                Snap it. <span className="text-[#00b884]">Find it.</span>
              </h3>
              <p className="text-xs text-white/70 font-sans">
                Search the catalogue with your camera — AI visual search.
              </p>
            </div>
          </div>
          <button
            onClick={openSearch}
            className="btn-mint px-5 py-2.5 text-xs tracking-wider flex-shrink-0 hidden sm:inline-flex"
          >
            Launch Visual Search
          </button>
        </div>
      </div>
    </section>
  )
}
