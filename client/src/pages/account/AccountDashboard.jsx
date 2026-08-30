import { Link } from 'react-router-dom'
import { Package, MapPin, Heart, User, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'

const QUICK_LINKS = [
  { label: 'My Orders',    to: '/account/orders',    icon: Package,  desc: 'Track and manage orders' },
  { label: 'Profile',      to: '/account/profile',   icon: User,     desc: 'Update personal info' },
  { label: 'Addresses',    to: '/account/addresses', icon: MapPin,   desc: 'Manage delivery addresses' },
  { label: 'Wishlist',     to: '/account/wishlist',  icon: Heart,    desc: 'Saved items' },
]

export default function AccountDashboard() {
  const { user } = useAuth()
  const { wishlist } = useWishlist()

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="bg-black-card border border-gold/15 p-6">
        <p className="text-gold text-xs tracking-[0.3em] uppercase font-sans mb-1">Account Overview</p>
        <h2 className="font-serif text-2xl font-bold text-white">
          Hello, {user?.fullName}!
        </h2>
        <p className="text-gray-mid text-sm font-sans mt-1">
          Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_LINKS.map(({ label, to, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 bg-black-card border border-white/5 hover:border-gold/30 p-5 transition-all duration-300 group"
          >
            <div className="w-10 h-10 border border-gold/20 group-hover:border-gold/50 flex items-center justify-center transition-all">
              <Icon size={18} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-sans font-semibold">{label}</p>
              <p className="text-gray-mid text-xs font-sans">{desc}</p>
            </div>
            <ChevronRight size={14} className="text-gray-mid group-hover:text-gold transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
