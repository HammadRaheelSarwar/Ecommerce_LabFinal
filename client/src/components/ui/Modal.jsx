import { AnimatePresence, motion } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'

export default function Modal({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmClass = 'btn-gold', loading = false, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="bg-black-surface border border-gold/20 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="font-sans font-semibold text-white text-base">{title}</h3>
              <button onClick={onClose} className="text-gray-mid hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {message && (
                <div className="flex gap-3 mb-5">
                  <AlertTriangle size={20} className="text-gold flex-shrink-0 mt-0.5" />
                  <p className="text-gray-luxury text-sm font-sans leading-relaxed">{message}</p>
                </div>
              )}
              {children}
            </div>

            {onConfirm && (
              <div className="flex gap-3 px-5 pb-5">
                <button onClick={onClose} className="btn-outline-gold flex-1 py-2.5 text-xs">
                  CANCEL
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`${confirmClass} flex-1 py-2.5 text-xs disabled:opacity-60`}
                >
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
