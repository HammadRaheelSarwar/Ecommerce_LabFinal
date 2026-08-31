// Client Analytics Tracking Service
export const analyticsService = {
  track: (eventName, eventData = {}) => {
    try {
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({ event: eventName, ...eventData, timestamp: new Date().toISOString() })
      }
      if (import.meta.env.DEV) {
        console.debug(`[Analytics] ${eventName}`, eventData)
      }
    } catch (_) {}
  },

  trackProductView: (product) => {
    if (!product) return
    analyticsService.track('product_view', {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      category: product.category?.name || product.category,
      price: product.salePrice || product.basePrice,
    })
  },

  trackAddToCart: (product, variant, quantity) => {
    if (!product) return
    analyticsService.track('add_to_cart', {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice || product.basePrice,
      quantity,
      size: variant?.size,
      color: variant?.color,
    })
  },

  trackAddToWishlist: (product) => {
    if (!product) return
    analyticsService.track('add_to_wishlist', {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice || product.basePrice,
    })
  },

  trackBuyNowClick: (product, variant, quantity) => {
    if (!product) return
    analyticsService.track('buy_now_click', {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: (product.salePrice || product.basePrice) * quantity,
      quantity,
      size: variant?.size,
      color: variant?.color,
    })
  },

  trackWhatsAppOrderClick: (product, variant, quantity) => {
    if (!product) return
    analyticsService.track('whatsapp_order_click', {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      channel: 'whatsapp',
      quantity,
      size: variant?.size,
      color: variant?.color,
    })
  },

  trackEmailOrderClick: (product, variant, quantity) => {
    if (!product) return
    analyticsService.track('email_order_click', {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      channel: 'email',
      quantity,
      size: variant?.size,
      color: variant?.color,
    })
  },
}
