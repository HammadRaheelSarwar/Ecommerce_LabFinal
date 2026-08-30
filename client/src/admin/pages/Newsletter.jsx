import { useState, useEffect } from 'react'
import { Mail, Trash2, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { newsletterService } from '../../services/contentService'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await newsletterService.getSubscribers({ search })
      setSubscribers(res.data.subscribers || [])
    } catch (_) {
      toast.error('Failed to load subscribers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await newsletterService.deleteSubscriber(deleteId)
      toast.success('Subscriber removed.')
      setDeleteId(null)
      load()
    } catch (_) {
      toast.error('Failed to delete subscriber.')
    } finally {
      setDeleting(false)
    }
  }

  const exportCSV = () => {
    if (subscribers.length === 0) return
    const headers = 'Email,Joined Date\n'
    const rows = subscribers.map(s => `"${s.email}","${new Date(s.createdAt).toISOString()}"`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-available-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Newsletter Subscribers</h1>
          <p className="text-gray-mid text-sm font-sans">Manage customer emails captured from footer and promotional newsletter sections.</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="btn-outline-gold text-xs py-2 flex items-center gap-2 self-start sm:self-auto disabled:opacity-40"
        >
          <Download size={13} /> EXPORT CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by email address..."
          className="input-luxury pl-9 text-xs py-2"
        />
      </div>

      {/* Table */}
      <div className="bg-black-surface border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Email Address', 'Date Subscribed', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-mid font-sans">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4].map(i => <TableRowSkeleton key={i} cols={4} />)
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-mid font-sans text-sm">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              subscribers.map(sub => (
                <tr key={sub._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gold" />
                      <span className="text-white text-xs font-sans font-medium">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-mid text-xs font-sans">
                    {new Date(sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 font-sans uppercase">
                      Subscribed
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(sub._id)}
                      className="p-1.5 text-gray-mid hover:text-red-400 transition-colors"
                      title="Delete subscriber"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Subscriber"
        message="Are you sure you want to remove this subscriber from the mailing list?"
        confirmText="REMOVE"
        confirmClass="bg-red-500 text-white text-xs font-bold flex-1 py-2.5"
      />
    </div>
  )
}
