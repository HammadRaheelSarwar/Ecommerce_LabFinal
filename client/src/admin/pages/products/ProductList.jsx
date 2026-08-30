import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Copy, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { productService } from '../../../services/productService'
import Modal from '../../../components/ui/Modal'
import { TableRowSkeleton } from '../../../components/ui/Skeleton'

export default function ProductList() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [deleteId, setDeleteId]   = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await productService.getAllAdmin({ page, limit: 20, search })
      setProducts(res.data.products || [])
      setTotal(res.data.pagination?.total || 0)
    } catch (_) {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await productService.delete(deleteId)
      toast.success('Product deleted.')
      setDeleteId(null)
      load()
    } catch (_) {
      toast.error('Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await productService.duplicate(id)
      toast.success('Product duplicated.')
      load()
    } catch (_) { toast.error('Duplicate failed.') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-mid text-sm font-sans">{total} products total</p>
        </div>
        <Link to="/admin/products/new" className="btn-gold text-xs py-2">
          <Plus size={14} /> ADD PRODUCT
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          className="input-luxury pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-black-surface border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Image', 'Name', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-mid font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3,4,5].map(i => <TableRowSkeleton key={i} cols={7} />)
            ) : products.map(p => {
              const img = p.images?.find(i => i.isMain) || p.images?.[0]
              const totalStock = p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0
              return (
                <tr key={p._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    {img ? <img src={img.url} alt="" className="w-10 h-12 object-cover" /> : <div className="w-10 h-12 bg-black-card" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-sans text-white text-sm font-medium max-w-[200px] truncate">{p.name}</div>
                    <div className="text-gray-mid text-xs">{p.category?.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-mid text-xs font-sans">{p.sku || '—'}</td>
                  <td className="px-4 py-3 font-sans text-white text-xs">
                    {p.salePrice ? (
                      <span className="text-gold">Rs. {p.salePrice.toLocaleString()}</span>
                    ) : (
                      `Rs. ${p.basePrice?.toLocaleString()}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-sans ${totalStock === 0 ? 'text-red-400' : totalStock <= 5 ? 'text-orange-400' : 'text-green-400'}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 font-sans ${p.isActive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                      {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/products/${p._id}`} className="p-1.5 text-gray-mid hover:text-gold transition-colors">
                        <Edit2 size={13} />
                      </Link>
                      <button onClick={() => handleDuplicate(p._id)} className="p-1.5 text-gray-mid hover:text-blue-400 transition-colors">
                        <Copy size={13} />
                      </button>
                      <button onClick={() => setDeleteId(p._id)} className="p-1.5 text-gray-mid hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-white/10 text-gray-mid hover:border-gold/30 disabled:opacity-40 font-sans">PREV</button>
          <span className="px-3 py-1.5 text-xs bg-gold text-black font-bold font-sans">{page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={products.length < 20}
            className="px-3 py-1.5 text-xs border border-white/10 text-gray-mid hover:border-gold/30 disabled:opacity-40 font-sans">NEXT</button>
        </div>
      )}

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="DELETE"
        confirmClass="bg-red-500 hover:bg-red-600 text-white text-xs font-bold tracking-widest flex-1 py-2.5"
      />
    </div>
  )
}
