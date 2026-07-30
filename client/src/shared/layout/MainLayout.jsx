import { Outlet } from 'react-router'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import AppBackground from '../components/AppBackground.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'

export default function MainLayout() {
  return (
    <div className="relative min-h-screen flex flex-col text-ink">
      <ScrollToTop />
      <AppBackground />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
