import { useState, useEffect } from 'react'
import { Save, RefreshCw, Eye, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { contentService } from '../../services/contentService'

const SECTION_DEFAULTS = [
  { key: 'hero', name: 'Hero Section', hasImage: true },
  { key: 'featured_collection', name: 'Featured Signature Collection', hasImage: true },
  { key: 'men_women_banner', name: 'His & Her (Split Banner)', hasImage: true, hasSecondaryImage: true },
  { key: 'watches', name: 'Watches Feature Section', hasImage: true },
  { key: 'perfumes', name: 'Perfume Art Section', hasImage: true },
  { key: 'sale_banner', name: 'Promotional Sale Banner', hasImage: true },
  { key: 'newsletter', name: 'Newsletter Callout', hasImage: false },
]

export default function Content() {
  const [sections, setSections] = useState({})
  const [loading, setLoading]   = useState(true)
  const [activeKey, setActiveKey] = useState('hero')
  const [saving, setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await contentService.getHomepageSectionsAdmin()
      const list = res.data.sections || []
      const map = {}
      list.forEach(s => {
        map[s.sectionKey] = s
      })
      setSections(map)
    } catch (_) {
      toast.error('Failed to load homepage content.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const current = sections[activeKey] || {
    sectionKey: activeKey,
    title: '',
    subtitle: '',
    ctaText: '',
    ctaUrl: '',
    image: { url: '' },
    secondaryImage: { url: '' },
    isActive: true,
  }

  const updateCurrentField = (field, value) => {
    setSections(prev => ({
      ...prev,
      [activeKey]: {
        ...current,
        [field]: value,
      }
    }))
  }

  const updateImageField = (imgKey, url) => {
    setSections(prev => ({
      ...prev,
      [activeKey]: {
        ...current,
        [imgKey]: { ...(current[imgKey] || {}), url },
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await contentService.updateSection(activeKey, current)
      toast.success(`${SECTION_DEFAULTS.find(s => s.key === activeKey)?.name || activeKey} updated!`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update section.')
    } finally {
      setSaving(false)
    }
  }

  const activeMeta = SECTION_DEFAULTS.find(s => s.key === activeKey) || { name: activeKey }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Homepage CMS</h1>
          <p className="text-gray-mid text-sm font-sans">Customize headings, text, buttons and images for each storefront section.</p>
        </div>
        <button
          onClick={load}
          className="btn-outline-gold text-xs py-2 flex items-center gap-2"
        >
          <RefreshCw size={13} /> REFRESH
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Section Selector */}
        <div className="lg:col-span-1 bg-black-surface border border-white/5 p-3 space-y-1">
          <p className="text-[10px] text-gray-mid tracking-widest uppercase font-sans font-bold px-3 py-2">
            Sections
          </p>
          {SECTION_DEFAULTS.map(sec => (
            <button
              key={sec.key}
              onClick={() => setActiveKey(sec.key)}
              className={`w-full text-left px-3 py-2.5 text-xs font-sans rounded transition-all flex items-center justify-between ${
                activeKey === sec.key
                  ? 'bg-gold/10 text-gold font-bold border-l-2 border-gold'
                  : 'text-gray-luxury hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{sec.name}</span>
              {sections[sec.key]?.isActive !== false ? (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              )}
            </button>
          ))}
        </div>

        {/* Editor Form */}
        <div className="lg:col-span-3 bg-black-surface border border-white/5 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-serif text-xl font-bold text-white">{activeMeta.name}</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={current.isActive !== false}
                onChange={e => updateCurrentField('isActive', e.target.checked)}
                className="accent-gold w-4 h-4"
              />
              <span className="text-xs font-sans text-white uppercase tracking-wider">Section Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label-xs">Main Title / Headline</label>
              <textarea
                value={current.title || ''}
                onChange={e => updateCurrentField('title', e.target.value)}
                rows={2}
                placeholder="Section headline"
                className="input-luxury resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label-xs">Subtitle / Narrative</label>
              <textarea
                value={current.subtitle || ''}
                onChange={e => updateCurrentField('subtitle', e.target.value)}
                rows={3}
                placeholder="Descriptive copy for this section"
                className="input-luxury resize-none"
              />
            </div>

            <div>
              <label className="label-xs">Primary CTA Button Label</label>
              <input
                type="text"
                value={current.ctaText || ''}
                onChange={e => updateCurrentField('ctaText', e.target.value)}
                placeholder="e.g. DISCOVER COLLECTION"
                className="input-luxury"
              />
            </div>

            <div>
              <label className="label-xs">Primary CTA URL</label>
              <input
                type="text"
                value={current.ctaUrl || ''}
                onChange={e => updateCurrentField('ctaUrl', e.target.value)}
                placeholder="/category/watches"
                className="input-luxury"
              />
            </div>

            {activeMeta.hasImage && (
              <div className="md:col-span-2 space-y-2">
                <label className="label-xs">Main Image URL</label>
                <input
                  type="text"
                  value={current.image?.url || ''}
                  onChange={e => updateImageField('image', e.target.value)}
                  placeholder="https://..."
                  className="input-luxury"
                />
                {current.image?.url && (
                  <div className="w-full h-40 bg-black-card border border-white/10 overflow-hidden mt-2">
                    <img src={current.image.url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {activeMeta.hasSecondaryImage && (
              <div className="md:col-span-2 space-y-2">
                <label className="label-xs">Secondary Image URL (Men's Panel)</label>
                <input
                  type="text"
                  value={current.secondaryImage?.url || ''}
                  onChange={e => updateImageField('secondaryImage', e.target.value)}
                  placeholder="https://..."
                  className="input-luxury"
                />
                {current.secondaryImage?.url && (
                  <div className="w-full h-40 bg-black-card border border-white/10 overflow-hidden mt-2">
                    <img src={current.secondaryImage.url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-gold text-xs py-2.5 px-6 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={14} />
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
