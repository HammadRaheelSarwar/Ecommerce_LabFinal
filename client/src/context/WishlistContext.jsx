import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)
const LS_IDS_KEY = 'aa_wishlist'
const LS_ITEMS_KEY = 'aa_favorite_items'

const loadLocalIds = () => {
  try { return JSON.parse(localStorage.getItem(LS_IDS_KEY)) || [] } catch { return [] }
}

const loadLocalItems = () => {
  try { return JSON.parse(localStorage.getItem(LS_ITEMS_KEY)) || [] } catch { return [] }
}

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [wishlist, setWishlist] = useState(loadLocalIds)
  const [favoriteItems, setFavoriteItems] = useState(loadLocalItems)

  // Persist IDs and Full Items for guests & offline
  useEffect(() => {
    localStorage.setItem(LS_IDS_KEY, JSON.stringify(wishlist))
    localStorage.setItem(LS_ITEMS_KEY, JSON.stringify(favoriteItems))
  }, [wishlist, favoriteItems])

  const toggleWishlist = useCallback(async (product) => {
    if (!product) return
    const id = String(product._id || product.id || product.slug)
    const isIn = wishlist.includes(id)

    if (isIn) {
      setWishlist(prev => prev.filter(w => w !== id))
      setFavoriteItems(prev => prev.filter(p => String(p._id || p.id || p.slug) !== id))
      toast.success('Removed from Favorites', { icon: '🤍' })
      if (isAuthenticated) {
        try { await api.post(`/users/wishlist/${id}`) } catch (_) {}
      }
    } else {
      setWishlist(prev => [...prev, id])
      setFavoriteItems(prev => [product, ...prev.filter(p => String(p._id || p.id || p.slug) !== id)])
      toast.success('Added to Favorites', { icon: '❤️' })
      if (isAuthenticated) {
        try { await api.post(`/users/wishlist/${id}`) } catch (_) {}
      }
    }
  }, [isAuthenticated, wishlist])

  const isInWishlist = useCallback((idOrSlug) => {
    if (!idOrSlug) return false
    const str = String(idOrSlug)
    return wishlist.includes(str) || favoriteItems.some(p => String(p._id || p.id || p.slug) === str)
  }, [wishlist, favoriteItems])

  return (
    <WishlistContext.Provider value={{ wishlist, favoriteItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
