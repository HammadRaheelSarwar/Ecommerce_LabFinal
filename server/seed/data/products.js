const slugify = require('slugify');

const getProducts = (categoryMap) => [
  {
    name: 'Pink Floral After Wash Soft Arganza Net Gown',
    slug: 'pink-floral-after-wash-soft-arganza-net-gown',
    sku: 'MZ779014450ANMCL',
    description: 'Exquisite Pink Floral After Wash Soft Organza Net Gown. Tailored with premium imported net organza featuring delicate floral embroidery, soft inner lining, and elegant bell sleeves. Ideal for festive gatherings and luxury formal wear.',
    shortDescription: 'Pink Floral Soft Organza Net Gown with delicate embroidery.',
    category: categoryMap['women-s-unstitched'] || categoryMap['womens-unstitched'] || categoryMap['women'],
    subcategory: 'Shirt',
    brand: 'All Available Exclusive',
    gender: 'women',
    material: 'Soft Organza Net',
    tags: ['Woman Shirt', 'Shirt', 'Organza', 'Floral Gown', 'Festive', 'Pink'],
    basePrice: 4500,
    salePrice: 3450,
    discountPercentage: 23,
    rating: 4.9,
    reviewCount: 28,
    soldCount: 84,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isActive: true,
    allowWhatsApp: true,
    allowEmail: true,
    images: [
      {
        url: '/images/products/pink-floral-organza-gown-1.webp',
        isMain: true,
        isHover: false,
        sortOrder: 1,
      },
      {
        url: '/images/products/pink-floral-organza-gown-2.webp',
        isMain: false,
        isHover: true,
        sortOrder: 2,
      },
    ],
    variants: [
      { size: 'Small', color: 'Pink', stock: 12, lowStockAlert: 2, isActive: true },
      { size: 'Medium', color: 'Pink', stock: 15, lowStockAlert: 3, isActive: true },
      { size: 'Large', color: 'Pink', stock: 10, lowStockAlert: 2, isActive: true },
    ],
  },
];

module.exports = { getProducts };
