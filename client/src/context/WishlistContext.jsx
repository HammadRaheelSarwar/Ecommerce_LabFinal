import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)
const LS_KEY = 'aa_wishlist'

const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [wishlist, setWishlist] = useState(loadLocal)

  // Merge on login
  useEffect(() => {
    if (!isAuthenticated) return
    const local = loadLocal()
    const sync = async () => {
      try {
        if (local.length > 0) {
          await api.put('/users/wishlist/sync', { productIds: local })
        }
        const res = await api.get('/users/wishlist')
        const ids = res.data.wishlist.map(w => w.product?._id || w.product)
        setWishlist(ids)
        localStorage.removeItem(LS_KEY)
      } catch (_) {}
    }
    sync()
  }, [isAuthenticated, user?._id])

  // Persist for guests
  useEffect(() => {
    if (!isAuthenticated) localStorage.setItem(LS_KEY, JSON.stringify(wishlist))
  }, [wishlist, isAuthenticated])

  const toggleWishlist = useCallback(async (product) => {
    const id = product._id
    const isIn = wishlist.includes(id)

    if (isAuthenticated) {
      try {
        const res = await api.post(`/users/wishlist/${id}`)
        if (res.data.inWishlist) {
          setWishlist(prev => [...prev, id])
          toast.success('Added to Favorites')
        } else {
          setWishlist(prev => prev.filter(w => w !== id))
          toast.success('Removed from Favorites')
        }
      } catch (_) {}
    } else {
      // Guest — local only
      if (isIn) {
        setWishlist(prev => prev.filter(w => w !== id))
        toast.success('Removed from Favorites')
      } else {
        setWishlist(prev => [...prev, id])
        toast.success('Added to Favorites')
      }
    }
  }, [isAuthenticated, wishlist])

  const isInWishlist = useCallback((id) => wishlist.includes(id), [wishlist])

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
