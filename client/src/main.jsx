import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    border: '1px solid rgba(212,175,55,0.3)',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '0.875rem',
                  },
                  success: { iconTheme: { primary: '#D4AF37', secondary: '#050505' } },
                  error:   { iconTheme: { primary: '#ef4444', secondary: '#FFFFFF' } },
                }}
              />
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
