import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const LS_KEY = 'aa_cart'

const loadLocalCart = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}
const saveLocalCart = (cart) => localStorage.setItem(LS_KEY, JSON.stringify(cart))

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [cart, setCart] = useState(loadLocalCart)
  const [cartOpen, setCartOpen] = useState(false)

  // When user logs in — merge localStorage cart with server cart
  useEffect(() => {
    if (!isAuthenticated) return
    const local = loadLocalCart()
    if (local.length > 0) {
      // Merge: send local cart to server, get back merged cart
      api.put('/users/cart/sync', {
        items: local.map(i => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          price: i.price,
        })),
      }).then(res => {
        setCart(res.data.cart || [])
        localStorage.removeItem(LS_KEY) // cleared after merge
      }).catch(() => {})
    } else {
      // Just load server cart
      api.get('/users/cart').then(res => {
        setCart(res.data.cart || [])
      }).catch(() => {})
    }
  }, [isAuthenticated, user?._id])

  // Persist local cart for guests
  useEffect(() => {
    if (!isAuthenticated) saveLocalCart(cart)
  }, [cart, isAuthenticated])

  const addToCart = useCallback((product, size, color, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        i => i.productId === product._id && i.size === size && i.color === color
      )
      let updated
      if (existingIdx > -1) {
        updated = [...prev]
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + quantity }
      } else {
        const mainImg = product.images?.find(img => img.isMain) || product.images?.[0]
        updated = [...prev, {
          productId: product._id,
          name: product.name,
          image: mainImg?.url || '',
          size,
          color,
          quantity,
          price: product.salePrice || product.basePrice,
          slug: product.slug,
        }]
      }
      // Sync to server if logged in
      if (isAuthenticated) {
        api.put('/users/cart/replace', { cart: updated }).catch(() => {})
      }
      return updated
    })
    toast.success('Added to bag!')
  }, [isAuthenticated])

  const removeFromCart = useCallback((productId, size, color) => {
    setCart(prev => {
      const updated = prev.filter(i => !(i.productId === productId && i.size === size && i.color === color))
      if (isAuthenticated) api.put('/users/cart/replace', { cart: updated }).catch(() => {})
      return updated
    })
  }, [isAuthenticated])

  const updateQuantity = useCallback((productId, size, color, quantity) => {
    if (quantity < 1) return
    setCart(prev => {
      const updated = prev.map(i =>
        i.productId === productId && i.size === size && i.color === color ? { ...i, quantity } : i
      )
      if (isAuthenticated) api.put('/users/cart/replace', { cart: updated }).catch(() => {})
      return updated
    })
  }, [isAuthenticated])

  const clearCart = useCallback(() => {
    setCart([])
    if (isAuthenticated) api.put('/users/cart/replace', { cart: [] }).catch(() => {})
  }, [isAuthenticated])

  const cartCount   = cart.reduce((sum, i) => sum + i.quantity, 0)
  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, cartOpen, setCartOpen,
      addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartSubtotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
