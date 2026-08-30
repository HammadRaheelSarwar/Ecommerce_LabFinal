import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Users, Percent,
  Star, ImageIcon, FileText, Mail, BarChart2, Settings, LogOut,
  Menu, X, Box, ScrollText, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',   to: '/admin',         icon: LayoutDashboard, end: true },
      { label: 'Reports',     to: '/admin/reports', icon: BarChart2 },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products',    to: '/admin/products',   icon: Package },
      { label: 'Categories',  to: '/admin/categories', icon: Tags },
      { label: 'Inventory',   to: '/admin/inventory',  icon: Box },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders',      to: '/admin/orders',    icon: ShoppingCart },
      { label: 'Customers',   to: '/admin/customers', icon: Users },
      { label: 'Coupons',     to: '/admin/coupons',   icon: Percent },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Banners',     to: '/admin/banners',   icon: ImageIcon },
      { label: 'Homepage',    to: '/admin/content',   icon: FileText },
      { label: 'Newsletter',  to: '/admin/newsletter',icon: Mail },
      { label: 'Reviews',     to: '/admin/reviews',   icon: Star },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings',    to: '/admin/settings',  icon: Settings },
      { label: 'Activity Log',to: '/admin/logs',      icon: ScrollText },
    ],
  },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('aa_admin_token')
    toast.success('Logged out.')
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center">
          <img src="/logo.png" alt="AllAvailable" className="h-7 w-auto object-contain brightness-0 invert" />
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-mid hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-5">
            <p className="text-[9px] text-gray-mid tracking-[0.25em] uppercase font-sans font-bold px-3 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-sans rounded transition-colors ${
                      isActive
                        ? 'bg-gold/10 text-gold font-bold'
                        : 'text-gray-luxury hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={14} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-gray-mid hover:text-red-400 w-full px-3 py-2 rounded transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black-premium flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col admin-sidebar bg-black-surface border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-black-surface border-r border-white/5 z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-black-surface border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-mid hover:text-white">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs text-gray-mid font-sans">All Available Admin Panel</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="text-gray-mid hover:text-gold transition-colors">
              <Bell size={16} />
            </button>
            <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-black text-xs font-bold font-sans">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
