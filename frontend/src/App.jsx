import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboardPage, {
  UserBookingsPage,
  UserNotificationsPage,
  UserTicketsPage
} from './pages/UserDashboardPage'
import UserLayout from './pages/UserLayout'

function roleHome(role) {
  return role === 'ADMIN' ? '/admin' : '/user'
}

function ProtectedRoute({ allowedRoles, children }) {
  const { token, user, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <div className="empty-state">Checking session...</div>
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { token, user, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <div className="empty-state">Checking session...</div>
  }

  if (token && user) {
    return <Navigate to={roleHome(user.role)} replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route
        path="/user"
        element={<ProtectedRoute allowedRoles={['USER']}><UserLayout /></ProtectedRoute>}
      >
        <Route index element={<UserDashboardPage />} />
        <Route path="my-bookings" element={<UserBookingsPage />} />
        <Route path="my-tickets" element={<UserTicketsPage />} />
        <Route path="my-notifications" element={<UserNotificationsPage />} />
      </Route>
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>}
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function RoleRedirect() {
  const { user } = useAuth()
  return <Navigate to={roleHome(user?.role)} replace />
}
