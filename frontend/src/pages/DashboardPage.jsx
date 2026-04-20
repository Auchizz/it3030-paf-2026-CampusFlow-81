import { Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import ResourcesPage from './ResourcesPage'
import BookingsPage from './BookingsPage'
import TicketsPage from './TicketsPage'
import NotificationsPage from './NotificationsPage'

export default function DashboardPage() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
    </Routes>
  )
}
