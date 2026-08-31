import api from './api'
import { supabase } from './supabaseClient'

function normalizeCategory(c) {
  if (!c) return null
  return {
    ...c,
    _id: c.id || c._id,
    isActive: c.is_active ?? c.isActive ?? true,
    showInNav: c.show_in_nav ?? c.showInNav ?? true,
    sortOrder: c.sort_order ?? c.sortOrder ?? 0,
    subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
  }
}

async function fetchCategoryBySlugFromSupabase(slug) {
  try {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    // Try exact or partial match
    let { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('slug', `%${cleanSlug}%`)
      .limit(1)
      .single()

    if (error || !data) {
      // Try matching by name
      const cleanName = slug.replace(/-/g, ' ')
      const res = await supabase
        .from('categories')
        .select('*')
        .ilike('name', `%${cleanName}%`)
        .limit(1)
        .single()
      data = res.data
    }

    if (!data) throw new Error('Category not found')
    return { data: { success: true, category: normalizeCategory(data) } }
  } catch (err) {
    console.warn('Supabase category fallback failed:', err)
    throw err
  }
}

export const categoryService = {
  getAll: async () => {
    try {
      const res = await api.get('/categories')
      if (res?.data?.categories && res.data.categories.length > 0) return res
      const { data } = await supabase.from('categories').select('*').eq('is_active', true)
      return { data: { success: true, categories: (data || []).map(normalizeCategory) } }
    } catch {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true)
      return { data: { success: true, categories: (data || []).map(normalizeCategory) } }
    }
  },

  getNav: async () => {
    try {
      return await api.get('/categories/nav')
    } catch {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true).eq('show_in_nav', true)
      return { data: { success: true, categories: (data || []).map(normalizeCategory) } }
    }
  },

  getBySlug: async (slug) => {
    try {
      return await api.get(`/categories/slug/${slug}`)
    } catch {
      return await fetchCategoryBySlugFromSupabase(slug)
    }
  },

  getAllAdmin: () => api.get('/categories/admin/all'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}
