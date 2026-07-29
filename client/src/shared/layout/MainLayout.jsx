import { Outlet } from 'react-router'
import Navbar from './Navbar.jsx'
import AuroraBackground from '../components/AuroraBackground.jsx'
import CustomCursor from '../components/CustomCursor.jsx'

export default function MainLayout() {
  return (
    <div className="relative min-h-screen text-white">
      <AuroraBackground />
      <CustomCursor />
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
