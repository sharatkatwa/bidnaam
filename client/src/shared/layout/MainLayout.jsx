import { Outlet } from 'react-router'

export default function MainLayout() {
  return (
    <div>
      {/* Navbar yahan aayega */}
      <main>
        <Outlet />
      </main>
      {/* Footer yahan aayega */}
    </div>
  )
}
