import { useState, useEffect } from 'react'
import { ScrollText, RefreshCw, Clock, User, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/contentService'
import { TableRowSkeleton } from '../../components/ui/Skeleton'

export default function ActivityLogs() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminService.getLogs({ page, limit: 30 })
      setLogs(res.data.logs || [])
      setTotal(res.data.pagination?.total || 0)
    } catch (_) {
      toast.error('Failed to load activity logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">System Activity Logs</h1>
          <p className="text-gray-mid text-sm font-sans">Audit trail of admin operations, status changes, inventory updates, and logins.</p>
        </div>
        <button
          onClick={load}
          className="btn-outline-gold text-xs py-2 flex items-center gap-2"
        >
          <RefreshCw size={13} /> REFRESH
        </button>
      </div>

      <div className="bg-black-surface border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Timestamp', 'Admin', 'Action', 'Target / Entity', 'IP Address', 'Details'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-mid font-sans">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} cols={6} />)
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-mid font-sans text-sm">
                  No activity logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-gray-mid text-xs font-sans whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-white text-xs font-sans font-medium">
                      <Shield size={12} className="text-gold" />
                      <span>{log.adminEmail || log.adminName || 'Admin'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gold/10 text-gold uppercase font-sans">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white text-xs font-sans">
                    {log.targetEntity || log.entityType || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-mid text-xs font-sans font-mono">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="px-4 py-3 text-gray-luxury text-xs font-sans max-w-xs truncate">
                    {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 30 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-white/10 text-gray-mid hover:border-gold/30 disabled:opacity-40 font-sans"
          >
            PREV
          </button>
          <span className="px-3 py-1.5 text-xs bg-gold text-black font-bold font-sans">{page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={logs.length < 30}
            className="px-3 py-1.5 text-xs border border-white/10 text-gray-mid hover:border-gold/30 disabled:opacity-40 font-sans"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  )
}
