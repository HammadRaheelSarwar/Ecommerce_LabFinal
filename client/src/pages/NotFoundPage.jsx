import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className="font-serif text-[10rem] font-bold text-gold/10 leading-none select-none">404</p>
        <h1 className="font-serif text-4xl font-bold text-white -mt-8 mb-4">Page Not Found</h1>
        <p className="text-gray-mid font-sans text-sm mb-10 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-gold text-xs">
            <Home size={14} />
            GO HOME
          </Link>
          <Link to="/shop" className="btn-outline-gold text-xs">
            BROWSE SHOP <ArrowLeft size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
