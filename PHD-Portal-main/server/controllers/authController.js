import jwt from 'jsonwebtoken'
import prisma from '../services/prismaClient.js'
import crypto from 'crypto'
import '../config/env.js'
import { demoMailMode, sendOtpEmail } from '../services/emailService.js'

/**
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit OTP to the user's email.
 */
export async function sendOtp(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const otp = crypto.randomInt(100000, 999999).toString()
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10
  const expiresAt = new Date(Date.now() + expiryMinutes * 60000)

  try {
    // 1. Save or Update OTP in DB
    await prisma.oneTimePassword.create({
      data: { email, otp, expiresAt },
    })

    await sendOtpEmail({ to: email, otp, expiryMinutes })
    if (demoMailMode) {
      console.log(`DEV OTP for ${email}: ${otp}`)
      return res.status(200).json({
        message: 'OTP sent successfully in local demo mode.',
        demoOtp: otp,
      })
    }

    return res.status(200).json({ message: 'OTP sent successfully.' })
  } catch (err) {
    console.error('Error in sendOtp:', err)
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' })
  }
}

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP and issues a JWT.
 */
export async function verifyOtp(req, res) {
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' })

  try {
    // 1. Find the latest unexpired OTP for this email
    const record = await prisma.oneTimePassword.findFirst({
      where: {
        email,
        otp,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' })
    }

    // 2. Consume the OTP (delete all OTPs for this email to be secure)
    await prisma.oneTimePassword.deleteMany({ where: { email } })

    // 3. Find or Create User
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { email },
      })
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    })
  } catch (err) {
    console.error('Error in verifyOtp:', err)
    return res.status(500).json({ error: 'Authentication failed.' })
  }
}
