import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import {
  cloneMockData,
  mockBookings,
  mockNotifications,
  mockResources,
  mockTickets
} from '../data/mockData'

function getDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value) {
  if (!value) return 'No date set'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  }).format(new Date(`${value}T00:00:00`))
}

function formatTimeRange(startTime, endTime) {
  const start = startTime ? startTime.slice(0, 5) : '--:--'
  const end = endTime ? endTime.slice(0, 5) : '--:--'
  return `${start} - ${end}`
}

function toTitleCase(value) {
  return (value || '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function HomePage() {
  const resources = cloneMockData(mockResources)
  const bookings = cloneMockData(mockBookings)
  const tickets = cloneMockData(mockTickets)
  const notifications = cloneMockData(mockNotifications)
  const { user } = useAuth()

  const todayKey = getDateKey()
  const activeResources = resources.filter((resource) => resource.status === 'ACTIVE').length
  const offlineResources = resources.filter((resource) => resource.status !== 'ACTIVE').length
  const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING').length
  const approvedBookings = bookings.filter((booking) => booking.status === 'APPROVED').length
  const unresolvedTickets = tickets.filter((ticket) => !['RESOLVED', 'CLOSED', 'REJECTED'].includes(ticket.status)).length
  const resolvedTickets = tickets.filter((ticket) => ['RESOLVED', 'CLOSED'].includes(ticket.status)).length
  const urgentTickets = tickets.filter(
    (ticket) => ['HIGH', 'CRITICAL'].includes(ticket.priority) && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(ticket.status)
  ).length
  const unreadNotifications = notifications.filter((notification) => !notification.read && !notification.isRead).length

  const upcomingBookings = [...bookings]
    .filter((booking) => booking.bookingDate && booking.bookingDate >= todayKey && booking.status !== 'CANCELLED')
    .sort((left, right) => {
      const leftValue = `${left.bookingDate || ''}${left.startTime || ''}`
      const rightValue = `${right.bookingDate || ''}${right.startTime || ''}`
      return leftValue.localeCompare(rightValue)
    })

  const schedule = upcomingBookings.slice(0, 5)
  const recentTickets = [...tickets]
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    .slice(0, 4)
  const recentNotifications = [...notifications].sort((left, right) => (right.id || 0) - (left.id || 0)).slice(0, 4)

  const resourceMix = Object.entries(
    resources.reduce((accumulator, resource) => {
      const key = resource.type || 'OTHER'
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)

  const focusItems = [
    {
      label: 'Approvals waiting',
      value: pendingBookings,
      note: pendingBookings ? 'Review booking requests before the next time slot' : 'No bookings are waiting for approval'
    },
    {
      label: 'Urgent ticket load',
      value: urgentTickets,
      note: urgentTickets ? 'Dispatch technicians to high-impact issues first' : 'No urgent incidents are open'
    },
    {
      label: 'Resources offline',
      value: offlineResources,
      note: offlineResources ? 'Unavailable assets may affect room planning' : 'All tracked resources are available'
    }
  ]

  const firstName = user?.fullName?.split(' ')[0] || 'Team'

  return (
    <Layout
      title="Operations Dashboard"
      subtitle={`Live workload, availability, and alerts for ${toTitleCase(user?.role) || 'campus teams'}`}
      notifications={notifications}
    >
      <div className="dashboard-stack">
        <section className="dashboard-hero panel">
          <div>
            <div className="dashboard-eyebrow">Control room</div>
            <h2>{firstName}, here is the current campus pulse.</h2>
            <p className="dashboard-lead">
              Watch bookings, ticket pressure, and resource availability from one view built around the day&apos;s next actions.
            </p>
          </div>
          <div className="dashboard-focus-grid">
            {focusItems.map((item) => (
              <article key={item.label} className="focus-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-metrics">
          <article className="metric-card">
            <span>Active resources</span>
            <strong>{activeResources}/{resources.length || 0}</strong>
            <p>{offlineResources ? `${offlineResources} marked unavailable` : 'Full inventory available right now'}</p>
          </article>
          <article className="metric-card">
            <span>Scheduled flow</span>
            <strong>{schedule.length}</strong>
            <p>{approvedBookings} approved bookings are already in the pipeline</p>
          </article>
          <article className="metric-card">
            <span>Open ticket load</span>
            <strong>{unresolvedTickets}</strong>
            <p>{urgentTickets ? `${urgentTickets} require immediate attention` : 'No urgent maintenance backlog'}</p>
          </article>
          <article className="metric-card">
            <span>Unread notifications</span>
            <strong>{unreadNotifications}</strong>
            <p>{notifications.length} alerts have been issued across the system</p>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel dashboard-panel-wide">
            <div className="panel-heading">
              <div>
                <h3>Upcoming bookings</h3>
                <p>Earliest confirmed and pending reservations from today onward</p>
              </div>
              <div className="panel-chip">{upcomingBookings.length} queued</div>
            </div>
            {schedule.length ? (
              <div className="schedule-list">
                {schedule.map((booking) => (
                  <div key={booking.id} className="schedule-item">
                    <div>
                      <strong>{booking.resource?.name || 'Unassigned resource'}</strong>
                      <p>{booking.purpose || 'No purpose provided'}</p>
                    </div>
                    <div className="schedule-meta">
                      <span>{formatDate(booking.bookingDate)}</span>
                      <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                      <span className={`badge ${booking.status === 'APPROVED' ? 'success' : booking.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No upcoming bookings are scheduled yet.</div>
            )}
          </article>

          <article className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h3>Ticket pressure</h3>
                <p>Most recent incidents and current response risk</p>
              </div>
              <div className="panel-chip panel-chip-alert">{urgentTickets} urgent</div>
            </div>
            <div className="signal-grid">
              <div className="signal-card">
                <span>Open now</span>
                <strong>{unresolvedTickets}</strong>
              </div>
              <div className="signal-card">
                <span>Resolved or closed</span>
                <strong>{resolvedTickets}</strong>
              </div>
            </div>
            <div className="compact-list">
              {recentTickets.length ? (
                recentTickets.map((ticket) => (
                  <div key={ticket.id} className="compact-item">
                    <div>
                      <strong>#{ticket.id} {ticket.category || 'General issue'}</strong>
                      <p>{ticket.location || 'Campus location not provided'}</p>
                    </div>
                    <div className="compact-meta">
                      <span>{toTitleCase(ticket.priority)}</span>
                      <span>{toTitleCase(ticket.status)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No tickets have been raised yet.</div>
              )}
            </div>
          </article>

          <article className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h3>Resource mix</h3>
                <p>Where capacity is concentrated across the catalog</p>
              </div>
            </div>
            <div className="mix-list">
              {resourceMix.length ? (
                resourceMix.map(([type, count]) => (
                  <div key={type} className="mix-item">
                    <div className="row between">
                      <strong>{toTitleCase(type)}</strong>
                      <span>{count}</span>
                    </div>
                    <div className="mix-bar">
                      <span style={{ width: `${(count / resources.length) * 100}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No resources are available to summarize.</div>
              )}
            </div>
          </article>

          <article className="dashboard-panel dashboard-panel-wide">
            <div className="panel-heading">
              <div>
                <h3>Alert stream</h3>
                <p>Latest notifications that still need attention or review</p>
              </div>
            </div>
            <div className="compact-list">
              {recentNotifications.length ? (
                recentNotifications.map((notification) => (
                  <div key={notification.id} className="compact-item">
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                    </div>
                    <div className={`status-dot ${!notification.read && !notification.isRead ? 'status-dot-live' : ''}`}>
                      {!notification.read && !notification.isRead ? 'Unread' : 'Seen'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">There are no notifications to show.</div>
              )}
            </div>
          </article>
        </section>
      </div>
    </Layout>
  )
}
