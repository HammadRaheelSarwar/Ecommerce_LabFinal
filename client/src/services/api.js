import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request interceptor — dynamically attach customer & admin tokens
api.interceptors.request.use(config => {
  const userToken = localStorage.getItem('aa_token')
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`
  }

  const adminToken = localStorage.getItem('aa_admin_token')
  if (adminToken) {
    config.headers['X-Admin-Authorization'] = `Bearer ${adminToken}`
  }

  return config
}, error => Promise.reject(error))

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || ''
      // If customer auth failed (and not intentional login/signup attempt), clear customer token
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/admin/')) {
        localStorage.removeItem('aa_token')
      }
      // If admin auth failed, clear admin token
      if (url.includes('/admin/') && !url.includes('/admin/login')) {
        localStorage.removeItem('aa_admin_token')
      }
    }
    return Promise.reject(err)
  }
)

export default api
