import { useState, useEffect } from 'react'
import { Search, AlertTriangle, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { productService } from '../../services/productService'
import { TableRowSkeleton } from '../../components/ui/Skeleton'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all') // 'all', 'low', 'out'
  const [search, setSearch]     = useState('')
  const [editingStock, setEditingStock] = useState({}) // { `${productId}-${variantIndex}`: stockValue }
  const [savingKey, setSavingKey]       = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await productService.getAllAdmin({ limit: 100, search })
      setProducts(res.data.products || [])
    } catch (_) {
      toast.error('Failed to load inventory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search])

  // Flatten products into variant rows
  const rows = []
  products.forEach(p => {
    if (!p.variants || p.variants.length === 0) {
      rows.push({
        productId: p._id,
        productName: p.name,
        image: p.images?.find(i => i.isMain)?.url || p.images?.[0]?.url,
        sku: p.sku || '—',
        size: '—',
        color: '—',
        stock: 0,
        lowStockAlert: 5,
        variantIndex: -1,
        variants: [],
      })
    } else {
      p.variants.forEach((v, idx) => {
        rows.push({
          productId: p._id,
          productName: p.name,
          image: v.image || p.images?.find(i => i.isMain)?.url || p.images?.[0]?.url,
          sku: v.sku || p.sku || '—',
          size: v.size || '—',
          color: v.color || '—',
          stock: v.stock || 0,
          lowStockAlert: v.lowStockAlert || 5,
          variantIndex: idx,
          variants: p.variants,
        })
      })
    }
  })

  const filteredRows = rows.filter(r => {
    if (filter === 'out') return r.stock === 0
    if (filter === 'low') return r.stock > 0 && r.stock <= r.lowStockAlert
    return true
  })

  const handleStockSave = async (row) => {
    const key = `${row.productId}-${row.variantIndex}`
    const newStock = Number(editingStock[key])
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid non-negative number.')
      return
    }

    setSavingKey(key)
    try {
      const updatedVariants = [...row.variants]
      if (row.variantIndex >= 0 && updatedVariants[row.variantIndex]) {
        updatedVariants[row.variantIndex].stock = newStock
      }
      await productService.update(row.productId, { variants: updatedVariants })
      toast.success('Stock updated successfully!')
      setEditingStock(prev => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
      load()
    } catch (_) {
      toast.error('Failed to update stock.')
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-gray-mid text-sm font-sans">Monitor real-time stock levels and update quantities across all variants.</p>
        </div>
        <button
          onClick={load}
          className="btn-outline-gold text-xs py-2 self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw size={13} /> REFRESH
        </button>
      </div>

      {/* Filter tabs & Search */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'low', label: 'Low Stock' },
            { id: 'out', label: 'Out of Stock' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-sans font-semibold tracking-wider uppercase border transition-all ${
                filter === tab.id
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-white/10 text-gray-mid hover:border-gold/30 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product or SKU..."
            className="input-luxury pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-black-surface border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Product', 'SKU', 'Size', 'Color', 'Current Stock', 'Status', 'Quick Update'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-mid font-sans">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} cols={7} />)
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-mid font-sans text-sm">
                  No inventory items match the current filter.
                </td>
              </tr>
            ) : (
              filteredRows.map(row => {
                const key = `${row.productId}-${row.variantIndex}`
                const isSaving = savingKey === key
                const val = editingStock[key] !== undefined ? editingStock[key] : row.stock
                const isChanged = editingStock[key] !== undefined && Number(editingStock[key]) !== row.stock

                return (
                  <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {row.image ? (
                          <img src={row.image} alt="" className="w-9 h-11 object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-11 bg-black-card flex-shrink-0" />
                        )}
                        <span className="text-white text-xs font-sans font-medium max-w-[200px] truncate">
                          {row.productName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-mid text-xs font-sans">{row.sku}</td>
                    <td className="px-4 py-3 text-gray-luxury text-xs font-sans font-semibold">{row.size}</td>
                    <td className="px-4 py-3 text-gray-luxury text-xs font-sans">{row.color}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-sans font-bold ${
                        row.stock === 0 ? 'text-red-400' : row.stock <= row.lowStockAlert ? 'text-orange-400' : 'text-green-400'
                      }`}>
                        {row.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 uppercase font-sans">
                          <AlertTriangle size={10} /> Out of Stock
                        </span>
                      ) : row.stock <= row.lowStockAlert ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-orange-500/10 text-orange-400 uppercase font-sans">
                          <AlertTriangle size={10} /> Low Stock
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 uppercase font-sans">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={val}
                          onChange={e => setEditingStock(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-16 input-luxury text-xs py-1 px-2 text-center"
                        />
                        {isChanged && (
                          <button
                            onClick={() => handleStockSave(row)}
                            disabled={isSaving}
                            className="p-1.5 bg-gold text-black hover:bg-gold-soft transition-colors disabled:opacity-50"
                            title="Save stock"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
