import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { User, Package, MapPin, Heart, LogOut, Home } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { label: 'Dashboard',  to: '/account',           icon: Home,     end: true },
  { label: 'My Orders',  to: '/account/orders',    icon: Package },
  { label: 'Profile',    to: '/account/profile',   icon: User },
  { label: 'Addresses',  to: '/account/addresses', icon: MapPin },
  { label: 'Wishlist',   to: '/account/wishlist',  icon: Heart },
]

export default function AccountLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully.')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-black-premium border-b border-white/5 py-8">
        <div className="container-luxury">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-1">My Account</p>
          <h1 className="font-serif text-3xl font-bold text-white">
            Welcome, {user?.fullName?.split(' ')[0] || 'Customer'}
          </h1>
        </div>
      </div>

      <div className="container-luxury py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-black-card border border-white/5 p-4 sticky top-24">
              {/* User info */}
              <div className="flex items-center gap-3 p-3 mb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold font-sans">
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-sans font-semibold truncate">{user?.fullName}</p>
                  <p className="text-gray-mid text-xs font-sans truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {NAV.map(({ label, to, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 text-sm font-sans rounded transition-colors ${
                        isActive
                          ? 'text-gold bg-gold/10 font-semibold'
                          : 'text-gray-luxury hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                ))}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans text-gray-luxury hover:text-red-400 hover:bg-red-500/5 w-full text-left transition-colors rounded mt-2"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
