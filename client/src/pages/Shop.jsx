import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import useApi from '../hooks/useApi';

const stableHash = (value) => {
  const text = String(value || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const stableMetric = (seed, min, max, decimals = 0) => {
  const hash = stableHash(seed);
  const value = min + (hash % ((max - min) * (decimals ? 10 ** decimals : 1) + 1)) / (decimals ? 10 ** decimals : 1);
  return decimals ? Number(value.toFixed(decimals)) : Math.round(value);
};

const MALE_CATEGORIES   = ['Watches', 'Clothes', 'Shirts', 'Pants', 'Tech', 'Mobiles', 'Headphones', 'Other'];
const FEMALE_CATEGORIES = ['Bags', 'Watches', 'Clothes', 'Dresses', 'Shoes', 'Jewelry', 'Accessories', 'Beauty', 'Other'];

const Shop = () => {
  const { gender } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: products, loading, error, execute } = useApi('http://localhost:5000/api/products');

  const categories = gender === 'Female' ? FEMALE_CATEGORIES : MALE_CATEGORIES;

  useEffect(() => {
    setActiveCategory('All');
  }, [gender]);

  useEffect(() => {
    const query = activeCategory !== 'All'
      ? `?gender=${gender}&category=${activeCategory}`
      : `?gender=${gender}`;
    execute(`http://localhost:5000/api/products${query}`);
  }, [gender, activeCategory]);

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full px-margin-desktop py-12 flex flex-col md:flex-row gap-gutter page-transition">
      {/* Sidebar Filter */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="glass-panel p-6 rounded-xl sticky top-32">
          <h2 className="font-headline-sm text-headline-sm text-secondary mb-8">Filters</h2>
          
          <div className="mb-8">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4">CATEGORIES</h3>
            <ul className="space-y-3 font-body-md text-body-md">
              <li>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="form-checkbox bg-transparent border-outline text-secondary focus:ring-secondary focus:ring-offset-background rounded w-4 h-4"
                    checked={activeCategory === 'All'}
                    onChange={() => setActiveCategory('All')}
                  />
                  <span className="group-hover:text-primary transition-colors">All {gender}</span>
                </label>
              </li>
              {categories.map(cat => (
                <li key={cat}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="form-checkbox bg-transparent border-outline text-secondary focus:ring-secondary focus:ring-offset-background rounded w-4 h-4"
                      checked={activeCategory === cat}
                      onChange={() => setActiveCategory(cat)}
                    />
                    <span className="group-hover:text-primary transition-colors">{cat}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8 border-t border-white/5 pt-6">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4">GENDER EDIT</h3>
            <button 
              className="w-full py-2 bg-surface-container rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container-highest transition-colors"
              onClick={() => navigate(`/shop/${gender === 'Female' ? 'Male' : 'Female'}`)}
            >
              Switch to {gender === 'Female' ? 'Male' : 'Female'}
            </button>
          </div>
        </div>
      </aside>

      {/* Product Grid Area */}
      <section className="flex-grow">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-8 glass-panel py-3 px-6 rounded-xl">
          <span className="font-body-md text-body-md text-on-surface-variant">
            {products ? products.length : 0} Results
          </span>
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant">SORT BY:</span>
            <select className="bg-transparent border-none text-primary font-body-md text-body-md focus:ring-0 cursor-pointer outline-none">
              <option className="bg-surface-container" value="featured">Featured</option>
              <option className="bg-surface-container" value="price-asc">Price: Low to High</option>
              <option className="bg-surface-container" value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {error && <p className="text-error">Failed to load products: {error}</p>}
        {loading && <p className="text-on-surface-variant">Loading luxurious items...</p>}
        
        {!loading && !error && products && products.length === 0 && (
          <p className="text-on-surface-variant">No products found in this category.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products && products.map(product => {
            const image = product.images?.[0] || product.image || 'https://placehold.co/400x400/0A1F44/00E5FF?text=No+Image';
            const seed = product._id || product.name || product.image || 'product';
            const rating = Number(product.rating || product.ratings || stableMetric(`${seed}-rating`, 3.8, 4.9, 1));
            const reviews = product.numReviews || stableMetric(`${seed}-reviews`, 40, 420);
            const displayPrice = product.discountPrice || product.price;

            return (
              <div key={product._id} className="group relative flex flex-col rounded-xl overflow-hidden glass-panel luxury-shadow transition-transform duration-500 hover:-translate-y-2">
                <div 
                  className="relative aspect-square overflow-hidden bg-surface-container-lowest flex items-center justify-center p-8 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {product.discountPrice && (
                    <div className="absolute top-4 left-4 z-10 glass-panel px-3 py-1 rounded-full border border-secondary/30">
                      <span className="font-label-caps text-[10px] text-secondary">SALE</span>
                    </div>
                  )}
                  <button 
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-surface-container-highest/50 backdrop-blur-md text-on-surface-variant hover:text-secondary transition-colors"
                    onClick={(e) => { e.stopPropagation(); /* handle favorite */ }}
                  >
                    <span className="material-symbols-outlined text-[20px]" data-icon="favorite">favorite</span>
                  </button>
                  <img 
                    src={image} 
                    alt={product.name} 
                    className="object-contain w-full h-full dark:mix-blend-screen mix-blend-multiply group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow bg-gradient-to-t from-surface-container-low to-transparent">
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className="font-headline-sm text-headline-sm text-primary line-clamp-1 cursor-pointer hover:text-secondary transition-colors"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      {product.name}
                    </h3>
                    <span className="font-body-md text-body-md font-medium text-secondary">${displayPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-6 text-secondary text-sm">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className="material-symbols-outlined text-[16px]" data-icon={star <= Math.round(rating) ? "star" : "star_border"} data-weight={star <= Math.round(rating) ? "fill" : "regular"}>
                        {star <= Math.round(rating) ? "star" : "star_border"}
                      </span>
                    ))}
                    <span className="text-on-surface-variant ml-1">({reviews})</span>
                  </div>
                  <div className="mt-auto">
                    <button 
                      className="w-full bg-secondary text-on-secondary font-button text-button py-3 px-6 rounded-lg hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <span className="material-symbols-outlined text-[18px]" data-icon="shopping_cart">shopping_cart</span>
                      {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Shop;
