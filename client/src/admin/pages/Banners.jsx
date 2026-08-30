import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { bannerService, uploadService } from '../../services/contentService'
import Modal from '../../components/ui/Modal'

const LOCATIONS = ['hero', 'women', 'men', 'watches', 'perfumes', 'jewelry', 'sale', 'popup']

const EMPTY_BANNER = {
  title: '',
  subtitle: '',
  location: 'hero',
  linkUrl: '',
  ctaText: 'SHOP NOW',
  imageUrl: '',
  order: 0,
  isActive: true,
}

export default function Banners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | id
  const [form, setForm] = useState(EMPTY_BANNER)
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await bannerService.getAllAdmin()
      setBanners(res.data.banners || [])
    } catch (_) {
      toast.error('Failed to load banners.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadService.upload(file)
      setForm(f => ({ ...f, imageUrl: res.data.url }))
      toast.success('Image uploaded!')
    } catch (_) {
      toast.error('Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.imageUrl) {
      toast.error('Banner image is required.')
      return
    }
    try {
      if (editing === 'new') {
        await bannerService.create(form)
        toast.success('Banner created!')
      } else {
        await bannerService.update(editing, form)
        toast.success('Banner updated!')
      }
      setEditing(null)
      setForm(EMPTY_BANNER)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner.')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await bannerService.delete(deleteId)
      toast.success('Banner deleted.')
      setDeleteId(null)
      load()
    } catch (_) {
      toast.error('Failed to delete banner.')
    } finally {
      setDeleting(false)
    }
  }

  const startEdit = (banner) => {
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      location: banner.location || 'hero',
      linkUrl: banner.linkUrl || '',
      ctaText: banner.ctaText || 'SHOP NOW',
      imageUrl: banner.image?.url || banner.imageUrl || '',
      order: banner.order || 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    })
    setEditing(banner._id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Banners & Promotions</h1>
          <p className="text-gray-mid text-sm font-sans">Manage promotional visual banners across store sections.</p>
        </div>
        <button
          onClick={() => { setEditing('new'); setForm(EMPTY_BANNER) }}
          className="btn-gold text-xs py-2"
        >
          <Plus size={13} /> ADD BANNER
        </button>
      </div>

      {/* Form Drawer / Box */}
      {editing && (
        <form onSubmit={handleSave} className="bg-black-surface border border-gold/20 p-6 space-y-4 max-w-2xl">
          <h3 className="text-xs font-sans font-bold text-gold tracking-widest uppercase">
            {editing === 'new' ? 'Create New Banner' : 'Edit Banner'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-xs">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="e.g. Summer Collection"
                className="input-luxury"
              />
            </div>
            <div>
              <label className="label-xs">Location</label>
              <select name="location" value={form.location} onChange={onChange} className="input-luxury uppercase text-xs">
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label-xs">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={onChange}
                placeholder="e.g. Discover luxury designs"
                className="input-luxury"
              />
            </div>
            <div>
              <label className="label-xs">Link Destination URL</label>
              <input
                type="text"
                name="linkUrl"
                value={form.linkUrl}
                onChange={onChange}
                placeholder="/shop?category=women"
                className="input-luxury"
              />
            </div>
            <div>
              <label className="label-xs">Button CTA Text</label>
              <input
                type="text"
                name="ctaText"
                value={form.ctaText}
                onChange={onChange}
                placeholder="SHOP NOW"
                className="input-luxury"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-xs">Banner Image URL or Upload *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={onChange}
                  placeholder="https://..."
                  className="input-luxury flex-1"
                  required
                />
                <label className={`btn-outline-gold text-xs px-3 py-2 cursor-pointer flex items-center gap-1 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <ImageIcon size={14} />
                  <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {form.imageUrl && (
                <div className="mt-3 w-full h-32 bg-black-card overflow-hidden border border-white/10">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="label-xs">Sort Order</label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={onChange}
                className="input-luxury"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={onChange}
                  className="accent-gold w-4 h-4"
                />
                <span className="text-sm font-sans text-white">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-gold text-xs py-2">
              <Check size={13} /> {editing === 'new' ? 'CREATE BANNER' : 'SAVE CHANGES'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline-gold text-xs py-2">
              <X size={13} /> CANCEL
            </button>
          </div>
        </form>
      )}

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-48 skeleton rounded-none" />
          ))
        ) : banners.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-black-surface border border-white/5">
            <ImageIcon size={36} className="text-gold/20 mx-auto mb-3" />
            <p className="font-serif text-lg text-white/50 mb-2">No banners configured</p>
            <p className="text-gray-mid text-sm font-sans">Create your first banner to customize the look of the store.</p>
          </div>
        ) : (
          banners.map(b => (
            <div key={b._id} className="bg-black-surface border border-white/5 group hover:border-gold/20 transition-all overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-black-card">
                {b.image?.url || b.imageUrl ? (
                  <img src={b.image?.url || b.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-mid">No Image</div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur text-gold text-[10px] font-sans font-bold uppercase tracking-wider">
                  {b.location}
                </span>
                <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-sans font-bold uppercase ${
                  b.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-white mb-1 truncate">{b.title || 'Untitled Banner'}</h3>
                  <p className="text-gray-mid text-xs font-sans truncate mb-3">{b.subtitle || b.linkUrl || '—'}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-xs text-gray-mid font-sans">Order: {b.order}</span>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(b)} className="p-1.5 text-gray-mid hover:text-gold transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(b._id)} className="p-1.5 text-gray-mid hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Banner"
        message="Are you sure you want to delete this promotional banner?"
        confirmText="DELETE"
        confirmClass="bg-red-500 text-white text-xs font-bold flex-1 py-2.5"
      />
    </div>
  )
}
