import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { reviewService } from '../../../services/contentService'

export default function ReviewList() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('pending')

  const load = () => {
    setLoading(true)
    reviewService.getAll({ status })
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [status])

  const handleApprove = async (id) => {
    await reviewService.approve(id)
    toast.success('Review approved.')
    load()
  }

  const handleReject = async (id) => {
    await reviewService.reject(id)
    toast.success('Review rejected.')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-white">Reviews</h1>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-sans capitalize border transition-all ${
                status === s ? 'border-gold text-gold' : 'border-white/10 text-gray-mid hover:border-gold/30'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? <div className="h-32 skeleton" />
        : reviews.length === 0 ? (
          <p className="text-gray-mid font-sans text-sm text-center py-10">No {status} reviews.</p>
        ) : reviews.map(r => (
          <div key={r._id} className="bg-black-surface border border-white/5 p-5 flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-white font-sans font-semibold text-sm">{r.name}</span>
                <span className="text-gold text-xs font-sans">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className="text-gray-mid text-xs font-sans">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gold/60 text-xs font-sans mb-1">Product: {r.product?.name || r.productId}</p>
              <p className="text-gray-luxury text-sm font-sans">{r.comment}</p>
            </div>
            {status === 'pending' && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleApprove(r._id)} className="p-2 text-green-400 hover:text-green-300 border border-green-400/20 hover:border-green-400/50 transition-colors">
                  <Check size={14} />
                </button>
                <button onClick={() => handleReject(r._id)} className="p-2 text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/50 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
