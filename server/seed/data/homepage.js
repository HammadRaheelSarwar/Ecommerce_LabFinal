const homepageSections = [
  {
    sectionKey: 'hero',
    isActive: true,
    title: 'EVERYTHING YOU WANT.\nALL AVAILABLE.',
    subtitle: 'Discover premium fashion, accessories, watches, fragrances and lifestyle essentials — all in one destination.',
    ctaText: 'SHOP NOW',
    ctaUrl: '/shop',
    secondaryCtaText: 'EXPLORE COLLECTION',
    secondaryCtaUrl: '/shop?isNewArrival=true',
    image: { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=90' },
  },
  {
    sectionKey: 'featured_collection',
    isActive: true,
    title: 'THE SIGNATURE COLLECTION',
    subtitle: 'Curated with precision. Crafted for you.',
    ctaText: 'DISCOVER COLLECTION',
    ctaUrl: '/shop?isFeatured=true',
    image: { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80' },
  },
  {
    sectionKey: 'watches',
    isActive: true,
    title: 'TIMELESS ELEGANCE',
    subtitle: 'Discover watches designed to make every second memorable.',
    ctaText: 'SHOP WATCHES',
    ctaUrl: '/category/watches',
    image: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80' },
  },
  {
    sectionKey: 'perfumes',
    isActive: true,
    title: 'THE ART OF FRAGRANCE',
    subtitle: 'A scent that lingers long after you leave.',
    ctaText: 'EXPLORE FRAGRANCES',
    ctaUrl: '/category/perfumes',
    image: { url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=1200&q=80' },
  },
  {
    sectionKey: 'jewelry',
    isActive: true,
    title: 'SHINE DIFFERENTLY',
    subtitle: 'Jewelry that tells your story.',
    ctaText: 'SHOP JEWELRY',
    ctaUrl: '/category/jewelry',
    image: { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80' },
  },
  {
    sectionKey: 'sale_banner',
    isActive: true,
    title: 'UP TO 50% OFF',
    subtitle: 'Selected styles. Limited time.',
    ctaText: 'SHOP THE SALE',
    ctaUrl: '/shop?isOnSale=true',
    image: { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80' },
  },
  {
    sectionKey: 'men_women_banner',
    isActive: true,
    title: 'HIS & HER WORLD',
    subtitle: 'Two worlds. One destination.',
    image: { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80' },
    secondaryImage: { url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80' },
    ctaText: 'WOMEN',
    ctaUrl: '/category/women',
    secondaryCtaText: 'MEN',
    secondaryCtaUrl: '/category/men',
  },
  {
    sectionKey: 'trending',
    isActive: true,
    title: 'TRENDING NOW',
    subtitle: 'The styles everyone is talking about.',
    image: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80' },
  },
  {
    sectionKey: 'newsletter',
    isActive: true,
    title: 'JOIN THE ALL AVAILABLE WORLD',
    subtitle: 'Be the first to discover new arrivals, exclusive collections and special offers.',
  },
];

const websiteSettings = {
  siteName: 'All Available',
  siteTagline: 'Everything You Desire, All Available.',
  announcementBar: {
    isActive: true,
    messages: [
      'Free Delivery on Orders Above Rs. 5,000',
      'New Collection Has Arrived',
      'Premium Fashion. Exceptional Style.',
    ],
    backgroundColor: '#D4AF37',
    textColor: '#050505',
  },
  contact: {
    email: 'hello@allavailable.com',
    phone: '+92 300 0000000',
    whatsapp: '+92 300 0000000',
    address: 'Lahore, Pakistan',
  },
  social: {
    instagram: 'https://instagram.com/allavailable',
    facebook: 'https://facebook.com/allavailable',
    tiktok: 'https://tiktok.com/@allavailable',
    pinterest: 'https://pinterest.com/allavailable',
  },
  shipping: {
    freeShippingThreshold: 5000,
    standardShippingCost: 200,
    freeShippingLabel: 'Free delivery on orders above Rs. 5,000',
  },
  footer: {
    description: 'All Available is your premier destination for premium fashion, watches, fragrances, jewelry, and lifestyle essentials.',
    copyrightText: '© All Available. All Rights Reserved.',
  },
  seo: {
    defaultTitle: 'All Available — Premium Fashion & Lifestyle Store',
    defaultDescription: 'Shop premium fashion, watches, perfumes, jewelry, bags and accessories. Everything you desire, all available.',
  },
};

const banners = [
  {
    title: 'NEW COLLECTION',
    subtitle: 'Summer 2026',
    image: { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=90' },
    buttonText: 'SHOP NOW',
    buttonUrl: '/shop?isNewArrival=true',
    location: 'hero',
    isActive: true,
    sortOrder: 1,
  },
];

module.exports = { homepageSections, websiteSettings, banners };
