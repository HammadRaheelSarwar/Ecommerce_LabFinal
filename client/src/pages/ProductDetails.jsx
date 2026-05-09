import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import toast, { Toaster } from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [is3DMode, setIs3DMode] = useState(false);

  // Zoom and Pan State
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [imagePan, setImagePan] = useState(50);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Product not found');
        setProduct(data);
        setActiveImage(data.image || data.images?.[0] || '');
      } catch (error) {
        toast.error(error.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Added to bag', {
      style: { background: '#1e2020', color: '#c8c6c5', border: '1px solid #444748' }
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!product) return null;

  const discountPercent = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <main className="min-h-screen pt-20 pb-20 bg-background page-transition">
      <Toaster position="top-right" />
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-12 text-[11px] font-label-caps text-on-surface-variant tracking-widest uppercase">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate(`/shop/${product.gender}`)} className="hover:text-primary transition-colors">{product.gender}</button>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Product Gallery & Media */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto">
              {(product.images?.length > 0 ? product.images : [product.image]).map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setActiveImage(img); setIs3DMode(false); setImagePan(50); }}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === img && !is3DMode ? 'border-primary' : 'border-outline-variant hover:border-outline'}`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {product.model3d && (
                <button 
                  onClick={() => setIs3DMode(true)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 ${is3DMode ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container-low'}`}
                >
                  <span className="material-symbols-outlined text-primary">3d_rotation</span>
                  <span className="text-[8px] font-label-caps text-on-surface">3D VIEW</span>
                </button>
              )}
            </div>

            <div className="flex-grow flex flex-col gap-4">
              <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden bg-surface-container border border-outline-variant relative">
                {is3DMode && product.model3d ? (
                  <model-viewer
                    src={product.model3d}
                    camera-controls
                    auto-rotate
                    shadow-intensity="1"
                    style={{ width: '100%', height: '100%', background: 'transparent' }}
                    ar
                  ></model-viewer>
                ) : (
                  <div 
                    className="relative w-full h-full cursor-crosshair overflow-hidden group"
                    onMouseEnter={() => setShowZoom(true)}
                    onMouseLeave={() => setShowZoom(false)}
                    onMouseMove={handleMouseMove}
                  >
                    <img 
                      src={activeImage} 
                      alt={product.name} 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${showZoom ? 'opacity-0' : 'opacity-100'}`}
                      style={{ objectPosition: `${imagePan}% center` }} 
                    />
                    
                    {/* Magnifier View */}
                    <div 
                      className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showZoom ? 'opacity-100' : 'opacity-0'}`}
                      style={{
                        backgroundImage: `url(${activeImage})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundSize: '250%',
                        backgroundRepeat: 'no-repeat'
                      }}
                    ></div>

                    {/* Zoom Indicator Lens */}
                    {showZoom && (
                      <div 
                        className="absolute border border-primary/50 bg-primary/10 pointer-events-none w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ left: `${zoomPos.x}%`, top: `${zoomPos.y}%` }}
                      ></div>
                    )}

                    {discountPercent > 0 && (
                      <div className="absolute top-8 left-8 z-10 bg-secondary text-on-error px-4 py-2 rounded-full font-label-caps text-xs font-bold shadow-google">
                        Save {discountPercent}%
                      </div>
                    )}
                    
                    <div className="absolute bottom-6 right-6 z-10 bg-white/80 backdrop-blur-md p-3 rounded-full text-on-surface opacity-0 group-hover:opacity-100 transition-opacity shadow-google">
                      <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image Pan Slider */}
              {!is3DMode && (
                <div className="flex items-center gap-4 px-4 py-2 bg-surface-container rounded-full border border-outline-variant shadow-sm mt-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">panorama_horizontal</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={imagePan}
                    onChange={(e) => setImagePan(e.target.value)}
                    className="flex-grow h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-[12px] font-button text-on-surface-variant">Slide to view</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-label-caps text-xs text-primary tracking-[0.2em]">{product.brand || 'Premium Edition'}</span>
                <span className="w-1 h-1 rounded-full bg-outline"></span>
                <span className="font-label-caps text-xs text-on-surface-variant tracking-[0.2em]">{product.category}</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface leading-tight mb-6">{product.name}</h1>
              
              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-headline-md text-on-surface font-medium">${product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-xl font-body-lg text-on-surface-variant line-through mb-1">${product.originalPrice}</span>
                )}
              </div>

              <p className="font-body-md text-on-surface-variant leading-relaxed text-lg mb-8">
                {product.description || 'Experience the ultimate expression of modern luxury. This meticulously crafted piece combines avant-garde aesthetics with unparalleled functionality.'}
              </p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-12 p-8 bg-surface-container-low rounded-3xl border border-outline-variant shadow-sm">
              <div>
                <span className="block text-[10px] font-label-caps text-on-surface-variant mb-1">AVAILABILITY</span>
                <span className={`font-button text-sm ${product.stock > 0 ? 'text-success' : 'text-error'}`}>
                  {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-label-caps text-on-surface-variant mb-1">DEPARTMENT</span>
                <span className="font-button text-sm text-on-surface">{product.gender}</span>
              </div>
              <div>
                <span className="block text-[10px] font-label-caps text-on-surface-variant mb-1">COLLECTION</span>
                <span className="font-button text-sm text-on-surface">Spring Summer 2026</span>
              </div>
              <div>
                <span className="block text-[10px] font-label-caps text-on-surface-variant mb-1">SERIAL ID</span>
                <span className="font-button text-sm text-on-surface">AV-{product._id.slice(-8).toUpperCase()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-6 mb-4">
                <span className="font-label-caps text-xs text-on-surface-variant">QUANTITY</span>
                <div className="flex items-center bg-white rounded-full border border-outline-variant shadow-sm overflow-hidden">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface"
                  >
                    <span className="material-symbols-outlined font-light">remove</span>
                  </button>
                  <span className="w-12 text-center font-button text-lg text-on-surface">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface"
                  >
                    <span className="material-symbols-outlined font-light">add</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex items-center justify-center gap-2 bg-surface-container-high text-on-surface py-4 rounded-full font-button hover:bg-surface-container-highest transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  Add to Bag
                </button>
                <button 
                  disabled={product.stock <= 0}
                  onClick={() => {
                    handleAddToCart();
                    navigate('/cart');
                  }}
                  className="bg-primary text-on-primary py-4 rounded-full font-button hover:bg-primary/90 transition-all shadow-google active:scale-[0.98] disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Quality Badges */}
            <div className="flex items-center justify-between pt-6 border-t border-outline-variant">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                <span className="text-[9px] font-label-caps text-on-surface-variant text-center">2 YEAR<br/>WARRANTY</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
                <span className="text-[9px] font-label-caps text-on-surface-variant text-center">GLOBAL<br/>DELIVERY</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                <span className="text-[9px] font-label-caps text-on-surface-variant text-center">SECURE<br/>CHECKOUT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;
