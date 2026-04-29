import express from 'express'
import { 
  sendOtp, 
  verifyOtp, 
  registerUser, 
  verifySignupOtp, 
  loginWithPassword,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js'

const router = express.Router()

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/register', registerUser)
router.post('/verify-signup-otp', verifySignupOtp)
router.post('/login', loginWithPassword)
router.post('/refresh', refreshAccessToken)
router.post('/logout', logout)

// Password Reset
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router
