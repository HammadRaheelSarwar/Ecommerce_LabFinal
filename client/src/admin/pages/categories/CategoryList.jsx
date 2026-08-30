import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService } from '../../../services/categoryService'
import Modal from '../../../components/ui/Modal'

const EMPTY = { name: '', slug: '', description: '', gender: 'all', isActive: true, subcategories: [] }

export default function CategoryList() {
  const [cats, setCats]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    categoryService.getAll()
      .then(r => setCats(r.data.categories || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const generateSlug = () => setForm(f => ({ ...f, slug: f.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error('Name and slug required.'); return }
    try {
      if (editing === 'new') await categoryService.create(form)
      else await categoryService.update(editing, form)
      toast.success('Category saved.')
      setEditing(null); setForm(EMPTY); load()
    } catch (_) { toast.error('Save failed.') }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await categoryService.delete(deleteId)
      toast.success('Category deleted.')
      setDeleteId(null); load()
    } catch (_) { toast.error('Delete failed.') }
    finally { setDeleting(false) }
  }

  const startEdit = (cat) => {
    setForm({ ...EMPTY, ...cat })
    setEditing(cat._id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-white">Categories</h1>
        <button onClick={() => { setEditing('new'); setForm(EMPTY) }} className="btn-gold text-xs py-2">
          <Plus size={13} /> ADD CATEGORY
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-black-surface border border-gold/20 p-5 space-y-4">
          <h3 className="text-xs font-bold text-gold tracking-widest uppercase">{editing === 'new' ? 'New Category' : 'Edit Category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-xs">Name *</label>
              <input type="text" name="name" value={form.name} onChange={onChange} onBlur={generateSlug} className="input-luxury" />
            </div>
            <div>
              <label className="label-xs">Slug *</label>
              <input type="text" name="slug" value={form.slug} onChange={onChange} className="input-luxury" />
            </div>
            <div>
              <label className="label-xs">Gender</label>
              <select name="gender" value={form.gender} onChange={onChange} className="input-luxury">
                {['all','men','women','unisex'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Description</label>
              <input type="text" name="description" value={form.description} onChange={onChange} className="input-luxury" />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-gold" />
                <span className="text-sm text-gray-luxury font-sans">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-gold text-xs py-2"><Check size={12} /> SAVE</button>
            <button onClick={() => setEditing(null)} className="btn-outline-gold text-xs py-2"><X size={12} /> CANCEL</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-black-surface border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Name', 'Slug', 'Gender', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-mid font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? null : cats.map(cat => (
              <tr key={cat._id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 text-white font-sans font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{cat.slug}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans capitalize">{cat.gender}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 font-sans ${cat.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-mid hover:text-gold"><Edit2 size={12} /></button>
                  <button onClick={() => setDeleteId(cat._id)} className="p-1.5 text-gray-mid hover:text-red-400"><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Category" message="This will delete the category and may affect products under it."
        confirmText="DELETE" confirmClass="bg-red-500 text-white text-xs font-bold flex-1 py-2.5"
      />
    </div>
  )
}
