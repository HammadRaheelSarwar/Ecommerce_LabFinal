import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ShoppingCart, Package, Users, DollarSign, AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { analyticsService } from '../../services/contentService'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'

const CARD_ICONS = {
  totalRevenue:   { icon: DollarSign, label: 'Total Revenue',      format: v => `Rs. ${(v || 0).toLocaleString()}`, color: 'text-gold' },
  todayRevenue:   { icon: TrendingUp, label: "Today's Revenue",     format: v => `Rs. ${(v || 0).toLocaleString()}`, color: 'text-green-400' },
  totalOrders:    { icon: ShoppingCart, label: 'Total Orders',      format: v => v, color: 'text-blue-400' },
  todayOrders:    { icon: ShoppingCart, label: "Today's Orders",    format: v => v, color: 'text-cyan-400' },
  totalProducts:  { icon: Package, label: 'Active Products',        format: v => v, color: 'text-purple-400' },
  lowStockProducts:{ icon: AlertTriangle, label: 'Low Stock',       format: v => v, color: 'text-orange-400' },
  totalCustomers: { icon: Users, label: 'Total Customers',          format: v => v, color: 'text-pink-400' },
  pendingOrders:  { icon: ShoppingCart, label: 'Pending Orders',    format: v => v, color: 'text-yellow-400' },
}

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.getOverview(),
      analyticsService.getRevenue({ days: 14 }),
    ]).then(([ov, rv]) => {
      setData(ov.data.data)
      setRevenue(rv.data.data || [])
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-mid text-sm font-sans">Welcome back. Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <DashboardCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(CARD_ICONS).map(([key, cfg], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-black-surface border border-white/5 hover:border-gold/20 p-5 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-mid font-sans">{cfg.label}</span>
                <cfg.icon size={16} className={cfg.color} />
              </div>
              <p className={`text-xl font-bold font-sans ${cfg.color}`}>
                {cfg.format(data?.[key])}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      {revenue.length > 0 && (
        <div className="bg-black-surface border border-white/5 p-6">
          <h3 className="font-sans font-bold text-white text-sm tracking-widest uppercase mb-6">Revenue (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="_id" tick={{ fill: '#888', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 0 }}
                labelStyle={{ color: '#fff', fontSize: 11 }}
                formatter={v => [`Rs. ${v.toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Add Product',   to: '/admin/products/new',   color: 'text-gold' },
          { label: 'View Orders',   to: '/admin/orders',         color: 'text-blue-400' },
          { label: 'Low Stock',     to: '/admin/inventory',      color: 'text-orange-400' },
          { label: 'Reviews',       to: '/admin/reviews',        color: 'text-purple-400' },
        ].map(a => (
          <Link key={a.to} to={a.to}
            className="flex items-center justify-between bg-black-surface border border-white/5 hover:border-gold/20 p-4 transition-all group"
          >
            <span className={`text-xs font-sans font-bold tracking-widest uppercase ${a.color}`}>{a.label}</span>
            <ArrowRight size={12} className="text-gray-mid group-hover:text-gold transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
