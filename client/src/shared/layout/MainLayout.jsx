import { Outlet } from 'react-router'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import AuroraBackground from '../components/AuroraBackground.jsx'
import CustomCursor from '../components/CustomCursor.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'

export default function MainLayout() {
  return (
    <div className="relative min-h-screen flex flex-col text-white">
      <ScrollToTop />
      <AuroraBackground />
      <CustomCursor />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
