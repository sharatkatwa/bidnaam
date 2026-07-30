import { createBrowserRouter } from 'react-router'
import MainLayout from '../shared/layout/MainLayout.jsx'
import LoginPage from '../features/auth/ui/LoginPage.jsx'
import RegisterPage from '../features/auth/ui/RegisterPage.jsx'
import ProfilePage from '../features/profile/ui/ProfilePage.jsx'
import DashboardPage from '../features/dashboard/ui/DashboardPage.jsx'
import AuctionCreatePage from '../features/auction-create/ui/AuctionCreatePage.jsx'
import AuctionDiscoveryPage from '../features/auction-discovery/ui/AuctionDiscoveryPage.jsx'
import AuctionDetailsPage from '../features/auction-discovery/ui/AuctionDetailsPage.jsx'
import AuctionRoomPage from '../features/auction-room/ui/AuctionRoomPage.jsx'
import SpectatorPage from '../features/spectator/ui/SpectatorPage.jsx'
import NotFoundPage from '../shared/components/NotFoundPage.jsx'
import ProtectedRoute from '../shared/layout/ProtectedRoute.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <AuctionDiscoveryPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'auction/:id', element: <AuctionDetailsPage /> },
      { path: 'auction/:id/spectate', element: <SpectatorPage /> },
      // TODO: dashboard is temporarily public for UI preview — move back under ProtectedRoute before submission
      { path: 'dashboard', element: <DashboardPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'auction/create', element: <AuctionCreatePage /> },
          { path: 'auction/:id/room', element: <AuctionRoomPage /> },
        ],
      },
    ],
  },
])
