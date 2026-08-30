import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { contentService } from '../../services/contentService'

const DEFAULT_SETTINGS = {
  storeName: 'All Available',
  tagline: 'Everything You Desire, All Available',
  contactEmail: 'contact@allavailable.com',
  contactPhone: '+92 300 0000000',
  address: 'Gulberg III, Lahore, Pakistan',
  shippingCost: 200,
  freeShippingThreshold: 5000,
  announcementBar: {
    isActive: true,
    messages: [
      'Free Delivery on Orders Above Rs. 5,000',
      'New Collection Has Arrived',
      'Premium Fashion. Exceptional Style.'
    ],
  },
  socialLinks: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    whatsapp: '+923000000000',
  },
}

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await contentService.getSettings()
      if (res.data.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...res.data.settings })
      }
    } catch (_) {
      toast.error('Failed to load settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const onSocialChange = (key, val) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...(prev.socialLinks || {}), [key]: val },
    }))
  }

  const addAnnouncement = () => {
    if (!newMessage.trim()) return
    const msgs = [...(settings.announcementBar?.messages || []), newMessage.trim()]
    setSettings(prev => ({
      ...prev,
      announcementBar: { ...(prev.announcementBar || {}), messages: msgs },
    }))
    setNewMessage('')
  }

  const removeAnnouncement = (index) => {
    const msgs = (settings.announcementBar?.messages || []).filter((_, i) => i !== index)
    setSettings(prev => ({
      ...prev,
      announcementBar: { ...(prev.announcementBar || {}), messages: msgs },
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await contentService.updateSettings(settings)
      toast.success('Settings updated successfully!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-64 skeleton" />

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Store Settings</h1>
          <p className="text-gray-mid text-sm font-sans">Global e-commerce configurations, shipping thresholds, announcement bar, and contact details.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-gold text-xs py-2 px-6 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </button>
      </div>

      {/* General Store Details */}
      <div className="bg-black-surface border border-white/5 p-6 space-y-4">
        <h2 className="font-sans font-bold text-white text-xs tracking-widest uppercase pb-3 border-b border-white/5">
          General Brand Identity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Store Name</label>
            <input
              type="text"
              value={settings.storeName || ''}
              onChange={e => onChange('storeName', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="label-xs">Brand Tagline</label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={e => onChange('tagline', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="label-xs">Customer Support Email</label>
            <input
              type="email"
              value={settings.contactEmail || ''}
              onChange={e => onChange('contactEmail', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="label-xs">Support Phone / Hotline</label>
            <input
              type="text"
              value={settings.contactPhone || ''}
              onChange={e => onChange('contactPhone', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-xs">Store / Office Address</label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={e => onChange('address', e.target.value)}
              className="input-luxury"
            />
          </div>
        </div>
      </div>

      {/* Shipping & Checkout Rules */}
      <div className="bg-black-surface border border-white/5 p-6 space-y-4">
        <h2 className="font-sans font-bold text-white text-xs tracking-widest uppercase pb-3 border-b border-white/5">
          Shipping & Logistics Rules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Standard Flat Shipping Fee (Rs.)</label>
            <input
              type="number"
              min={0}
              value={settings.shippingCost ?? 200}
              onChange={e => onChange('shippingCost', Number(e.target.value))}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="label-xs">Free Shipping Order Threshold (Rs.)</label>
            <input
              type="number"
              min={0}
              value={settings.freeShippingThreshold ?? 5000}
              onChange={e => onChange('freeShippingThreshold', Number(e.target.value))}
              className="input-luxury"
            />
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-black-surface border border-white/5 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h2 className="font-sans font-bold text-white text-xs tracking-widest uppercase">
            Top Announcement Bar
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.announcementBar?.isActive !== false}
              onChange={e => setSettings(prev => ({
                ...prev,
                announcementBar: { ...(prev.announcementBar || {}), isActive: e.target.checked }
              }))}
              className="accent-gold w-4 h-4"
            />
            <span className="text-xs font-sans text-white uppercase">Active</span>
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="e.g. Free delivery on orders over Rs. 5,000"
              className="input-luxury flex-1 text-xs"
            />
            <button
              type="button"
              onClick={addAnnouncement}
              className="btn-outline-gold text-xs px-3 py-2 flex items-center gap-1 flex-shrink-0"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {(settings.announcementBar?.messages || []).map((msg, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-black-card border border-white/5">
                <span className="text-xs text-white font-sans">{msg}</span>
                <button
                  type="button"
                  onClick={() => removeAnnouncement(i)}
                  className="text-gray-mid hover:text-red-400 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-black-surface border border-white/5 p-6 space-y-4">
        <h2 className="font-sans font-bold text-white text-xs tracking-widest uppercase pb-3 border-b border-white/5">
          Social Links & WhatsApp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-xs">Instagram URL</label>
            <input
              type="text"
              value={settings.socialLinks?.instagram || ''}
              onChange={e => onSocialChange('instagram', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="label-xs">Facebook URL</label>
            <input
              type="text"
              value={settings.socialLinks?.facebook || ''}
              onChange={e => onSocialChange('facebook', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="label-xs">WhatsApp Hotline</label>
            <input
              type="text"
              value={settings.socialLinks?.whatsapp || ''}
              onChange={e => onSocialChange('whatsapp', e.target.value)}
              className="input-luxury"
            />
          </div>
        </div>
      </div>
    </form>
  )
}
