import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import prisma from '../services/prismaClient.js'
import crypto from 'crypto'
import '../config/env.js'
import { demoMailMode, sendOtpEmail } from '../services/emailService.js'

const ACCESS_TOKEN_EXPIRY = '1h'
const REFRESH_TOKEN_EXPIRY_DAYS = 7

/**
 * Helper to generate access token and set refresh token cookie
 */
async function generateTokens(user, res) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  )

  const refreshToken = crypto.randomBytes(40).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  })

  return accessToken
}

/**
 * POST /api/auth/send-otp
 */
export async function sendOtp(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const otp = crypto.randomInt(100000, 999999).toString()
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10
  const expiresAt = new Date(Date.now() + expiryMinutes * 60000)

  try {
    await prisma.oneTimePassword.create({
      data: { email, otp, expiresAt },
    })

    await sendOtpEmail({ to: email, otp, expiryMinutes })

    if (demoMailMode) {
      return res.status(200).json({
        message: 'OTP sent successfully (Demo Mode).',
        demoOtp: otp,
      })
    }

    return res.status(200).json({ message: 'OTP sent successfully.' })
  } catch (err) {
    console.error('Error in sendOtp:', err)
    return res.status(500).json({ error: 'Failed to send OTP.' })
  }
}

/**
 * POST /api/auth/verify-otp
 */
export async function verifyOtp(req, res) {
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' })

  try {
    const record = await prisma.oneTimePassword.findFirst({
      where: {
        email,
        otp,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP.' })

    await prisma.oneTimePassword.deleteMany({ where: { email } })

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({ data: { email } })
    }

    const token = await generateTokens(user, res)

    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, email: user.email, isAdmin: user.isAdmin, role: user.role },
    })
  } catch (err) {
    console.error('Error in verifyOtp:', err)
    return res.status(500).json({ error: 'Authentication failed.' })
  }
}

/**
 * POST /api/auth/register
 */
export async function registerUser(req, res) {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' })
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(400).json({ error: 'User already exists.' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiryMinutes = 10
    const expiresAt = new Date(Date.now() + expiryMinutes * 60000)

    await prisma.signupRequest.upsert({
      where: { email },
      update: { name, password: hashedPassword, otp, expiresAt, createdAt: new Date() },
      create: { name, email, password: hashedPassword, otp, expiresAt },
    })

    await sendOtpEmail({ to: email, otp, expiryMinutes })

    return res.status(200).json({ 
      message: 'OTP sent for verification.',
      demoOtp: demoMailMode ? otp : undefined 
    })
  } catch (err) {
    console.error('Error in registerUser:', err)
    return res.status(500).json({ error: 'Registration failed.' })
  }
}

/**
 * POST /api/auth/verify-signup-otp
 */
export async function verifySignupOtp(req, res) {
  const { email, otp } = req.body
  try {
    const pending = await prisma.signupRequest.findUnique({ where: { email } })
    if (!pending || pending.otp !== otp || pending.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' })
    }

    const user = await prisma.user.create({
      data: { name: pending.name, email: pending.email, password: pending.password },
    })

    await prisma.signupRequest.deleteMany({ where: { email } })
    const token = await generateTokens(user, res)

    return res.status(200).json({
      message: 'Verified and logged in.',
      token,
      user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, role: user.role },
    })
  } catch (err) {
    console.error('Error in verifySignupOtp:', err)
    return res.status(500).json({ error: 'Verification failed.' })
  }
}

/**
 * POST /api/auth/login
 */
export async function loginWithPassword(req, res) {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials.' })
    }

    const token = await generateTokens(user, res)

    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, role: user.role },
    })
  } catch (err) {
    console.error('Error in loginWithPassword:', err)
    return res.status(500).json({ error: 'Login failed.' })
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshAccessToken(req, res) {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided.' })

  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })
      res.clearCookie('refreshToken')
      return res.status(401).json({ error: 'Invalid or expired refresh token.' })
    }

    const accessToken = jwt.sign(
      { id: tokenRecord.user.id, email: tokenRecord.user.email, isAdmin: tokenRecord.user.isAdmin, role: tokenRecord.user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )

    return res.status(200).json({ token: accessToken })
  } catch (err) {
    console.error('Error in refreshAccessToken:', err)
    return res.status(500).json({ error: 'Token refresh failed.' })
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  }
  res.clearCookie('refreshToken')
  return res.status(200).json({ message: 'Logged out successfully.' })
}

/**
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(200).json({ message: 'If that email exists, we sent an OTP.' })

    const otp = crypto.randomInt(100000, 999999).toString()
    await prisma.oneTimePassword.create({
      data: { email, otp, expiresAt: new Date(Date.now() + 15 * 60000) }, // 15 mins
    })

    await sendOtpEmail({ to: email, otp, expiryMinutes: 15, subject: 'Password Reset Code' })

    return res.status(200).json({ 
      message: 'Password reset OTP sent.',
      demoOtp: demoMailMode ? otp : undefined 
    })
  } catch (err) {
    console.error('Error in forgotPassword:', err)
    return res.status(500).json({ error: 'Failed to initiate password reset.' })
  }
}

/**
 * POST /api/auth/reset-password
 */
export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields are required.' })

  try {
    const record = await prisma.oneTimePassword.findFirst({
      where: { email, otp, expiresAt: { gte: new Date() } },
    })

    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP.' })

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    await prisma.oneTimePassword.deleteMany({ where: { email } })

    return res.status(200).json({ message: 'Password reset successful.' })
  } catch (err) {
    console.error('Error in resetPassword:', err)
    return res.status(500).json({ error: 'Failed to reset password.' })
  }
}
