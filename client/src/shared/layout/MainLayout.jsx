import { Outlet } from 'react-router'
import Navbar from './Navbar.jsx'
import AuroraBackground from '../components/AuroraBackground.jsx'

export default function MainLayout() {
  return (
    <div className="relative min-h-screen text-white">
      <AuroraBackground />
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
