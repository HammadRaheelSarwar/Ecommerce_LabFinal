import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search, ShoppingBag, Heart, User, Menu, Camera,
  Package
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSearch } from '../../context/SearchContext'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import MobileMenu from './MobileMenu'

const SUB_NAV_ITEMS = [
  { label: 'All',             to: '/shop',                      icon: '📦' },
  { label: 'Kids & Mother',   to: '/category/women',            icon: '👶' },
  { label: 'Women Corner',    to: '/category/women',            icon: '👗' },
  { label: 'China',           to: '/shop?origin=china',         icon: '🇨🇳' },
  { label: 'Urdu Bazaar',     to: '/shop?category=bazaar',      icon: '📚' },
  { label: 'Beauty & Care',   to: '/category/perfumes',         icon: '💄' },
  { label: 'Men\'s Fashion',  to: '/category/men',              icon: '👔' },
  { label: 'Home & Living',   to: '/category/accessories',      icon: '🛋' },
  { label: 'Tech & Tools',    to: '/shop?category=tech',        icon: '📱' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const navigate = useNavigate()
  const { cartCount, setCartOpen } = useCart()
  const { openSearch, setQuery } = useSearch()
  const { user, isAuthenticated } = useAuth()
  const { wishlist } = useWishlist()

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    setQuery(searchInput)
    navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`)
  }

  return (
    <>
      <header className="sticky top-0 z-40 shadow-sm">
        {/* Main Forest Green Header */}
        <div className="bg-[#0e6f43] text-white py-3">
          <div className="container-markaz">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center flex-shrink-0 group">
                <img
                  src="/logo.png"
                  alt="AllAvailable"
                  className="h-8 sm:h-10 w-auto object-contain brightness-0 invert"
                />
              </Link>

              {/* Large Central Search Bar (Screenshot 1) */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex flex-1 max-w-2xl items-center bg-white rounded-full p-1 pl-4 shadow-sm border border-transparent focus-within:border-[#00b884] focus-within:ring-2 focus-within:ring-[#00b884]/20 transition-all"
              >
                <Search size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products, brands & stores"
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm font-sans outline-none pr-2"
                />

                {/* Camera Visual Search Icon */}
                <button
                  type="button"
                  onClick={openSearch}
                  title="Search with camera"
                  className="p-1.5 text-[#00b884] hover:bg-gray-100 rounded-full transition-colors mr-1 flex-shrink-0"
                >
                  <Camera size={18} />
                </button>

                {/* Primary Mint Green Search Button */}
                <button
                  type="submit"
                  className="bg-[#00b884] hover:bg-[#00a375] text-white px-6 py-2 rounded-full font-sans font-bold text-xs tracking-wider transition-all flex-shrink-0 shadow-sm"
                >
                  Search
                </button>
              </form>

              {/* Right Utility Navigation */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={openSearch}
                  className="md:hidden p-2 text-white/90 hover:text-white"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>

                {/* Profile */}
                <Link
                  to={isAuthenticated ? '/account' : '/login'}
                  className="flex items-center gap-1.5 px-2 py-1 text-white/90 hover:text-white transition-colors"
                >
                  <User size={18} className="text-white" />
                  <span className="hidden lg:inline text-xs font-sans font-semibold">
                    {isAuthenticated ? (user?.fullName?.split(' ')[0] || 'Profile') : 'Profile'}
                  </span>
                </Link>

                {/* Orders */}
                <Link
                  to={isAuthenticated ? '/account/orders' : '/login?redirect=/account/orders'}
                  className="flex items-center gap-1.5 px-2 py-1 text-white/90 hover:text-white transition-colors"
                >
                  <Package size={18} className="text-white" />
                  <span className="hidden lg:inline text-xs font-sans font-semibold">Orders</span>
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative flex items-center gap-1.5 px-2 py-1 text-white/90 hover:text-white transition-colors"
                >
                  <Heart size={18} className="text-white" />
                  <span className="hidden lg:inline text-xs font-sans font-semibold">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 lg:top-0 lg:-right-2 bg-[#00b884] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ShoppingBag size={18} className="text-white" />
                  <span className="hidden lg:inline text-xs font-sans font-bold">Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-[#00b884] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ml-1">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Mobile Menu */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden p-2 text-white"
                  aria-label="Menu"
                >
                  <Menu size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Category Navigation Bar (White row with icons from Screenshot 1) */}
        <div className="bg-white border-b border-gray-200 overflow-x-auto scrollbar-none no-scrollbar py-2.5">
          <div className="container-markaz">
            <nav className="flex items-center gap-6 text-xs font-sans font-semibold text-gray-700 whitespace-nowrap">
              {SUB_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 py-1 px-1 transition-colors ${
                      isActive
                        ? 'text-[#0e6f43] font-bold border-b-2 border-[#0e6f43]'
                        : 'hover:text-[#0e6f43]'
                    }`
                  }
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={SUB_NAV_ITEMS}
      />
    </>
  )
}
