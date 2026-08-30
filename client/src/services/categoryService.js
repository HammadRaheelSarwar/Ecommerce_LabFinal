import api from './api'

export const categoryService = {
  getAll:      ()     => api.get('/categories'),
  getNav:      ()     => api.get('/categories/nav'),
  getBySlug:   (slug) => api.get(`/categories/slug/${slug}`),
  getAllAdmin:  ()     => api.get('/categories/admin/all'),
  create:      (data) => api.post('/categories', data),
  update:      (id, data) => api.put(`/categories/${id}`, data),
  delete:      (id)   => api.delete(`/categories/${id}`),
}
