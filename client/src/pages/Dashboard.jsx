import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';

const heroImages = [
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop", // smartwatch 2
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop", // smartwatch 1
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop", // headphones
  "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop", // luxury bag
  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000&auto=format&fit=crop", // laptop
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [womenProducts, setWomenProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 });
  
  // 3D Coverflow State
  const [activeHero, setActiveHero] = useState(2); // Start with middle image

  useEffect(() => {
    const fetchGenderProducts = async () => {
      try {
        const [womenRes, menRes] = await Promise.all([
          fetch(apiUrl('/api/products?gender=Female')),
          fetch(apiUrl('/api/products?gender=Male'))
        ]);
        const womenData = await womenRes.json();
        const menData = await menRes.json();
        setWomenProducts(womenData.slice(0, 4));
        setMenProducts(menData.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchGenderProducts();

    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59);
      const diff = endOfDay - now;
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex-grow bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[650px] flex items-center justify-center bg-surface-container overflow-hidden pt-8 pb-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col lg:flex-row items-center gap-12">
          
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface rounded-full mb-6 shadow-sm border border-outline-variant">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-button text-[12px] text-on-surface-variant font-medium">New collection live</span>
            </div>
            
            <h1 className="font-display-xl text-[48px] md:text-[64px] xl:text-[72px] leading-tight text-on-surface mb-6 tracking-tight">
              Elevate your style. <br/>
              <span className="text-primary">Every single day.</span>
            </h1>
            
            <p className="font-body-lg text-on-surface-variant max-w-xl mb-10">
              Shop curated collections inspired by modern fashion, comfort, and timeless design.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button onClick={() => navigate('/shop/Female')} className="bg-primary text-on-primary font-button px-8 py-3 rounded-full hover:bg-primary/90 hover:shadow-google-hover transition-all">
                Shop Women
              </button>
              <button onClick={() => navigate('/shop/Male')} className="bg-background text-on-surface border border-outline font-button px-8 py-3 rounded-full hover:bg-surface-container hover:border-on-surface-variant transition-all">
                Shop Men
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative flex flex-col items-center mt-12 lg:mt-0" style={{ perspective: '1200px' }}>
            {/* 3D Coverflow Container */}
            <div className="relative w-full max-w-[400px] aspect-[4/5] md:aspect-square flex justify-center items-center" style={{ transformStyle: 'preserve-3d' }}>
              {heroImages.map((img, index) => {
                const diff = index - activeHero;
                const offset = Math.abs(diff);
                
                // Hide images that are too far away to improve performance and visuals
                if (offset > 2) return null;

                // Math for the 3D effect
                const translateX = diff * 55; // Percentage shift
                const translateZ = offset * -150; // Push back into screen
                const rotateY = diff < 0 ? 35 : diff > 0 ? -35 : 0;
                const scale = 1 - (offset * 0.15);
                const opacity = 1 - (offset * 0.3);
                const zIndex = 50 - offset;

                return (
                  <div
                    key={index}
                    className="absolute w-[75%] md:w-[85%] aspect-[4/5] rounded-[24px] cursor-pointer transition-all duration-700 ease-out shadow-google"
                    style={{
                      transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      zIndex,
                      opacity,
                    }}
                    onClick={() => setActiveHero(index)}
                  >
                    {/* Add a subtle overlay to background images to make the front one pop */}
                    {diff !== 0 && (
                      <div className="absolute inset-0 bg-white/20 z-10 rounded-[24px] pointer-events-none transition-opacity duration-700"></div>
                    )}
                    <img 
                      src={img} 
                      alt={`Trending Product ${index + 1}`} 
                      className="w-full h-full object-cover rounded-[24px] drop-shadow-xl"
                    />
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-3 mt-8 z-20">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveHero(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeHero === index ? 'bg-primary w-8' : 'bg-outline-variant hover:bg-outline'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Women's Collection Section */}
      {womenProducts.length > 0 && (
        <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-headline-lg text-[32px] md:text-[40px] text-on-surface tracking-tight mb-2">Women's Collection</h2>
              <p className="text-on-surface-variant font-body-md">Discover the latest trends in women's fashion.</p>
            </div>
            <button onClick={() => navigate('/shop/Female')} className="font-button text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Shop All Women <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {womenProducts.map((product) => (
              <div key={product._id} className="group flex flex-col bg-surface-container-low rounded-2xl overflow-hidden hover:shadow-google-hover transition-shadow border border-outline-variant hover:border-outline cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                <div className="relative aspect-square bg-surface-container-high p-6 flex items-center justify-center">
                  {product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-secondary text-on-error px-2 py-1 rounded-md font-button text-[12px] font-bold shadow-sm">
                        Save ${product.originalPrice - product.price}
                      </div>
                    </div>
                  )}
                  <img
                    src={product.image || product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] font-button text-primary bg-primary/10 px-2 py-0.5 rounded-full">{product.category}</span>
                  </div>
                  <h3 className="font-headline-sm text-[18px] text-on-surface mb-4 line-clamp-2">{product.name}</h3>
                  <div className="mt-auto flex items-baseline gap-2">
                    <span className="text-[20px] font-medium text-on-surface">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-[14px] text-on-surface-variant line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Men's Collection Section */}
      {menProducts.length > 0 && (
        <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant bg-surface">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-headline-lg text-[32px] md:text-[40px] text-on-surface tracking-tight mb-2">Men's Collection</h2>
              <p className="text-on-surface-variant font-body-md">Elevate your style with our premium men's selection.</p>
            </div>
            <button onClick={() => navigate('/shop/Male')} className="font-button text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Shop All Men <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {menProducts.map((product) => (
              <div key={product._id} className="group flex flex-col bg-surface-container-low rounded-2xl overflow-hidden hover:shadow-google-hover transition-shadow border border-outline-variant hover:border-outline cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                <div className="relative aspect-square bg-surface-container-high p-6 flex items-center justify-center">
                  {product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-secondary text-on-error px-2 py-1 rounded-md font-button text-[12px] font-bold shadow-sm">
                        Save ${product.originalPrice - product.price}
                      </div>
                    </div>
                  )}
                  <img
                    src={product.image || product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] font-button text-primary bg-primary/10 px-2 py-0.5 rounded-full">{product.category}</span>
                  </div>
                  <h3 className="font-headline-sm text-[18px] text-on-surface mb-4 line-clamp-2">{product.name}</h3>
                  <div className="mt-auto flex items-baseline gap-2">
                    <span className="text-[20px] font-medium text-on-surface">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-[14px] text-on-surface-variant line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Categories Marquee */}
      <section className="py-20 border-t border-outline-variant bg-surface overflow-hidden">
        <div className="text-center mb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <h2 className="font-headline-lg text-[32px] md:text-[40px] text-on-surface tracking-tight mb-4">Explore what's trending</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">From the latest tech to essential accessories, find what you're looking for.</p>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative flex overflow-x-hidden group">
          
          {/* Gradient Masks for smooth edge fading */}
          <div className="absolute top-0 left-0 w-24 md:w-48 h-full bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-24 md:w-48 h-full bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none"></div>

          <div className="animate-marquee flex whitespace-nowrap items-center hover:pause">
            {/* We render the category list twice for seamless looping */}
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex gap-4 md:gap-8 pr-4 md:pr-8">
                {[
                  { name: 'Watches', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf0-Za6VbHQ6fUDv0R62Gj9o53N9MXacU-svw8VX6kyNM3vpNpLcMThoDjT6QkcWD97Z4DdX70FqIgw1vZVMlIuoMrrrtnAz8S_gDTZoHIs8R-gCk8keY3B9Wqk9ZIKy8iojI_YsxSA4e2whCWXHaIUMooKF0-AIOWKUiiBjhdnHtFOJknN9SYZiztOUOF-G2SQCxQ3uBDsqy2bL50TVQUYOEHdHWBVh3BVoX9RHWjY9U1HFwE-8T_NcadXvWyEg167K608gbygJI', path: '/shop/Female?category=Watches' },
                  { name: 'Bags', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbWreUgwWzwyi3EJ-rRnlP1ohwmEnnro8YptEpY-lXNiDeaK8ReYSpkdGZRgSk2PkaGjF8kzgyGRXZI5KnNq8UCQ_Ri9PCHzjdAWyr0d2nhoVdSr6vTaGVQA0s6xOHHWItgOcMriyhEnfDMLfS-dVJlVY8Jy9A7br4frcyccjADGhjBR0NDRs1-cOUqhXZiiEsZFIlNfmVYIyh1dy41SA56YXSkKk96uDF3MGfuEVj4X7HWyLcRK3WzpPOGzSXGfndzLeAgI98I1o', path: '/shop/Female?category=Bags' },
                  { name: 'Tech', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOarMOrNdTAnLzlB20ENv4DUvEElRdYpKf-YsNdQuegycgtRPYn0libka-foLKktkI37Dkm4gKhULGOIbccMmXvNC0mEp9nSe6Y8lbsbxOvM9kgf4DcqTR7urSypcpHAaO_H6bUMA_xtjjNe8VooBEk9sTKMIMm0gdB9hsbvqqolTf8lvNxRgm5c1YLzGBNcqZOsvGQsYtQ166gw6HLspLSOK_SYTlD_u3u3P4HRDIz59ivzDzKXqCuh2Z8lD07MJH7aubLXVsWqY', path: '/shop/Male?category=Tech' },
                  { name: 'Beauty', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH2zyo0ZJeOL08XiU4cVr0Q8Y1Um1gXZblyf5i0qPeyv4bpAFVk6bh0O3lrWPoMISf23N-2gg2BgPGBvPK34jPGNNjqgo62tuHVPke7nknl-iDOEM4xqUu-fBTPRWvKxUnBga1oJTJpzPFXDmGcqu8c4jkeoPpJekb9mn1f6VYEj7kCd-m7auGusXef40Og3ijTLOszzB_MpUUVOZggK9x7uqKkUpbStOEJo5cLKqUsTcAAQjBLN55PAiKMzOWF3Uu4FT_P0R_rPc', path: '/shop/Female?category=Beauty' },
                  { name: 'Gadgets', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyEExjQdLuSNymLCNc1j3xwrEJaKgbz9JoNyL827SCgvw8dyKb2Vo_o3nJbvGVCwvjMcgAt-sY4a147Ntolf0Q_fAqOAOOWBWar3yv_-yH4I8FoXpJlYqbtO0sCc4jwUXHPN5Y7z67-nCDoC0KzvOJajzKroykyCR4QQ6N_uePyVEauPtN-Bxtrq0wHXVfaHJ_Gqh1hgnTY57uPA_tfL6diZISzujmG9UdGD-W3N-I8cb4D7qpj1o1EptpvUK5YV9MmPHfUtQzbmk', path: '/shop/Male?category=Gadgets' },
                ].map((cat, i) => (
                  <div key={i} className="flex-shrink-0 w-[180px] md:w-[240px] group cursor-pointer flex flex-col items-center" onClick={() => navigate(cat.path)}>
                    <div className="w-full aspect-square rounded-[32px] bg-surface-container-highest overflow-hidden mb-4 relative hover:shadow-google-hover transition-all duration-300">
                      <img
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={cat.image}
                      />
                    </div>
                    <h3 className="font-button text-[16px] text-on-surface group-hover:text-primary transition-colors">{cat.name}</h3>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-primary">local_shipping</span>
            </div>
            <h3 className="font-headline-sm text-[20px] text-on-surface mb-2">Free shipping</h3>
            <p className="text-on-surface-variant">Get free delivery on all orders over $50.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-success">verified</span>
            </div>
            <h3 className="font-headline-sm text-[20px] text-on-surface mb-2">Guaranteed authentic</h3>
            <p className="text-on-surface-variant">Every item is verified for quality and authenticity.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-tertiary">support_agent</span>
            </div>
            <h3 className="font-headline-sm text-[20px] text-on-surface mb-2">24/7 support</h3>
            <p className="text-on-surface-variant">We're here to help with any questions you may have.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
