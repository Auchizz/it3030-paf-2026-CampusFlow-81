import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const initialAdminForm = { fullName: '', email: '', password: '' }
const initialResourceForm = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: 1,
  location: '',
  status: 'ACTIVE',
  description: ''
}
const initialNotificationForm = {
  title: '',
  message: '',
  type: 'GENERAL',
  recipientId: ''
}

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Action failed.'
}

function RecordsTable({ title, rows, columns }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <p>{rows.length} records</p>
        </div>
      </div>
      <div className="compact-list">
        {rows.length ? rows.map((row) => (
          <div key={row.id} className="compact-item">
            <div>
              <strong>{columns[0].render(row)}</strong>
              <p>{columns.slice(1).map((column) => column.render(row)).join(' · ')}</p>
            </div>
          </div>
        )) : <div className="empty-state">No records found.</div>}
      </div>
    </section>
  )
}

export default function AdminDashboardPage() {
  const { createAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])
  const [notifications, setNotifications] = useState([])
  const [adminForm, setAdminForm] = useState(initialAdminForm)
  const [resourceForm, setResourceForm] = useState(initialResourceForm)
  const [notificationForm, setNotificationForm] = useState(initialNotificationForm)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [pageSuccess, setPageSuccess] = useState('')

  const load = async () => {
    setIsLoading(true)
    setPageError('')

    try {
      const [userResponse, resourceResponse, bookingResponse, ticketResponse, notificationResponse] = await Promise.all([
        api.get('/users'),
        api.get('/resources'),
        api.get('/bookings'),
        api.get('/tickets'),
        api.get('/notifications')
      ])

      setUsers(userResponse.data.data)
      setResources(resourceResponse.data.data)
      setBookings(bookingResponse.data.data)
      setTickets(ticketResponse.data.data)
      setNotifications(notificationResponse.data.data)
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateForm = (setter) => (field, value) => {
    setter((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const submitAdmin = async (e) => {
    e.preventDefault()
    setPageError('')
    setPageSuccess('')

    try {
      await createAdmin(adminForm)
      setAdminForm(initialAdminForm)
      setPageSuccess('Admin account created successfully.')
      await load()
    } catch (error) {
      setPageError(getErrorMessage(error))
    }
  }

  const submitResource = async (e) => {
    e.preventDefault()
    setPageError('')
    setPageSuccess('')

    try {
      await api.post('/resources', { ...resourceForm, capacity: Number(resourceForm.capacity) })
      setResourceForm(initialResourceForm)
      setPageSuccess('Resource created successfully.')
      await load()
    } catch (error) {
      setPageError(getErrorMessage(error))
    }
  }

  const submitNotification = async (e) => {
    e.preventDefault()
    setPageError('')
    setPageSuccess('')

    try {
      await api.post('/notifications', {
        ...notificationForm,
        recipientId: notificationForm.recipientId || null
      })
      setNotificationForm(initialNotificationForm)
      setPageSuccess('Notification sent successfully.')
      await load()
    } catch (error) {
      setPageError(getErrorMessage(error))
    }
  }

  const updateTicketStatus = async (ticket, status) => {
    setPageError('')
    setPageSuccess('')

    try {
      await api.put(`/tickets/${ticket.id}/status`, { status })
      setPageSuccess('Ticket status updated successfully.')
      await load()
    } catch (error) {
      setPageError(getErrorMessage(error))
    }
  }

  return (
    <Layout
      title="Admin Dashboard"
      subtitle="Manage resources, users, bookings, tickets, notifications, and records."
      notifications={notifications}
    >
      {pageSuccess && <div className="demo-box">{pageSuccess}</div>}
      {pageError && <div className="error-box">{pageError}</div>}
      {isLoading && <div className="empty-state">Loading admin dashboard...</div>}

      <section className="dashboard-metrics">
        <article className="metric-card"><span>Users</span><strong>{users.length}</strong><p>Registered accounts</p></article>
        <article className="metric-card"><span>Resources</span><strong>{resources.length}</strong><p>Campus assets</p></article>
        <article className="metric-card"><span>Bookings</span><strong>{bookings.length}</strong><p>All booking records</p></article>
        <article className="metric-card"><span>Tickets</span><strong>{tickets.length}</strong><p>Incident records</p></article>
      </section>

      <div className="card-grid two-col">
        <section className="panel colorful-3">
          <div className="panel-heading"><div><h3>Create Admin</h3><p>Only admins can create admin accounts.</p></div></div>
          <form className="form-grid" onSubmit={submitAdmin}>
            <input value={adminForm.fullName} onChange={(e) => updateForm(setAdminForm)('fullName', e.target.value)} placeholder="Full name" />
            <input value={adminForm.email} onChange={(e) => updateForm(setAdminForm)('email', e.target.value)} placeholder="Email" />
            <input type="password" value={adminForm.password} onChange={(e) => updateForm(setAdminForm)('password', e.target.value)} placeholder="Password" />
            <button className="primary-btn">Create Admin</button>
          </form>
        </section>

        <section className="panel colorful-4">
          <div className="panel-heading"><div><h3>Resource Management</h3><p>Create campus resources.</p></div></div>
          <form className="form-grid" onSubmit={submitResource}>
            <input value={resourceForm.name} onChange={(e) => updateForm(setResourceForm)('name', e.target.value)} placeholder="Resource name" />
            <select value={resourceForm.type} onChange={(e) => updateForm(setResourceForm)('type', e.target.value)}>
              <option>LECTURE_HALL</option>
              <option>LAB</option>
              <option>EQUIPMENT</option>
            </select>
            <input type="number" value={resourceForm.capacity} onChange={(e) => updateForm(setResourceForm)('capacity', e.target.value)} placeholder="Capacity" />
            <input value={resourceForm.location} onChange={(e) => updateForm(setResourceForm)('location', e.target.value)} placeholder="Location" />
            <select value={resourceForm.status} onChange={(e) => updateForm(setResourceForm)('status', e.target.value)}>
              <option>ACTIVE</option>
              <option>OUT_OF_SERVICE</option>
            </select>
            <textarea value={resourceForm.description} onChange={(e) => updateForm(setResourceForm)('description', e.target.value)} placeholder="Description" />
            <button className="primary-btn">Create Resource</button>
          </form>
        </section>

        <section className="panel colorful-1">
          <div className="panel-heading"><div><h3>Create Notification</h3><p>Send to everyone or a selected user.</p></div></div>
          <form className="form-grid" onSubmit={submitNotification}>
            <input value={notificationForm.title} onChange={(e) => updateForm(setNotificationForm)('title', e.target.value)} placeholder="Title" />
            <textarea value={notificationForm.message} onChange={(e) => updateForm(setNotificationForm)('message', e.target.value)} placeholder="Message" />
            <select value={notificationForm.type} onChange={(e) => updateForm(setNotificationForm)('type', e.target.value)}>
              <option>GENERAL</option>
              <option>BOOKING</option>
              <option>TICKET</option>
            </select>
            <select value={notificationForm.recipientId} onChange={(e) => updateForm(setNotificationForm)('recipientId', e.target.value)}>
              <option value="">All users</option>
              {users.filter((user) => user.role === 'USER').map((user) => (
                <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
              ))}
            </select>
            <button className="primary-btn">Send Notification</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><h3>Respond To Tickets</h3><p>Update ticket status.</p></div></div>
          <div className="compact-list">
            {tickets.length ? tickets.map((ticket) => (
              <div key={ticket.id} className="compact-item">
                <div>
                  <strong>{ticket.title}</strong>
                  <p>{ticket.user?.email || 'Unknown user'} · {ticket.category} · {ticket.status}</p>
                </div>
                <div className="row gap wrap">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                    <button key={status} className="small-btn" type="button" onClick={() => updateTicketStatus(ticket, status)}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )) : <div className="empty-state">No tickets found.</div>}
          </div>
        </section>
      </div>

      <div className="card-grid two-col">
        <RecordsTable title="Users" rows={users} columns={[
          { render: (row) => row.fullName },
          { render: (row) => row.email },
          { render: (row) => row.role }
        ]} />
        <RecordsTable title="Resources" rows={resources} columns={[
          { render: (row) => row.name },
          { render: (row) => row.type },
          { render: (row) => row.status }
        ]} />
        <RecordsTable title="Bookings" rows={bookings} columns={[
          { render: (row) => row.resource?.name || 'Resource' },
          { render: (row) => row.user?.email || 'Unknown user' },
          { render: (row) => row.status }
        ]} />
        <RecordsTable title="Tickets" rows={tickets} columns={[
          { render: (row) => row.title },
          { render: (row) => row.user?.email || 'Unknown user' },
          { render: (row) => row.status }
        ]} />
        <RecordsTable title="Notifications" rows={notifications} columns={[
          { render: (row) => row.title },
          { render: (row) => row.type },
          { render: (row) => row.recipientId?.email || 'All users' }
        ]} />
      </div>
    </Layout>
  )
}
