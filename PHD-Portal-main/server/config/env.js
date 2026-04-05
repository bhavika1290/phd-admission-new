import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

function isPlaceholder(value) {
  if (!value) return true
  const normalized = value.trim().toLowerCase()
  return (
    normalized.startsWith('your_') ||
    normalized.includes('<ref>') ||
    normalized.includes('<password>') ||
    normalized.includes('<host>') ||
    normalized.includes('example') ||
    normalized.includes('placeholder')
  )
}

function setDefault(key, value) {
  if (isPlaceholder(process.env[key])) {
    process.env[key] = value
  }
}

dotenv.config({
  path: fileURLToPath(new URL('../.env', import.meta.url)),
})

setDefault('DATABASE_URL', 'file:./dev.db')
setDefault('JWT_SECRET', 'phd-portal-dev-secret')
setDefault('PORT', '5000')
setDefault('CLIENT_URL', 'http://localhost:5173')