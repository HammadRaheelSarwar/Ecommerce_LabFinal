const KEY = 'aa_recently_viewed'
const MAX_ITEMS = 15

export function addRecentlyViewed(product) {
  if (!product || !product.slug) return
  try {
    const raw = localStorage.getItem(KEY)
    let list = raw ? JSON.parse(raw) : []
    // Remove if already exists
    list = list.filter(item => item.slug !== product.slug && item._id !== product._id)
    // Add to top
    const mainImg = product.images?.find(i => i.isMain) || product.images?.[0]
    list.unshift({
      _id: product._id,
      slug: product.slug,
      name: product.name,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      image: mainImg?.url || '',
      images: product.images || (mainImg ? [mainImg] : []),
      brand: product.brand,
      viewedAt: Date.now(),
    })
    if (list.length > MAX_ITEMS) {
      list = list.slice(0, MAX_ITEMS)
    }
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (_) {}
}

export function getRecentlyViewed(excludeSlug = '') {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (excludeSlug) {
      return list.filter(item => item.slug !== excludeSlug)
    }
    return list
  } catch {
    return []
  }
}
