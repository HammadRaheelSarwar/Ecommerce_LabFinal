import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const HERO_SLIDES = [
  {
    tag: '# Online shopping in Pakistan',
    title: 'Everything you love, delivered.',
    subtitle: 'Fashion, beauty, home and more — cash on delivery, fast shipping, easy 7-day returns.',
    cta: 'Explore Catalog',
    link: '/shop',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
  },
  {
    tag: '# Festive Season Specials',
    title: 'Unstitched, Unmatched Lawn.',
    subtitle: 'Pure lawn, khaddar, chiffon and silk from top verified suppliers across Pakistan.',
    cta: 'Shop Women',
    link: '/category/women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  },
]

export default function HeroSection({ data }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const slide = HERO_SLIDES[currentSlide]

  return (
    <section className="pt-5 pb-3">
      <div className="container-markaz">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Hero Banner (Screenshot 1 Left Card) */}
          <div className="lg:col-span-8 relative bg-gradient-to-br from-[#0c5a37] via-[#0e6f43] to-[#073d24] rounded-2xl p-6 sm:p-10 text-white overflow-hidden shadow-sm flex flex-col justify-between min-h-[360px] sm:min-h-[420px]">
            {/* Background lighting */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute right-10 top-0 w-48 h-48 rounded-full bg-[#00b884]/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-xl">
              {/* Green Pill Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur text-emerald-200 text-xs font-semibold mb-4 border border-white/10">
                <Sparkles size={13} className="text-[#00b884]" />
                <span>{slide.tag}</span>
              </div>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={slide.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="font-sans font-black text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 tracking-tight"
                >
                  {slide.title}
                </motion.h1>
              </AnimatePresence>

              {/* Subtitle */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={slide.subtitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-white/85 text-sm sm:text-base leading-relaxed mb-6 max-w-md font-sans"
                >
                  {slide.subtitle}
                </motion.p>
              </AnimatePresence>

              <Link
                to={slide.link}
                className="btn-mint px-6 py-3 text-xs tracking-wider uppercase inline-flex items-center gap-2 shadow-md"
              >
                {slide.cta} <ArrowRight size={14} />
              </Link>
            </div>

            {/* Model with Parcels */}
            <div className="hidden sm:block absolute right-0 bottom-0 top-0 w-5/12 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.img
                  key={slide.image}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={slide.image}
                  alt="Delivery"
                  className="w-full h-full object-cover object-top"
                  style={{
                    maskImage: 'linear-gradient(to left, black 60%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 100%)',
                  }}
                />
              </AnimatePresence>
            </div>

            {/* Navigation Dots */}
            <div className="relative z-10 flex items-center gap-2 mt-6">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === i ? 'w-7 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side Cards (Screenshot 1: Pakistan & China) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Card 1: Shop from Pakistan */}
            <Link
              to="/shop?origin=pakistan"
              className="flex-1 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between min-h-[175px]"
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0c5a37] text-[11px] font-bold mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00b884]" />
                  <span>You're here</span>
                </div>
                <h3 className="font-sans font-extrabold text-xl text-gray-900 leading-tight group-hover:text-[#0c5a37] transition-colors">
                  Shop from Pakistan
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Local suppliers from Karachi, Lahore, Faisalabad & Multan
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-[#0c5a37] mt-3">
                <span>Browse domestic stores</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Pakistan Flag Wave */}
              <div className="absolute right-0 bottom-0 top-0 w-36 pointer-events-none opacity-25 group-hover:opacity-35 transition-opacity flex items-center justify-end pr-2">
                <span className="text-6xl">🇵🇰</span>
              </div>
            </Link>

            {/* Card 2: Shop from China */}
            <Link
              to="/shop?origin=china"
              className="flex-1 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between min-h-[175px]"
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold mb-2">
                  <span>Factory Direct</span>
                </div>
                <h3 className="font-sans font-extrabold text-xl text-gray-900 leading-tight group-hover:text-rose-700 transition-colors">
                  Shop from China →
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Factory-direct prices, tech, accessories & home items
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-rose-700 mt-3">
                <span>Explore China catalog</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>

              {/* China Flag Wave */}
              <div className="absolute right-0 bottom-0 top-0 w-36 pointer-events-none opacity-25 group-hover:opacity-35 transition-opacity flex items-center justify-end pr-2">
                <span className="text-6xl">🇨🇳</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
