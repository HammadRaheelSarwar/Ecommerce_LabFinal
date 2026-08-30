import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protects routes that require customer login
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  return children
}

// Redirects authenticated users away from login/signup
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const redirect = params.get('redirect') || '/'

  if (loading) return null
  if (isAuthenticated) return <Navigate to={redirect} replace />

  return children
}

// Protects admin routes — uses separate admin token key
export const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('aa_admin_token')
  if (!adminToken) return <Navigate to="/admin/login" replace />
  return children
}
