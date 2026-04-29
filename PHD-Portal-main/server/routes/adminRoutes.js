import express from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import {
  updateApplicationStatus,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  sendBulkEmail,
} from '../controllers/adminController.js'
import {
  getAllApplications,
  calculateMeritList,
  updatePaymentStatus,
} from '../controllers/applicationController.js'
import {
  getApplicationStats,
  getDepartmentStats,
  bulkUpdateStatus,
} from '../controllers/statusController.js'
import {
  getAllInterviews,
  scheduleInterview,
  updateInterview,
  deleteInterview,
} from '../controllers/interviewController.js'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js'
import {
  getAuditLogs,
  getEntityAuditLogs,
} from '../controllers/auditController.js'
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../controllers/calendarController.js'
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js'
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
} from '../controllers/webhookController.js'
import {
  sendMessage,
  getMessages,
} from '../controllers/messageController.js'

const router = express.Router()

// All routes require authentication and admin access
router.use(authenticate)
router.use(requireAdmin)

// Application Management
router.get('/applications', getAllApplications)
router.patch('/application/:applicationId/status', updateApplicationStatus)
router.post('/applications/bulk-status', bulkUpdateStatus)
router.get('/stats', getApplicationStats)
router.get('/stats/departments', getDepartmentStats)
router.post('/merit-list', calculateMeritList)
router.patch('/application/:applicationId/payment', updatePaymentStatus)

// Messaging (Admin side)
router.get('/messages/:applicationId', getMessages)
router.post('/messages', sendMessage)

// Email Templates
router.get('/email-templates', getEmailTemplates)
router.post('/email-templates', createEmailTemplate)
router.put('/email-templates/:templateId', updateEmailTemplate)
router.delete('/email-templates/:templateId', deleteEmailTemplate)

// Bulk Email
router.post('/bulk-email', sendBulkEmail)

// Interviews
router.get('/interviews', getAllInterviews)
router.post('/interviews', scheduleInterview)
router.put('/interviews/:id', updateInterview)
router.delete('/interviews/:id', deleteInterview)

// Announcements
router.get('/announcements', getAnnouncements)
router.post('/announcements', createAnnouncement)
router.put('/announcements/:id', updateAnnouncement)
router.delete('/announcements/:id', deleteAnnouncement)

// Calendar
router.get('/calendar', getCalendarEvents)
router.post('/calendar', createCalendarEvent)
router.put('/calendar/:id', updateCalendarEvent)
router.delete('/calendar/:id', deleteCalendarEvent)

// Departments
router.get('/departments', getDepartments)
router.post('/departments', createDepartment)
router.put('/departments/:id', updateDepartment)
router.delete('/departments/:id', deleteDepartment)

// Webhooks
router.get('/webhooks', getWebhooks)
router.post('/webhooks', createWebhook)
router.put('/webhooks/:id', updateWebhook)
router.delete('/webhooks/:id', deleteWebhook)

// Audit Logs
router.get('/audit-logs', getAuditLogs)
router.get('/audit-logs/:entityType/:entityId', getEntityAuditLogs)

export default router
