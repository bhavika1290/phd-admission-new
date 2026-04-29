import express from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import { validate, applicationSchema } from '../middleware/validateMiddleware.js'
import {
  submitApplication,
  finalizeApplication,
  getMyApplication,
  getAllApplications,
} from '../controllers/applicationController.js'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../controllers/notificationController.js'
import {
  getAnnouncements,
} from '../controllers/announcementController.js'
import {
  getCalendarEvents,
} from '../controllers/calendarController.js'
import {
  getDepartments,
} from '../controllers/departmentController.js'
import {
  saveDraft,
  getDraft,
  deleteDraft,
} from '../controllers/draftController.js'
import {
  getInterviewsByApplication,
} from '../controllers/interviewController.js'
import {
  sendMessage,
  getMessages,
} from '../controllers/messageController.js'
import prisma from '../services/prismaClient.js'

const router = express.Router()

// ── Auth helper: check if current user is admin ──
router.get('/is-admin', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  })

  return res.json({
    isAdmin: !!(req.user.isAdmin || user?.isAdmin),
    user: req.user,
  })
})

// ── Student routes ──
router.post('/application',          authenticate, validate(applicationSchema), submitApplication)
router.post('/application/finalize', authenticate, finalizeApplication)
router.get ('/application/me',       authenticate, getMyApplication)

// ── Draft Management ──
router.post('/draft', authenticate, saveDraft)
router.get ('/draft', authenticate, getDraft)
router.delete('/draft', authenticate, deleteDraft)

// ── Notifications ──
router.get('/notifications', authenticate, getNotifications)
router.patch('/notifications/:id/read', authenticate, markNotificationRead)
router.patch('/notifications/read-all', authenticate, markAllNotificationsRead)
router.delete('/notifications/:id', authenticate, deleteNotification)

// ── Announcements ──
router.get('/announcements', getAnnouncements)

// ── Calendar ──
router.get('/calendar', getCalendarEvents)

// ── Departments ──
router.get('/departments', getDepartments)

// ── My Interviews ──
router.get('/interviews', authenticate, async (req, res) => {
  const application = await prisma.application.findFirst({
    where: { user_id: req.user.id },
    select: { id: true },
  })
  
  if (!application) {
    return res.json({ interviews: [] })
  }
  
  const { getInterviewsByApplication } = await import('../controllers/interviewController.js')
  return getInterviewsByApplication({ params: { applicationId: application.id }, res })
})

// ── Messages ──
router.post('/messages', authenticate, sendMessage)
router.get('/messages/:applicationId', authenticate, getMessages)

// ── Admin routes ──
router.get('/applications', authenticate, requireAdmin, getAllApplications)

export default router
