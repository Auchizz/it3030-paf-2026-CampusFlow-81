import { useState } from 'react'
import Layout from '../components/Layout'
import { cloneMockData, mockNotifications } from '../data/mockData'

const NOTIFICATION_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'BOOKING', label: 'Bookings' },
  { id: 'TICKET', label: 'Tickets' },
  { id: 'UNREAD', label: 'Unread' }
]

function isNotificationRead(notification) {
  return Boolean(notification?.read || notification?.isRead)
}

function getNotificationType(notification) {
  const explicitType = typeof notification?.type === 'string' ? notification.type.toUpperCase() : ''

  if (explicitType === 'BOOKING' || explicitType === 'TICKET' || explicitType === 'GENERAL') {
    return explicitType
  }

  const title = `${notification?.title || ''} ${notification?.message || ''}`.toLowerCase()

  if (title.includes('booking')) {
    return 'BOOKING'
  }

  if (title.includes('ticket')) {
    return 'TICKET'
  }

  return 'GENERAL'
}

function formatDateTime(value) {
  if (!value) {
    return 'Time not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function getEmptyStateCopy(selectedTab) {
  if (selectedTab === 'BOOKING') {
    return {
      title: 'No booking notifications',
      detail: 'Approval, rejection, and booking status updates will appear here once booking activity starts.'
    }
  }

  if (selectedTab === 'TICKET') {
    return {
      title: 'No ticket notifications',
      detail: 'Ticket creation, assignment, and progress updates will appear here once maintenance activity starts.'
    }
  }

  if (selectedTab === 'UNREAD') {
    return {
      title: 'No unread notifications',
      detail: 'New booking, ticket, and alert updates will appear here when they need your attention.'
    }
  }

  return {
    title: 'No notifications available',
    detail: 'Booking updates, ticket progress, and system alerts will appear here once activity starts.'
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(() => cloneMockData(mockNotifications))
  const [selectedTab, setSelectedTab] = useState('ALL')
  const [activeNotificationId, setActiveNotificationId] = useState(null)
  const [activeActionType, setActiveActionType] = useState('')
  const [pageError, setPageError] = useState('')
  const [pageSuccess, setPageSuccess] = useState('')

  const markRead = (notificationId) => {
    setActiveNotificationId(notificationId)
    setActiveActionType('ONE')
    setPageError('')
    setPageSuccess('')

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true, isRead: true } : notification
      )
    )
    setPageSuccess('Notification marked as read.')
    setActiveNotificationId(null)
    setActiveActionType('')
  }

  const markAllRead = () => {
    setActiveNotificationId('ALL')
    setActiveActionType('ALL')
    setPageError('')
    setPageSuccess('')

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        isNotificationRead(notification)
          ? notification
          : { ...notification, read: true, isRead: true }
      )
    )
    setPageError('')
    setPageSuccess('All notifications marked as read.')
    setActiveNotificationId(null)
    setActiveActionType('')
  }

  const unreadCount = notifications.filter((notification) => !isNotificationRead(notification)).length
  const bookingCount = notifications.filter((notification) => getNotificationType(notification) === 'BOOKING').length
  const ticketCount = notifications.filter((notification) => getNotificationType(notification) === 'TICKET').length

  const filteredNotifications = notifications.filter((notification) => {
    const type = getNotificationType(notification)

    if (selectedTab === 'BOOKING') {
      return type === 'BOOKING'
    }

    if (selectedTab === 'TICKET') {
      return type === 'TICKET'
    }

    if (selectedTab === 'UNREAD') {
      return !isNotificationRead(notification)
    }

    return true
  })

  const emptyStateCopy = getEmptyStateCopy(selectedTab)

  return (
    <Layout
      title="Notifications"
      subtitle="Track booking decisions, ticket updates, and general campus alerts from one reliable notification center."
      notifications={notifications}
    >
      {(pageSuccess || pageError) && (
        <div className="notifications-feedback-stack" aria-live="polite">
          {pageSuccess && <div className="notifications-toast notifications-toast-success">{pageSuccess}</div>}
          {pageError && <div className="notifications-toast notifications-toast-error">{pageError}</div>}
        </div>
      )}

      <section className="panel colorful-1 notifications-shell">
        <div className="notifications-header">
          <div>
            <h3>Notification Center</h3>
            <p className="field-helper">
              Review booking responses, ticket progress, and operational alerts. Unread items stay highlighted until you mark them as read.
            </p>
          </div>
          <button
            className="primary-btn notifications-mark-all-btn"
            type="button"
            disabled={!unreadCount || (activeNotificationId === 'ALL' && activeActionType === 'ALL')}
            onClick={markAllRead}
          >
            {activeNotificationId === 'ALL' && activeActionType === 'ALL' ? 'Marking...' : 'Mark All as Read'}
          </button>
        </div>

        <div className="notifications-summary-grid">
          <article className="signal-card notifications-summary-card">
            <span>Total notifications</span>
            <strong>{notifications.length}</strong>
            <p>All booking, ticket, and general alerts currently stored for your account.</p>
          </article>
          <article className="signal-card notifications-summary-card">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
            <p>{unreadCount ? 'These updates still need your attention.' : 'You are fully caught up right now.'}</p>
          </article>
          <article className="signal-card notifications-summary-card">
            <span>Booking updates</span>
            <strong>{bookingCount}</strong>
            <p>Booking-related notifications are separated so approval and rejection decisions are easier to review.</p>
          </article>
          <article className="signal-card notifications-summary-card">
            <span>Ticket updates</span>
            <strong>{ticketCount}</strong>
            <p>Maintenance and incident progress stays grouped together for faster follow-up.</p>
          </article>
        </div>

        <div className="notifications-filter-tabs">
          {NOTIFICATION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`notifications-filter-tab ${selectedTab === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="notifications-filter-count">
                {tab.id === 'ALL'
                  ? notifications.length
                  : tab.id === 'BOOKING'
                    ? bookingCount
                    : tab.id === 'TICKET'
                      ? ticketCount
                      : unreadCount}
              </span>
            </button>
          ))}
        </div>

        {filteredNotifications.length ? (
          <div className="notifications-list-grid">
            {filteredNotifications.map((notification) => {
              const read = isNotificationRead(notification)
              const type = getNotificationType(notification)
              const isActing = activeNotificationId === notification.id && activeActionType === 'ONE'

              return (
                <article
                  key={notification.id ?? `${notification.title}-${notification.createdAt}`}
                  className={`notifications-card ${read ? 'notifications-card-read' : 'notifications-card-unread'}`}
                >
                  <div className="notifications-card-header">
                    <div>
                      <strong className="notifications-card-title">{notification.title || 'Campus Notification'}</strong>
                      <p className="notifications-card-subtitle">{formatDateTime(notification.createdAt)}</p>
                    </div>
                    <div className="notifications-card-badges">
                      <span className={`notifications-type-badge notifications-type-badge-${type.toLowerCase()}`}>{type}</span>
                      <span className={`notifications-read-badge ${read ? 'notifications-read-badge-read' : 'notifications-read-badge-unread'}`}>
                        {read ? 'READ' : 'UNREAD'}
                      </span>
                    </div>
                  </div>

                  <div className="notifications-message-block">
                    <span>Message</span>
                    <strong>{notification.message || 'No notification details were provided.'}</strong>
                  </div>

                  {!read && (
                    <div className="notifications-card-footer">
                      <button
                        className="small-btn notifications-action-btn"
                        type="button"
                        disabled={isActing}
                        onClick={() => markRead(notification.id)}
                      >
                        {isActing ? 'Marking...' : 'Mark as Read'}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state notifications-empty-state">
            <strong>{emptyStateCopy.title}</strong>
            <p>{emptyStateCopy.detail}</p>
          </div>
        )}
      </section>
    </Layout>
  )
}
