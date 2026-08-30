import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { TableRowSkeleton } from '../../../components/ui/Skeleton'
import api from '../../../services/api'

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/customers?search=${search}&limit=20`, { headers: { 'X-Admin-Authorization': `Bearer ${localStorage.getItem('aa_admin_token')}` }})
      .then(r => setCustomers(r.data.customers || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-white">Customers</h1>

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-luxury pl-9 text-xs" />
      </div>

      <div className="bg-black-surface border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Name', 'Email', 'Phone', 'Orders', 'Joined', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-mid font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [1,2,3,4,5].map(i => <TableRowSkeleton key={i} cols={6} />) : customers.map(c => (
              <tr key={c._id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 text-white font-sans font-medium">{c.fullName}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{c.email}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-gold text-xs font-sans font-bold">{c.orderCount || 0}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 font-sans ${c.isActive !== false ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {c.isActive !== false ? 'ACTIVE' : 'BLOCKED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
