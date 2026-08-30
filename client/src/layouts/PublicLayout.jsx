import { Outlet } from 'react-router-dom'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import SearchOverlay from '../components/layout/SearchOverlay'
import CartDrawer from '../components/layout/CartDrawer'
import BackToTop from '../components/ui/BackToTop'

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f6f0] text-gray-900">
      <AnnouncementBar />
      <Navbar />
      <SearchOverlay />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
