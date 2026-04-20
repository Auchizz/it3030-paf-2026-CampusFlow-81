import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

function normalizeDocument(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeDocument(item))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const normalized = Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, normalizeDocument(nestedValue)])
  )

  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id
  }

  if (normalized.date && !normalized.bookingDate) {
    normalized.bookingDate = String(normalized.date).slice(0, 10)
  }

  if (normalized.resourceId && typeof normalized.resourceId === 'object' && !Array.isArray(normalized.resourceId)) {
    normalized.resource = normalizeDocument(normalized.resourceId)
    normalized.resourceId = normalized.resource.id || normalized.resource._id
  }

  if (normalized.userId && typeof normalized.userId === 'object' && !Array.isArray(normalized.userId)) {
    normalized.user = normalizeDocument(normalized.userId)
    normalized.userId = normalized.user.id || normalized.user._id
  }

  if (normalized.image && !normalized.imageUrl) {
    normalized.imageUrl = `${API_ORIGIN}/${String(normalized.image).replace(/^\/+/, '')}`
  }

  return normalized
}

export const api = axios.create({
  baseURL: API_BASE_URL
})

export function setApiAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use((response) => {
  if (response.data?.data) {
    response.data = {
      ...response.data,
      data: normalizeDocument(response.data.data)
    }
  }

  return response
})
