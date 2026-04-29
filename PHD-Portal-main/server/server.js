import './config/env.js'
import express from 'express'
import cors from 'cors'
import applicationRoutes from './routes/applicationRoutes.js'
import authRoutes from './routes/authRoutes.js'
import exportRoutes from './routes/exportRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

const app  = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ───────────────────────────────────────────────
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate Limiting for OTP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 OTP requests per window
  message: { error: 'Too many OTP requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Custom CSRF-lite Protection for state-changing routes
app.use((req, res, next) => {
  const allowedMethods = ['GET', 'HEAD', 'OPTIONS']
  if (allowedMethods.includes(req.method)) return next()

  const origin = req.get('Origin') || req.get('Referer')
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  
  if (origin && !origin.startsWith(clientUrl)) {
    console.warn(`Potential CSRF attack blocked from origin: ${origin}`)
    return res.status(403).json({ error: 'Forbidden: Invalid request origin.' })
  }
  next()
})

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth/send-otp', otpLimiter)
app.use('/api/auth', authRoutes)
app.use('/api', applicationRoutes)   // covers /api/application, /api/applications
app.use('/api/export', exportRoutes)
app.use('/api/admin', adminRoutes)        // covers admin routes seeded on /api/admin

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// ─── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }))

// ─── Global Error Handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error.' })
})

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})
