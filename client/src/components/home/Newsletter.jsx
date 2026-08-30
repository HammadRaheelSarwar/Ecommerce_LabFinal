import { useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { newsletterService } from '../../services/contentService'

export default function Newsletter({ data }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    try {
      setLoading(true)
      await newsletterService.subscribe(email)
      toast.success('Welcome to All Available!')
      setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-10">
      <div className="container-markaz">
        <div className="bg-gradient-to-r from-[#0c5a37] to-[#083d24] rounded-2xl p-8 sm:p-12 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#00b884] mb-3">
              <Mail size={20} />
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-white mb-2">
              {data?.title || 'Never Miss a Price Drop or New Arrival'}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm font-sans">
              {data?.subtitle || 'Subscribe to get exclusive discounts, festive deals and weekly curated catalogs.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2.5 max-w-md">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="bg-white text-gray-800 placeholder-gray-400 px-4 py-3 rounded-full text-xs font-sans outline-none focus:ring-2 focus:ring-[#00b884] flex-1 sm:w-72"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-mint px-6 py-3 text-xs tracking-wider uppercase flex-shrink-0 disabled:opacity-60"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
