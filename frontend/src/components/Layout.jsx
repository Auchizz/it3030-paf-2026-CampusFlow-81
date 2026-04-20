import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SidebarIcon({ children }) {
  return (
    <span className="sidebar-nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  )
}

const USER_NAV_ITEMS = [
  {
    to: '/user',
    end: true,
    label: 'Dashboard',
    icon: (
      <SidebarIcon>
        <path d="M4.5 10.5 12 4l7.5 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-4v5H5.5a1 1 0 0 1-1-1z" />
      </SidebarIcon>
    )
  },
  {
    to: '/user/my-bookings',
    label: 'My Bookings',
    icon: (
      <SidebarIcon>
        <rect x="4" y="5" width="16" height="15" rx="2.5" />
        <path d="M8 3.5v3M16 3.5v3M4 9.5h16M8 13h3M8 16h6" />
      </SidebarIcon>
    )
  },
  {
    to: '/user/my-tickets',
    label: 'My Tickets',
    icon: (
      <SidebarIcon>
        <path d="M7 6h10a2 2 0 0 1 2 2v2.25a1.75 1.75 0 0 0 0 3.5V16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2.25a1.75 1.75 0 0 0 0-3.5V8a2 2 0 0 1 2-2Z" />
        <path d="M12 8.5v7M9.5 11h5" />
      </SidebarIcon>
    )
  },
  {
    to: '/user/my-notifications',
    label: 'My Notifications',
    icon: (
      <SidebarIcon>
        <path d="M6.5 16.5h11l-1.2-1.7a3 3 0 0 1-.55-1.72V10a3.75 3.75 0 1 0-7.5 0v3.08a3 3 0 0 1-.55 1.72z" />
        <path d="M10 18.5a2.2 2.2 0 0 0 4 0" />
      </SidebarIcon>
    )
  }
]

const ADMIN_NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: (
      <SidebarIcon>
        <path d="M4.5 10.5 12 4l7.5 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-4v5H5.5a1 1 0 0 1-1-1z" />
      </SidebarIcon>
    )
  },
  {
    to: '/admin',
    label: 'Records',
    icon: (
      <SidebarIcon>
        <rect x="4" y="5" width="16" height="14" rx="2.5" />
        <path d="M4 10.5h16M9 5v14" />
      </SidebarIcon>
    )
  },
  {
    to: '/admin',
    label: 'Tickets',
    icon: (
      <SidebarIcon>
        <path d="M7 6h10a2 2 0 0 1 2 2v2.25a1.75 1.75 0 0 0 0 3.5V16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2.25a1.75 1.75 0 0 0 0-3.5V8a2 2 0 0 1 2-2Z" />
        <path d="M12 8.5v7M9.5 11h5" />
      </SidebarIcon>
    )
  },
  {
    to: '/admin',
    label: 'Notifications',
    icon: (
      <SidebarIcon>
        <path d="M6.5 16.5h11l-1.2-1.7a3 3 0 0 1-.55-1.72V10a3.75 3.75 0 1 0-7.5 0v3.08a3 3 0 0 1-.55 1.72z" />
        <path d="M10 18.5a2.2 2.2 0 0 0 4 0" />
      </SidebarIcon>
    )
  }
]

export default function Layout({ title, subtitle = 'Campus operations in one place', children, notifications = [] }) {
  const { user, logout } = useAuth()
  const unreadCount = notifications.filter((notification) => !notification.read && !notification.isRead).length
  const navItems = user?.role === 'ADMIN' ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M10 17.5 24 10l14 7.5L24 25z" fill="rgba(255,255,255,0.92)" />
                <path d="M14.5 22.5v8L24 35l9.5-4.5v-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24 25v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="brand-copy">
              <div className="brand">Smart Campus Hub</div>
              <p className="subbrand">Bookings, tickets, assets and alerts</p>
            </div>
          </div>
          <nav className="nav">
            {navItems.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-nav-main">
                  {item.icon}
                  <span className="sidebar-nav-label">{item.label}</span>
                </span>
                {item.label.includes('Notification') && unreadCount > 0 ? (
                  <span className="sidebar-nav-badge">{unreadCount}</span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="profile-card sidebar-profile-card">
          <div className="sidebar-profile-meta">
            <strong>{user?.fullName}</strong>
            <div className="sidebar-role">{user?.role}</div>
            <div className="small sidebar-email">{user?.email}</div>
          </div>
          <button className="ghost-btn sidebar-logout-btn" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-copy">
            <div className="topbar-eyebrow">Operations Control</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="notif-pill">
            <strong>{unreadCount}</strong>
            <span>Unread alerts</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
