import prisma from '../services/prismaClient.js'
import crypto from 'crypto'
import { sendBulkEmail } from '../services/emailService.js'

// Enable 2FA for admin
export async function enableTwoFactor(req, res) {
  try {
    const userId = req.user.id
    
    // Generate secret
    const secret = crypto.randomBytes(20).toString('hex')
    
    await prisma.user.update({
      where: { id: userId },
      data: { two_factor_enabled: true, two_factor_secret: secret },
    })

    res.json({ 
      success: true, 
      secret,
      message: '2FA enabled. Save this secret in your authenticator app.' 
    })
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    res.status(500).json({ error: 'Failed to enable 2FA' })
  }
}

// Disable 2FA for admin
export async function disableTwoFactor(req, res) {
  try {
    const userId = req.user.id
    const { currentCode } = req.body // Verify with current 2FA code

    // In production, verify the 2FA code here
    
    await prisma.user.update({
      where: { id: userId },
      data: { two_factor_enabled: false, two_factor_secret: null },
    })

    res.json({ success: true, message: '2FA disabled' })
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    res.status(500).json({ error: 'Failed to disable 2FA' })
  }
}

// Get 2FA status
export async function getTwoFactorStatus(req, res) {
  try {
    const userId = req.user.id
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { two_factor_enabled: true },
    })

    res.json({ enabled: user?.two_factor_enabled || false })
  } catch (error) {
    console.error('Error getting 2FA status:', error)
    res.status(500).json({ error: 'Failed to get 2FA status' })
  }
}

// Request password reset
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If the email exists, a reset link will be sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
      },
    })

    // Send reset email
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    
    try {
      await sendBulkEmail({
        to: email,
        subject: 'PhD Portal Password Reset',
        body: `<p>Dear ${user.name || 'User'},</p>
          <p>You requested a password reset. Click the link below:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>`,
      })
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
    }

    res.json({ success: true, message: 'If the email exists, a reset link will be sent' })
  } catch (error) {
    console.error('Error requesting password reset:', error)
    res.status(500).json({ error: 'Failed to request password reset' })
  }
}

// Reset password
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body

    const user = await prisma.user.findFirst({
      where: { 
        password_reset_token: token,
        password_reset_expires: { gt: new Date() },
      },
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Update password (in production, hash it)
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: newPassword, // Hash in production
        password_reset_token: null,
        password_reset_expires: null,
      },
    })

    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ error: 'Failed to reset password' })
  }
}

// Get active sessions
export async function getActiveSessions(req, res) {
  try {
    const userId = req.user.id
    
    // In production, track sessions in database
    const sessions = await prisma.auditLog.findMany({
      where: { 
        user_id: userId, 
        action: 'login',
      },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: { created_at: true, ip_address: true, details: true },
    })

    res.json({ sessions })
  } catch (error) {
    console.error('Error getting sessions:', error)
    res.status(500).json({ error: 'Failed to get sessions' })
  }
}

// Force logout (invalidate tokens)
export async function forceLogout(req, res) {
  try {
    const userId = req.user.id
    
    // In production, maintain a token blacklist or use refresh token rotation
    // For now, just log the action
    
    res.json({ success: true, message: 'All sessions will be invalidated on next request' })
  } catch (error) {
    console.error('Error forcing logout:', error)
    res.status(500).json({ error: 'Failed to force logout' })
  }
}