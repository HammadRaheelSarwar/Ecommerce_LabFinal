import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { analyticsService } from '../../services/contentService'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'

const PIE_COLORS = ['#D4AF37', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Reports() {
  const [days, setDays]                 = useState(30)
  const [revenueData, setRevenueData]   = useState([])
  const [statusData, setStatusData]     = useState([])
  const [bestSellers, setBestSellers]   = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      analyticsService.getRevenue({ days }),
      analyticsService.getOrdersByStatus(),
      analyticsService.getBestSellers(),
    ]).then(([rev, stat, best]) => {
      setRevenueData(rev.data.data || [])
      setStatusData(stat.data.data || [])
      setBestSellers(best.data.data || [])
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-gray-mid text-sm font-sans">Business intelligence, sales trends, and inventory performance metrics.</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-sans font-semibold border transition-all ${
                days === d
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-white/10 text-gray-mid hover:border-gold/30'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
      ) : (
        <>
          {/* Revenue Chart */}
          <div className="bg-black-surface border border-white/5 p-6">
            <div className="mb-4">
              <h3 className="font-sans font-bold text-white text-xs tracking-widest uppercase">Revenue History</h3>
              <p className="text-gray-mid text-xs font-sans">Gross sales generated over the selected timeframe.</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" tick={{ fill: '#888', fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `Rs. ${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid rgba(212,175,55,0.3)' }}
                  formatter={v => [`Rs. ${v.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} dot={{ r: 3, fill: '#D4AF37' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders by Status */}
            <div className="bg-black-surface border border-white/5 p-6">
              <div className="mb-4">
                <h3 className="font-sans font-bold text-white text-xs tracking-widest uppercase">Order Status Distribution</h3>
                <p className="text-gray-mid text-xs font-sans">Fulfillment pipeline breakdown.</p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={entry => `${entry._id} (${entry.count})`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="bg-black-surface border border-white/5 p-6">
              <div className="mb-4">
                <h3 className="font-sans font-bold text-white text-xs tracking-widest uppercase">Top Selling Products</h3>
                <p className="text-gray-mid text-xs font-sans">Highest volume items.</p>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {bestSellers.length === 0 ? (
                  <p className="text-gray-mid text-sm font-sans py-8 text-center">No sales recorded yet.</p>
                ) : (
                  bestSellers.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-white/5 bg-black-card">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-gold/10 text-gold text-xs font-bold font-sans flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-white text-xs font-sans font-semibold truncate max-w-[180px]">{b.name || b._id}</p>
                          <p className="text-gray-mid text-[10px] font-sans">{b.totalQty || b.count} units sold</p>
                        </div>
                      </div>
                      <span className="text-gold font-sans font-bold text-xs">
                        Rs. {(b.totalRevenue || 0).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
