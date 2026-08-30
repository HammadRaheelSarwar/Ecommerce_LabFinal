import api from './api'

export const contentService = {
  getSettings:          ()             => api.get('/content/settings'),
  updateSettings:       (data)         => api.put('/content/settings', data),
  getHomepageSections:  ()             => api.get('/content/homepage'),
  getHomepageSectionsAdmin: ()         => api.get('/content/homepage/admin'),
  updateSection:        (key, data)    => api.put(`/content/homepage/${key}`, data),
}

export const bannerService = {
  getActive:  (location) => api.get('/banners', { params: { location } }),
  getAllAdmin: ()         => api.get('/banners/admin'),
  create:     (data)     => api.post('/banners', data),
  update:     (id, data) => api.put(`/banners/${id}`, data),
  delete:     (id)       => api.delete(`/banners/${id}`),
}

export const newsletterService = {
  subscribe:       (email)  => api.post('/newsletter/subscribe', { email }),
  getSubscribers:  (params) => api.get('/newsletter/subscribers', { params }),
  deleteSubscriber:(id)     => api.delete(`/newsletter/subscribers/${id}`),
}

export const analyticsService = {
  getOverview:       ()        => api.get('/analytics/overview'),
  getRevenue:        (params)  => api.get('/analytics/revenue', { params }),
  getOrdersByStatus: ()        => api.get('/analytics/orders-by-status'),
  getBestSellers:    ()        => api.get('/analytics/best-sellers'),
  getCustomers:      (params)  => api.get('/analytics/customers', { params }),
  toggleCustomer:    (id)      => api.put(`/analytics/customers/${id}/toggle`),
}

export const couponService = {
  validate:  (data)     => api.post('/coupons/validate', data),
  getAll:    ()         => api.get('/coupons'),
  create:    (data)     => api.post('/coupons', data),
  update:    (id, data) => api.put(`/coupons/${id}`, data),
  delete:    (id)       => api.delete(`/coupons/${id}`),
}

export const reviewService = {
  getApproved: (params) => api.get('/reviews', { params }),
  create:      (data)   => api.post('/reviews', data),
  getAllAdmin:  (params) => api.get('/reviews/admin', { params }),
  update:      (id, data) => api.put(`/reviews/${id}`, data),
  delete:      (id)     => api.delete(`/reviews/${id}`),
}

export const adminService = {
  login:       (data) => api.post('/admin/login', data),
  me:          ()     => api.get('/admin/me'),
  logout:      ()     => api.post('/admin/logout'),
  getLogs:     (params) => api.get('/admin/logs', { params }),
}

export const uploadService = {
  upload: (file) => {
    const form = new FormData()
    form.append('image', file)
    return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  delete: (cloudinaryId) => api.delete('/upload', { data: { cloudinaryId } }),
}
