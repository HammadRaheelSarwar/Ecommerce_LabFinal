const slugify = require('slugify');

const makeSlug = (name) => slugify(name, { lower: true, strict: true });

const categoryData = [
  {
    name: 'Women',
    slug: 'women',
    description: 'Premium women\'s fashion — dresses, kurtis, abayas, and more',
    sortOrder: 1,
    showInNav: true,
    image: { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80' },
    banner: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80' },
    subcategories: [
      'Dresses', 'Abayas', 'Kurtis', 'Shirts', 'Tops', 'T-Shirts',
      'Jeans', 'Trousers', 'Skirts', 'Co-Ord Sets', 'Suits',
      'Formal Wear', 'Casual Wear', 'Party Wear', 'Jackets', 'Hoodies',
      'Sweaters', 'Activewear', 'Sleepwear',
    ].map((name) => ({ name, slug: makeSlug(name) })),
  },
  {
    name: 'Men',
    slug: 'men',
    description: 'Modern men\'s fashion — shirts, suits, casuals, and more',
    sortOrder: 2,
    showInNav: true,
    image: { url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80' },
    banner: { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4239?w=1600&q=80' },
    subcategories: [
      'Shirts', 'T-Shirts', 'Polo Shirts', 'Jeans', 'Trousers',
      'Formal Wear', 'Casual Wear', 'Suits', 'Jackets', 'Hoodies',
      'Sweaters', 'Traditional Wear', 'Sportswear',
    ].map((name) => ({ name, slug: makeSlug(name) })),
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    description: 'Shoes, sneakers, heels, sandals and more',
    sortOrder: 3,
    showInNav: true,
    image: { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' },
    subcategories: [
      'Women Shoes', 'Men Shoes', 'Sneakers', 'Heels', 'Sandals',
      'Slippers', 'Formal Shoes', 'Casual Shoes',
    ].map((name) => ({ name, slug: makeSlug(name) })),
  },
  {
    name: 'Watches',
    slug: 'watches',
    description: 'Luxury and everyday timepieces',
    sortOrder: 4,
    showInNav: true,
    image: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
    banner: { url: 'https://images.unsplash.com/photo-1495857000853-d23b128a2c68?w=1600&q=80' },
    subcategories: [
      'Men Watches', 'Women Watches', 'Luxury Watches', 'Smart Watches', 'Casual Watches',
    ].map((name) => ({ name, slug: makeSlug(name) })),
  },
  {
    name: 'Perfumes',
    slug: 'perfumes',
    description: 'Exclusive fragrances for him, her, and everyone',
    sortOrder: 5,
    showInNav: true,
    image: { url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80' },
    subcategories: [
      'Men Perfumes', 'Women Perfumes', 'Unisex Perfumes', 'Luxury Fragrances', 'Gift Sets',
    ].map((name) => ({ name, slug: makeSlug(name) })),
  },
  {
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Fine and fashion jewelry for every occasion',
    sortOrder: 6,
    showInNav: true,
    image: { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80' },
    subcategories: [
      'Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Bangles', 'Pendants', 'Jewelry Sets',
    ].map((name) => ({ name, slug: makeSlug(name) })),
  },
  {
    name: 'Bags',
    slug: 'bags',
    description: 'Handbags, clutches, backpacks and wallets',
    sortOrder: 7,
    showInNav: true,
    image: { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80' },
    subcategories: [
      'Handbags', 'Shoulder Bags', 'Crossbody Bags', 'Clutches', 'Backpacks', 'Wallets',
    ].map((name) => ({ name, slug: makeSlug(name) })),
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Sunglasses, belts, caps, scarves and more',
    sortOrder: 8,
    showInNav: true,
    image: { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
    subcategories: [
      'Sunglasses', 'Belts', 'Wallets', 'Caps', 'Scarves', 'Hijabs', 'Fashion Accessories',
    ].map((name) => ({ name, slug: makeSlug(name) })),
  },
];

module.exports = { categories: categoryData };
