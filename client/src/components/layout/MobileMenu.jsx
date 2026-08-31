import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronRight, User, Package, Heart } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function MobileMenu({ open, onClose, navLinks }) {
  const { user, isAuthenticated } = useAuth()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 w-[85vw] max-w-xs bg-white text-gray-900 border-r border-gray-200 z-50 flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#0c5a37] text-white">
              <Link to="/" onClick={onClose} className="flex items-center">
                <img src="/logo.png" alt="AllAvailable" className="h-7 w-auto object-contain brightness-0 invert" />
              </Link>
              <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Welcome Tagline */}
            <div className="px-5 py-3.5 bg-emerald-50/70 border-b border-emerald-100/60">
              <p className="text-xs font-bold text-[#0c5a37]">Pakistan's Direct Marketplace</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Everything you love, delivered nationwide</p>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-2">
              {navLinks.map(link => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-5 py-3 text-xs font-bold border-b border-gray-100 transition-colors ${
                      isActive ? 'text-[#0c5a37] bg-emerald-50/50' : 'text-gray-700 hover:text-[#0c5a37] hover:bg-gray-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </NavLink>
              ))}
            </nav>

            {/* Bottom Quick Links */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
              <Link
                to="/account/orders"
                onClick={onClose}
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#0c5a37]"
              >
                <Package size={15} /> My Orders
              </Link>
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#0c5a37]"
              >
                <Heart size={15} /> My Favorites
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
