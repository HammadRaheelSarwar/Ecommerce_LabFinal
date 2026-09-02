import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const HERO_SLIDES = [
  {
    id: 'luxury',
    tag: 'New Arrival',
    title: 'Luxury Collection',
    subtitle: 'Explore the finest in fashion and lifestyle, curated for a statement-making wardrobe.',
    cta: 'Shop Now',
    link: '/shop',
    image: '/images/hero-luxury-collection-v2.jpg',
    gradient: 'from-[#020711] via-[#06152c] to-[#020711]',
    accentColor: '#38bdf8',
    badgeBg: 'bg-sky-400/10 text-sky-300 border-sky-400/25',
    buttonClass: 'bg-[#087cf0] text-white font-bold hover:bg-[#1690ff]',
  },
  {
    id: 'women-lawn',
    tag: '# Festive Season Specials',
    title: 'Unstitched, Unmatched Lawn.',
    subtitle: 'Pure lawn, khaddar, chiffon and silk from top verified suppliers across Pakistan.',
    cta: "Shop Women's Lawn",
    link: '/category/womens-unstitched',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=85',
    gradient: 'from-[#4a1226] via-[#631835] to-[#300b19]',
    accentColor: '#F43F5E',
    badgeBg: 'bg-black/35 text-rose-200 border-white/10',
    buttonClass: 'bg-gradient-to-r from-[#E53935] to-[#D32F2F] text-white hover:brightness-110',
  },
  {
    id: 'watches',
    tag: '# Precision & Prestige',
    title: 'Masterpieces of Modern Horology.',
    subtitle: 'Automatic chronographs, sapphire crystal & gold finish dials engineered to command attention.',
    cta: 'Explore Watches',
    link: '/category/watches',
    image: '/images/hero_luxury_watch.jpg',
    gradient: 'from-[#12141A] via-[#1A1F29] to-[#0B0D12]',
    accentColor: '#D4AF37',
    badgeBg: 'bg-black/40 text-[#D4AF37] border-[#D4AF37]/30',
    buttonClass: 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-black font-bold hover:brightness-110',
  },
  {
    id: 'perfumes',
    tag: '# Signature Fragrances & Ouds',
    title: 'Captivating Sillage. Pure Luxury.',
    subtitle: 'Hypnotic French florals, smoky oriental ouds & long-lasting artisanal EDP formulations.',
    cta: 'Shop Fragrances',
    link: '/category/perfumes',
    image: '/images/hero_luxury_perfume.jpg',
    gradient: 'from-[#1A1208] via-[#2E200C] to-[#120C05]',
    accentColor: '#F59E0B',
    badgeBg: 'bg-black/40 text-amber-300 border-amber-500/30',
    buttonClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:brightness-110',
  },
  {
    id: 'jewelry',
    tag: '# Fine Artisanal Elegance',
    title: 'Sparkling Zircon & Heritage Gold.',
    subtitle: '22K gold plated sets, statement bridal chokers, and shimmering handcrafted accessories.',
    cta: 'Discover Jewelry',
    link: '/category/jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=85',
    gradient: 'from-[#09261E] via-[#0E3D31] to-[#061A14]',
    accentColor: '#10B981',
    badgeBg: 'bg-black/35 text-emerald-200 border-emerald-500/20',
    buttonClass: 'bg-gradient-to-r from-[#00b884] to-[#0c5a37] text-white hover:brightness-110',
  },
]

