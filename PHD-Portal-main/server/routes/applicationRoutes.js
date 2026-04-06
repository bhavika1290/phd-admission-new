import express from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import { validate, applicationSchema } from '../middleware/validateMiddleware.js'
import {
  submitApplication,
  finalizeApplication,
  getMyApplication,
  getAllApplications,
} from '../controllers/applicationController.js'
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

// ── Admin routes ──
router.get('/applications', authenticate, requireAdmin, getAllApplications)

export default router
