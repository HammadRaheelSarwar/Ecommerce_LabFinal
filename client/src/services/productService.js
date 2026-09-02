import api from './api'
import { supabase } from './supabaseClient'

function normalizeProduct(p) {
  if (!p) return null
  return {
    ...p,
    _id: p.id || p._id,
    basePrice: Number(p.base_price ?? p.basePrice ?? 0),
    salePrice: p.sale_price != null ? Number(p.sale_price) : (p.salePrice != null ? Number(p.salePrice) : null),
    costPrice: p.cost_price != null ? Number(p.cost_price) : p.costPrice,
    discountPercentage: p.discount_percentage ?? p.discountPercentage ?? 0,
    isActive: p.is_active ?? p.isActive ?? true,
    isFeatured: p.is_featured ?? p.isFeatured ?? false,
    isNewArrival: p.is_new_arrival ?? p.isNewArrival ?? false,
    isBestSeller: p.is_best_seller ?? p.isBestSeller ?? false,
    isOnSale: p.is_on_sale ?? p.isOnSale ?? false,
    reviewCount: p.review_count ?? p.reviewCount ?? 0,
    soldCount: p.sold_count ?? p.soldCount ?? 0,
    shortDescription: p.short_description || p.shortDescription || '',
    categoryId: p.category_id || p.categoryId || p.category?._id || p.category?.id,
    allowWhatsApp: p.allow_whatsapp ?? p.allowWhatsApp ?? true,
    allowEmail: p.allow_email ?? p.allowEmail ?? true,
    images: Array.isArray(p.images) ? p.images : [],
    variants: Array.isArray(p.variants) ? p.variants : [],
  }
}

async function fetchProductsFromSupabase(params = {}) {
  try {
    let query = supabase.from('products').select('*').eq('is_active', true)

    if (params.category) {
      // Could be UUID or slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.category)
      if (isUuid) {
        query = query.eq('category_id', params.category)
      } else {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', params.category)
          .maybeSingle()
        if (cat?.id) {
          query = query.eq('category_id', cat.id)
        } else {
          return { data: { success: true, products: [], total: 0, pages: 0 } }
        }
      }
    }

    if (params.subcategory) {
      query = query.ilike('subcategory', `%${params.subcategory}%`)
    }

    if (params.featured || params.isFeatured) query = query.eq('is_featured', true)
    if (params.newArrival || params.isNewArrival) query = query.eq('is_new_arrival', true)
    if (params.bestSeller || params.isBestSeller) query = query.eq('is_best_seller', true)
    if (params.isOnSale) query = query.eq('is_on_sale', true)

    if (params.limit) query = query.limit(Number(params.limit))

    const { data, error } = await query
    if (error) throw error

    const products = (data || []).map(normalizeProduct)
    return {
      data: {
        success: true,
        products,
        total: products.length,
        pages: 1,
      },
    }
  } catch (err) {
    console.warn('Supabase fallback query failed:', err)
    return { data: { success: true, products: [], total: 0 } }
  }
}

async function fetchProductBySlugFromSupabase(slug) {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    const column = isUuid ? 'id' : 'slug'
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq(column, slug)
      .maybeSingle()

    if (!data) throw error || new Error('Product not found')

    return { data: { success: true, product: normalizeProduct(data) } }
  } catch (err) {
    console.warn('Supabase getBySlug fallback failed:', err)
    throw err
  }
}

async function fetchProductByIdFromSupabase(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('id', id)
      .maybeSingle()

    if (!data) throw error || new Error('Product not found')
    return { data: { success: true, product: normalizeProduct(data) } }
  } catch (err) {
    console.warn('Supabase getById fallback failed:', err)
    throw err
  }
}

export const productService = {
  getAll: async (params) => {
    try {
      const res = await api.get('/products', { params })
      if (res?.data?.products && res.data.products.length > 0) {
        return res
      }
      // If server returned 0 products or is empty, try Supabase
      return await fetchProductsFromSupabase(params)
    } catch {
      return await fetchProductsFromSupabase(params)
    }
  },

  getBySlug: async (slug) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    const endpoint = isUuid ? 'id' : 'slug'
    try {
      const res = await api.get(`/products/${endpoint}/${encodeURIComponent(slug)}`)
      if (res?.data?.product) return res
      return await fetchProductBySlugFromSupabase(slug)
    } catch {
      return await fetchProductBySlugFromSupabase(slug)
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`/products/id/${id}`)
    } catch {
      return await fetchProductByIdFromSupabase(id)
    }
  },

  getSimilar: async (slugOrId, limit = 12) => {
    try {
      return await api.get(`/products/slug/${slugOrId}/similar`, { params: { limit } })
    } catch {
      return await fetchProductsFromSupabase({ limit })
    }
  },

  // Admin
  getAllAdmin: (params) => api.get('/products/admin/all', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  duplicate: (id) => api.post(`/products/${id}/duplicate`),
}