export default function HeroSection({ data }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const slideTimerRef = useRef(null)

  // Auto-slide every 5 seconds (pauses on user hover)
  useEffect(() => {
    if (isPaused) return

    slideTimerRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)
    }, 5000)

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current)
    }
  }, [isPaused, currentSlide])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  const slide = HERO_SLIDES[currentSlide]

  return (
    <section className="pt-5 pb-3">
      <div className="container-markaz">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Hero Banner with Dynamic Gradients & Auto-changing Slides */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`lg:col-span-8 relative bg-gradient-to-br ${slide.gradient} rounded-2xl p-6 sm:p-10 text-white overflow-hidden shadow-sm flex flex-col justify-between min-h-[380px] sm:min-h-[440px] transition-colors duration-700 group select-none`}
          >
            {/* Ambient Background Lighting */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div
              className="absolute right-10 top-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
              style={{ backgroundColor: `${slide.accentColor}25` }}
            />

            {/* Slide Content */}
            <div className="relative z-10 max-w-[88%] sm:w-[46%] sm:max-w-none">
              {/* Category Tag Pill */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.tag}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${slide.badgeBg} backdrop-blur text-xs font-semibold mb-4 border shadow-xs`}
                >
                  <Sparkles size={13} style={{ color: slide.accentColor }} />
                  <span>{slide.tag}</span>
                </motion.div>
              </AnimatePresence>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={slide.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className={`font-black text-2xl sm:text-3xl lg:text-[38px] leading-[1.08] mb-3 tracking-tight ${slide.id === 'luxury' ? 'font-serif uppercase text-sky-400' : 'font-sans'}`}
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
                  className="text-white/90 text-xs sm:text-sm leading-relaxed mb-5 max-w-sm font-sans font-normal"
                >
                  {slide.subtitle}
                </motion.p>
              </AnimatePresence>

              {/* CTA Button */}
              <Link
                to={slide.link}
                className={`${slide.buttonClass} px-5 py-2.5 text-[11px] tracking-wider uppercase inline-flex items-center gap-2 rounded-xl shadow-md transition-all active:scale-98`}
              >
                <span>{slide.cta}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Model / Product Hero Image with Feathered Mask */}
            <div className={`hidden sm:block absolute pointer-events-none overflow-hidden ${slide.id === 'luxury' ? 'inset-0' : 'right-0 bottom-0 top-0 w-[58%]'}`}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={slide.image}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                  style={slide.id === 'luxury' ? undefined : {
                    maskImage: 'linear-gradient(to left, black 65%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, black 65%, transparent 100%)',
                  }}
                />
              </AnimatePresence>
              {slide.id === 'luxury' && <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />}
            </div>

            {/* Manual Navigation Arrows (Visible on Desktop / Hover) */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronRight size={18} />
            </button>

            {/* Navigation Dots & Auto-change Progress Indicator */}
            <div className="relative z-10 flex items-center gap-2 mt-6">
              {HERO_SLIDES.map((s, i) => {
                const isActive = currentSlide === i
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(i)}
                    className="relative h-2 rounded-full overflow-hidden transition-all bg-white/25 hover:bg-white/45 cursor-pointer"
                    style={{ width: isActive ? '36px' : '8px' }}
                    aria-label={`Slide ${i + 1}`}
                  >
                    {isActive && (
                      <motion.div
                        key={`bar-${currentSlide}`}
                        initial={{ width: '0%' }}
                        animate={{ width: isPaused ? '100%' : '100%' }}
                        transition={{ duration: isPaused ? 0 : 5, ease: 'linear' }}
                        className="h-full bg-white rounded-full"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Side Editorial Collection Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Women's Collection */}
            <Link
              to="/category/women-s-unstitched"
              className="flex-1 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group min-h-[205px] bg-[#e9eef6]"
            >
              <img
                src="/images/hero-womens-collection-v2.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/45 to-transparent" />
              <div className="relative z-10 h-full p-6 flex flex-col justify-center max-w-[58%]">
                <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#0c5a37] mb-2">Curated Edit</span>
                <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#071328] leading-[1.05] uppercase">
                  Women’s<br />Collection
                </h3>
                <div className="flex items-center gap-2 text-sm font-bold text-[#071328] mt-5">
                  <span>Shop now</span>
                  <ArrowRight size={17} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Men's Collection */}
            <Link
              to="/category/mens-stitched"
              className="flex-1 rounded-2xl border border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group min-h-[205px] bg-[#031025]"
            >
              <img
                src="/images/hero-mens-collection-v2.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020711]/95 via-[#020711]/45 to-transparent" />
              <div className="relative z-10 h-full p-6 flex flex-col justify-center max-w-[58%]">
                <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-sky-400 mb-2">Modern Tailoring</span>
                <h3 className="font-serif font-black text-2xl sm:text-3xl text-sky-400 leading-[1.05] uppercase">
                  Men’s<br />Collection
                </h3>
                <div className="flex items-center gap-2 text-sm font-bold text-white mt-5">
                  <span>Shop now</span>
                  <ArrowRight size={17} className="text-sky-400 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
