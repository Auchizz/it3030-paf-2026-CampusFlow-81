import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../lib/api'

function createSectionState() {
  return {
    data: [],
    isLoading: true,
    error: ''
  }
}

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Unable to load this section.'
}

function normalizeList(value) {
  return Array.isArray(value) ? value : []
}

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(`${String(value).slice(0, 10)}T00:00:00`))
}

function formatDateTime(value) {
  if (!value) return 'No update recorded'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : '--:--'
}

function getBookingBadge(status) {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'danger'
  return 'warning'
}

function getTicketBadge(status) {
  if (status === 'RESOLVED' || status === 'CLOSED') return 'success'
  if (status === 'REJECTED') return 'danger'
  return 'warning'
}

function getTicketTitle(ticket) {
  return ticket.title || `${ticket.category || 'Campus'} ticket`
}

function getTicketUpdate(ticket) {
  if (ticket.rejectionReason) return `Rejected: ${ticket.rejectionReason}`
  if (ticket.resolutionNotes) return `Resolved: ${ticket.resolutionNotes}`
  return `Latest update: ${formatDateTime(ticket.updatedAt || ticket.createdAt)}`
}

function isNotificationRead(notification) {
  return Boolean(notification?.read || notification?.isRead)
}

function SectionContent({ state, emptyMessage, children }) {
  if (state.isLoading) {
    return <div className="empty-state">Loading...</div>
  }

  if (state.error) {
    return <div className="error-box">{state.error}</div>
  }

  if (!state.data.length) {
    return <div className="empty-state">{emptyMessage}</div>
  }

  return children
}

function useUserSection(endpoint) {
  const [state, setState] = useState(() => createSectionState())

  useEffect(() => {
    let ignore = false

    const loadSection = async () => {
      setState((currentState) => ({ ...currentState, isLoading: true, error: '' }))

      try {
        const response = await api.get(endpoint)

        if (!ignore) {
          setState({
            data: normalizeList(response.data.data),
            isLoading: false,
            error: ''
          })
        }
      } catch (error) {
        if (!ignore) {
          setState({
            data: [],
            isLoading: false,
            error: getErrorMessage(error)
          })
        }
      }
    }

    loadSection()

    return () => {
      ignore = true
    }
  }, [endpoint])

  return state
}

function BookingsSection({ state, wide = false }) {
  return (
    <section className={`panel ${wide ? 'dashboard-panel-wide' : ''}`}>
      <div className="panel-heading">
        <div>
          <h3>My Bookings</h3>
          <p>Your booking requests and decisions.</p>
        </div>
        <div className="panel-chip">{state.data.length}</div>
      </div>
      <div className="compact-list">
        <SectionContent state={state} emptyMessage="No bookings yet.">
          {state.data.map((booking) => (
            <div key={booking.id} className="compact-item">
              <div>
                <strong>{booking.resource?.name || 'Resource'}</strong>
                <p>{formatDate(booking.bookingDate)} - {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                <p>{booking.purpose || 'No purpose provided'}</p>
              </div>
              <span className={`badge ${getBookingBadge(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          ))}
        </SectionContent>
      </div>
    </section>
  )
}

function TicketsSection({ state, wide = false }) {
  return (
    <section className={`panel ${wide ? 'dashboard-panel-wide' : ''}`}>
      <div className="panel-heading">
        <div>
          <h3>My Tickets</h3>
          <p>Incidents and maintenance requests submitted by you.</p>
        </div>
        <div className="panel-chip">{state.data.length}</div>
      </div>
      <div className="compact-list">
        <SectionContent state={state} emptyMessage="No tickets yet.">
          {state.data.map((ticket) => (
            <div key={ticket.id} className="compact-item">
              <div>
                <strong>{getTicketTitle(ticket)}</strong>
                <p>{ticket.category || 'Uncategorized'} - {ticket.priority || 'Priority not set'}</p>
                <p>{getTicketUpdate(ticket)}</p>
              </div>
              <span className={`badge ${getTicketBadge(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
          ))}
        </SectionContent>
      </div>
    </section>
  )
}

function NotificationsSection({ state, wide = false }) {
  const unreadCount = state.data.filter((notification) => !isNotificationRead(notification)).length

  return (
    <section className={`panel ${wide ? 'dashboard-panel-wide' : ''}`}>
      <div className="panel-heading">
        <div>
          <h3>My Notifications</h3>
          <p>Messages sent to you and general campus alerts.</p>
        </div>
        <div className="panel-chip">{unreadCount} unread</div>
      </div>
      <div className="compact-list">
        <SectionContent state={state} emptyMessage="No notifications yet.">
          {state.data.map((notification) => {
            const read = isNotificationRead(notification)

            return (
              <div key={notification.id} className="compact-item">
                <div>
                  <strong>{notification.type || 'GENERAL'} - {notification.title || 'Campus Notification'}</strong>
                  <p>{notification.message || 'No notification details were provided.'}</p>
                  <p>{formatDateTime(notification.createdAt)}</p>
                </div>
                <span className={`status-dot ${read ? '' : 'status-dot-live'}`}>
                  {read ? 'Read' : 'Unread'}
                </span>
              </div>
            )
          })}
        </SectionContent>
      </div>
    </section>
  )
}

export default function UserDashboardPage() {
  const bookings = useUserSection('/user/bookings')
  const tickets = useUserSection('/user/tickets')
  const { notificationsState } = useOutletContext()

  return (
    <div className="card-grid two-col">
      <BookingsSection state={bookings} />
      <TicketsSection state={tickets} />
      <NotificationsSection state={notificationsState} wide />
    </div>
  )
}

export function UserBookingsPage() {
  const bookings = useUserSection('/user/bookings')

  return (
    <div className="card-grid two-col">
      <BookingsSection state={bookings} wide />
    </div>
  )
}

export function UserTicketsPage() {
  const tickets = useUserSection('/user/tickets')

  return (
    <div className="card-grid two-col">
      <TicketsSection state={tickets} wide />
    </div>
  )
}

export function UserNotificationsPage() {
  const { notificationsState } = useOutletContext()

  return (
    <div className="card-grid two-col">
      <NotificationsSection state={notificationsState} wide />
    </div>
  )
}
