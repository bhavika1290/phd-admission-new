import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import prisma from '../services/prismaClient.js'
import crypto from 'crypto'
import 'dotenv/config'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

/**
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit OTP to the user's email.
 */
export async function sendOtp(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const otp = crypto.randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60000)

  try {
    // 1. Save or Update OTP in DB
    await prisma.oneTimePassword.create({
      data: { email, otp, expiresAt },
    })

    // 2. Send Email
    const mailOptions = {
      from: `"PhD Portal Admissions" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your PhD Portal Login Code',
      text: `Your login code is: ${otp}. It will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #6366f1;">PhD Admission Portal</h2>
          <p>You requested a login code for the Mathematics Department PhD Admission Portal.</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
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
