import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Crucial for refresh token cookies
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

// Auth
export const sendOtp = (email) => api.post('/auth/send-otp', { email })
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp })
export const verifySignupOtp = (email, otp) => api.post('/auth/verify-signup-otp', { email, otp })
export const registerUser = (name, email, password) => api.post('/auth/register', { name, email, password })
export const loginWithPassword = (email, password) => api.post('/auth/login', { email, password })
export const logout = () => api.post('/auth/logout')
export const refreshAccessToken = () => api.post('/auth/refresh')
export const requestPasswordReset = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword })

// Application
export const submitApplication = (payload) => api.post('/application', payload)
export const finalizeApplication = (payload) => api.post('/application/finalize', payload)
export const getMyApplication = () => api.get('/application/me')

// Drafts
export const saveDraft = (data) => api.post('/draft', { data })
export const getDraft = () => api.get('/draft')
export const deleteDraft = () => api.delete('/draft')

// Admin: Application Management
export const checkIsAdmin = () => api.get('/is-admin')
export const getAllApplications = (filters = {}) => api.get('/admin/applications', { params: filters })
export const updateApplicationStatus = (applicationId, status, note) => api.patch(`/admin/application/${applicationId}/status`, { status, note })
export const bulkUpdateStatus = (applicationIds, status, note) => api.post('/admin/applications/bulk-status', { applicationIds, status, note })
export const calculateMeritList = () => api.post('/admin/merit-list')
export const updatePaymentStatus = (applicationId, payment_status) =>
  api.patch(`/admin/application/${applicationId}/payment`, { payment_status })

// Stats
export const getApplicationStats = () => api.get('/admin/stats')
export const getDepartmentStats = () => api.get('/admin/stats/departments')

// Email Templates
export const getEmailTemplates = () => api.get('/admin/email-templates')
export const createEmailTemplate = (data) => api.post('/admin/email-templates', data)
export const updateEmailTemplate = (templateId, data) => api.put(`/admin/email-templates/${templateId}`, data)
export const deleteEmailTemplate = (templateId) => api.delete(`/admin/email-templates/${templateId}`)
export const sendBulkEmail = (data) => api.post('/admin/bulk-email', data)

// Interviews
export const getAllInterviews = (filters) => api.get('/admin/interviews', { params: filters })
export const scheduleInterview = (data) => api.post('/admin/interviews', data)
export const updateInterview = (id, data) => api.put(`/admin/interviews/${id}`, data)
export const deleteInterview = (id) => api.delete(`/admin/interviews/${id}`)

// Messaging
export const sendMessage = (applicationId, content) => api.post('/messages', { applicationId, content })
export const getMessages = (applicationId) => api.get(`/messages/${applicationId}`)

// Infrastructure
export const getAnnouncements = () => api.get('/announcements')
export const createAnnouncement = (data) => api.post('/admin/announcements', data)
export const updateAnnouncement = (id, data) => api.put(`/admin/announcements/${id}`, data)
export const deleteAnnouncement = (id) => api.delete(`/admin/announcements/${id}`)

export const getCalendarEvents = () => api.get('/calendar')
export const createCalendarEvent = (data) => api.post('/admin/calendar', data)
export const updateCalendarEvent = (id, data) => api.put(`/admin/calendar/${id}`, data)
export const deleteCalendarEvent = (id) => api.delete(`/admin/calendar/${id}`)

export const getDepartments = () => api.get('/departments')
export const createDepartment = (data) => api.post('/admin/departments', data)
export const updateDepartment = (id, data) => api.put(`/admin/departments/${id}`, data)
export const deleteDepartment = (id) => api.delete(`/admin/departments/${id}`)

// Notifications
export const getNotifications = (unreadOnly = false) => api.get('/notifications', { params: { unreadOnly } })
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`)
export const markAllNotificationsRead = () => api.patch('/notifications/read-all')
export const deleteNotification = (id) => api.delete(`/notifications/${id}`)

// Export
export const exportApplications = async (filters = {}) => {
  const token = localStorage.getItem('phd_token')
  const response = await fetch(`${BASE_URL}/api/export?${new URLSearchParams(filters)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
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
