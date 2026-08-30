import api from './api'

export const orderService = {
  create:    (data)   => api.post('/orders', data),
  getAll:    (params) => api.get('/orders', { params }),
  getById:   (id)     => api.get(`/orders/${id}`),
  update:    (id, data) => api.put(`/orders/${id}`, data),
  delete:    (id)     => api.delete(`/orders/${id}`),
  getMyOrders: (params) => api.get('/users/orders', { params }),
  getMyOrderById: (id) => api.get(`/users/orders/${id}`),
}
