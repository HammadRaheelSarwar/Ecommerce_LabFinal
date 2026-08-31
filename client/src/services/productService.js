import api from './api'

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getById: (id) => api.get(`/products/id/${id}`),
  getSimilar: (slugOrId, limit = 12) => api.get(`/products/slug/${slugOrId}/similar`, { params: { limit } }),

  // Admin
  getAllAdmin: (params) => api.get('/products/admin/all', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  duplicate: (id) => api.post(`/products/${id}/duplicate`),
}
