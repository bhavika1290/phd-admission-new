import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('phd_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export const sendOtp = (email) =>
  api.post('/auth/send-otp', { email })

export const verifyOtp = (email, otp) =>
  api.post('/auth/verify-otp', { email, otp })

// Application endpoints
export const submitApplication = (payload) =>
  api.post('/application', payload)

export const getMyApplication = () =>
  api.get('/application/me')

// Admin endpoints
export const checkIsAdmin = () =>
  api.get('/auth/is-admin') // Note: Adjusted to new auth route if applicable, or keep as is if on /api

export const getAllApplications = (filters = {}) =>
  api.get('/applications', { params: filters })

export const exportApplications = async (filters = {}) => {
  const token = localStorage.getItem('phd_token')

  const response = await fetch(
    `${BASE_URL}/api/export?${new URLSearchParams(filters)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  if (!response.ok) throw new Error('Export failed')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `phd_applications_${Date.now()}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}

export default api
