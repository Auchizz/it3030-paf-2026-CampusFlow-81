import { Outlet, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'

const PAGE_COPY = {
  '/user': {
    title: 'User Dashboard',
    subtitle: 'Your bookings, tickets, and notifications.'
  },
  '/user/my-bookings': {
    title: 'My Bookings',
    subtitle: 'Review your booking requests, decisions, and scheduled resource use.'
  },
  '/user/my-tickets': {
    title: 'My Tickets',
    subtitle: 'Track incidents and maintenance requests submitted by you.'
  },
  '/user/my-notifications': {
    title: 'My Notifications',
    subtitle: 'Review booking decisions, ticket updates, and campus alerts.'
  }
}

function createSectionState() {
  return {
    data: [],
    isLoading: true,
    error: ''
  }
}

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Unable to load notifications.'
}

export default function UserLayout() {
  const location = useLocation()
  const pageCopy = PAGE_COPY[location.pathname] || PAGE_COPY['/user']
  const [notificationsState, setNotificationsState] = useState(() => createSectionState())

  const refreshNotifications = useCallback(async () => {
    setNotificationsState((currentState) => ({ ...currentState, isLoading: true, error: '' }))

    try {
      const response = await api.get('/user/notifications')
      setNotificationsState({
        data: Array.isArray(response.data.data) ? response.data.data : [],
        isLoading: false,
        error: ''
      })
    } catch (error) {
      setNotificationsState({
        data: [],
        isLoading: false,
        error: getErrorMessage(error)
      })
    }
  }, [])

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  return (
    <Layout
      title={pageCopy.title}
      subtitle={pageCopy.subtitle}
      notifications={notificationsState.data}
    >
      <Outlet context={{ notificationsState, setNotificationsState, refreshNotifications }} />
    </Layout>
  )
}
