import { createContext, useContext, useEffect, useState } from 'react'
import { api, setApiAuthToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(localStorage.getItem('token')))

  useEffect(() => {
    if (!token) {
      setApiAuthToken('')
      setIsAuthLoading(false)
      return
    }

    setApiAuthToken(token)
    localStorage.setItem('token', token)

    api.get('/auth/me')
      .then((response) => {
        setUser(response.data.data)
        localStorage.setItem('user', JSON.stringify(response.data.data))
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setIsAuthLoading(false)
      })
  }, [token])

  const normalizeAuthUser = (data) => ({
    id: data.user?.id ?? data.userId ?? data.id,
    fullName: data.user?.fullName ?? data.fullName,
    email: data.user?.email ?? data.email,
    role: data.user?.role ?? data.role
  })

  const storeSession = (data) => {
    const nextUser = normalizeAuthUser(data)

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(nextUser))
    setApiAuthToken(data.token)
    setToken(data.token)
    setUser(nextUser)
  }

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    storeSession(response.data.data)
    return normalizeAuthUser(response.data.data)
  }

  const register = async ({ name, email, password }) => {
    const response = await api.post('/auth/register', { name, email, password })
    storeSession(response.data.data)
    return normalizeAuthUser(response.data.data)
  }

  const createAdmin = async ({ fullName, email, password }) => {
    const response = await api.post('/auth/admins', { fullName, email, password })
    return response.data.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setApiAuthToken('')
    setToken('')
    setUser(null)
    setIsAuthLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthLoading, login, register, createAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
