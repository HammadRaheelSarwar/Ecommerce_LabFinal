import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { productService } from '../../../services/productService'
import { categoryService } from '../../../services/categoryService'
import { uploadService } from '../../../services/contentService'

const EMPTY_VARIANT = { sku: '', size: '', color: '', stock: 0, price: 0, salePrice: 0, lowStockAlert: 5 }

const EMPTY_PRODUCT = {
  name: '', sku: '', description: '', shortDescription: '', brand: '',
  category: '', subcategory: '', gender: 'unisex', material: '', tags: '',
  basePrice: '', salePrice: '', discountPercentage: 0,
  isNewArrival: false, isBestSeller: false, isFeatured: false, isOnSale: false, isActive: true,
  variants: [{ ...EMPTY_VARIANT }],
  images: [],
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(!isNew)
  const [saving, setSaving]         = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    categoryService.getAll().then(r => setCategories(r.data.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isNew) {
      productService.getById(id)
        .then(r => {
          const p = r.data.product
          setForm({ ...EMPTY_PRODUCT, ...p, tags: p.tags?.join(', ') || '', category: p.category?._id || p.category || '' })
        })
        .catch(() => toast.error('Product not found.'))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  const onChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const res = await uploadService.upload(file)
      setForm(f => ({
        ...f,
        images: [...f.images, { url: res.data.url, cloudinaryId: res.data.cloudinaryId, isMain: f.images.length === 0 }],
      }))
    } catch (_) { toast.error('Image upload failed.') }
    finally { setUploadingImage(false) }
  }

  const removeImage = (idx) => {
    setForm(f => {
      const images = f.images.filter((_, i) => i !== idx)
      if (images.length > 0 && !images.some(i => i.isMain)) images[0].isMain = true
      return { ...f, images }
    })
  }

  const setMainImage = (idx) => {
    setForm(f => ({
      ...f,
      images: f.images.map((img, i) => ({ ...img, isMain: i === idx })),
    }))
  }

  const updateVariant = (idx, field, value) => {
    setForm(f => {
      const variants = [...f.variants]
      variants[idx] = { ...variants[idx], [field]: value }
      return { ...f, variants }
    })
  }

  const addVariant   = () => setForm(f => ({ ...f, variants: [...f.variants, { ...EMPTY_VARIANT }] }))
  const removeVariant= (idx) => setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.basePrice || !form.category) {
      toast.error('Name, base price and category are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        basePrice: Number(form.basePrice),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        discountPercentage: form.salePrice && form.basePrice
          ? Math.round((1 - Number(form.salePrice) / Number(form.basePrice)) * 100)
          : 0,
        variants: form.variants.map(v => ({
          ...v, stock: Number(v.stock), price: Number(v.price || 0), salePrice: Number(v.salePrice || 0),
        })),
      }

      if (isNew) await productService.create(payload)
      else await productService.update(id, payload)

      toast.success(isNew ? 'Product created!' : 'Product updated!')
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const selectedCategory = categories.find(c => c._id === form.category)
  const subcategories = selectedCategory?.subcategories || []

  if (loading) return <div className="h-64 skeleton" />

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/admin/products')} className="text-gray-mid hover:text-gold">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-2xl font-bold text-white">
          {isNew ? 'Add New Product' : 'Edit Product'}
        </h1>
      </div>

      {/* Basic Info */}
      <AdminSection title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label-xs">Product Name *</label>
            <input type="text" name="name" value={form.name} onChange={onChange} required className="input-luxury" />
          </div>
          <div>
            <label className="label-xs">SKU</label>
            <input type="text" name="sku" value={form.sku} onChange={onChange} className="input-luxury" />
          </div>
          <div>
            <label className="label-xs">Brand</label>
            <input type="text" name="brand" value={form.brand} onChange={onChange} className="input-luxury" />
          </div>
          <div>
            <label className="label-xs">Category *</label>
            <select name="category" value={form.category} onChange={onChange} required className="input-luxury">
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-xs">Subcategory</label>
            <select name="subcategory" value={form.subcategory} onChange={onChange} className="input-luxury">
              <option value="">Select subcategory</option>
              {subcategories.map(s => <option key={s.slug} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-xs">Gender</label>
            <select name="gender" value={form.gender} onChange={onChange} className="input-luxury">
              {['men', 'women', 'unisex'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label-xs">Material</label>
            <input type="text" name="material" value={form.material} onChange={onChange} className="input-luxury" />
          </div>
          <div className="md:col-span-2">
            <label className="label-xs">Short Description</label>
            <input type="text" name="shortDescription" value={form.shortDescription} onChange={onChange} className="input-luxury" />
          </div>
          <div className="md:col-span-2">
            <label className="label-xs">Full Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={4} className="input-luxury resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="label-xs">Tags (comma separated)</label>
            <input type="text" name="tags" value={form.tags} onChange={onChange} placeholder="dress, women, floral" className="input-luxury" />
          </div>
        </div>
      </AdminSection>

      {/* Pricing */}
      <AdminSection title="Pricing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-xs">Base Price (Rs.) *</label>
            <input type="number" name="basePrice" value={form.basePrice} onChange={onChange} required min={0} className="input-luxury" />
          </div>
          <div>
            <label className="label-xs">Sale Price (Rs.)</label>
            <input type="number" name="salePrice" value={form.salePrice} onChange={onChange} min={0} className="input-luxury" />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="label-xs">Discount %</label>
              <input type="number" name="discountPercentage" value={form.discountPercentage} onChange={onChange} min={0} max={100} className="input-luxury" />
            </div>
          </div>
        </div>
      </AdminSection>

      {/* Flags */}
      <AdminSection title="Visibility & Labels">
        <div className="flex flex-wrap gap-6">
          {[
            { name: 'isActive',      label: 'Active' },
            { name: 'isNewArrival',  label: 'New Arrival' },
            { name: 'isBestSeller',  label: 'Best Seller' },
            { name: 'isFeatured',    label: 'Featured' },
            { name: 'isOnSale',      label: 'On Sale' },
          ].map(f => (
            <label key={f.name} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name={f.name} checked={!!form[f.name]} onChange={onChange} className="accent-gold w-4 h-4" />
              <span className="text-sm text-gray-luxury font-sans">{f.label}</span>
            </label>
          ))}
        </div>
      </AdminSection>

      {/* Images */}
      <AdminSection title="Product Images">
        <div className="flex flex-wrap gap-3 mb-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative group w-24 h-28">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <button type="button" onClick={() => setMainImage(i)}
                  className={`text-[10px] font-bold px-2 py-1 ${img.isMain ? 'bg-gold text-black' : 'bg-white/20 text-white'}`}>
                  {img.isMain ? 'MAIN' : 'SET MAIN'}
                </button>
                <button type="button" onClick={() => removeImage(i)} className="text-red-400 text-[10px]">REMOVE</button>
              </div>
              {img.isMain && <span className="absolute top-1 left-1 bg-gold text-black text-[8px] font-bold px-1">MAIN</span>}
            </div>
          ))}
          <label className={`w-24 h-28 border border-dashed border-white/20 hover:border-gold/50 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
            <Plus size={20} className="text-gold/50" />
            <span className="text-[10px] text-gray-mid mt-1 font-sans">{uploadingImage ? 'Uploading...' : 'Add Image'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </AdminSection>

      {/* Variants */}
      <AdminSection title="Variants (Size / Color / Stock)">
        <div className="space-y-3">
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-7 gap-2 items-end p-3 border border-white/5">
              {[
                { label: 'Size',          field: 'size',          type: 'text',   w: '1' },
                { label: 'Color',         field: 'color',         type: 'text',   w: '1' },
                { label: 'Stock',         field: 'stock',         type: 'number', w: '1' },
                { label: 'Price (opt)',   field: 'price',         type: 'number', w: '1' },
                { label: 'Sale (opt)',    field: 'salePrice',     type: 'number', w: '1' },
                { label: 'SKU',           field: 'sku',           type: 'text',   w: '1' },
              ].map(f => (
                <div key={f.field}>
                  {i === 0 && <label className="label-xs">{f.label}</label>}
                  <input
                    type={f.type}
                    value={v[f.field]}
                    onChange={e => updateVariant(i, f.field, e.target.value)}
                    className="input-luxury text-xs py-2"
                    min={f.type === 'number' ? 0 : undefined}
                    placeholder={f.label}
                  />
                </div>
              ))}
              <div>
                {i === 0 && <p className="label-xs opacity-0">Del</p>}
                <button type="button" onClick={() => removeVariant(i)}
                  disabled={form.variants.length === 1}
                  className="p-2 text-red-400/60 hover:text-red-400 disabled:opacity-20 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addVariant} className="btn-outline-gold text-xs py-2">
            <Plus size={12} /> ADD VARIANT
          </button>
        </div>
      </AdminSection>

      {/* Submit */}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
          {saving ? 'SAVING...' : isNew ? 'CREATE PRODUCT' : 'SAVE CHANGES'}
        </button>
        <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline-gold text-xs">
          CANCEL
        </button>
      </div>
    </form>
  )
}

function AdminSection({ title, children }) {
  return (
    <div className="bg-black-surface border border-white/5 p-6">
      <h3 className="font-sans font-bold text-white text-xs tracking-widest uppercase mb-5 pb-3 border-b border-white/5">{title}</h3>
      {children}
    </div>
  )
}
