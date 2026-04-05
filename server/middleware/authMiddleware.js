import jwt from 'jsonwebtoken'
import prisma from '../services/prismaClient.js'
import 'dotenv/config'

/**
 * Verifies the Bearer JWT issued by our own backend.
 * Attaches req.user = { id, email, isAdmin } on success.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    req.token = token
    next()
  } catch (error) {
    console.error('JWT Verification failed:', error.message)
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

/**
 * Middleware that requires the authenticated user to be an admin.
 * Must be used AFTER authenticate().
 */
export async function requireAdmin(req, res, next) {
  // We can trust the JWT since it's signed by us
  if (!req.user.isAdmin) {
    // Check DB as a fallback or secondary verification
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: admin access required.' })
    }
  }
  
  next()
}
