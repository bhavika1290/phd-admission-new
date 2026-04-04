import React, { createContext, useContext, useEffect, useState } from 'react'
import { checkIsAdmin } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isAdmin, setIsAdmin]   = useState(false)
  const [loading, setLoading]   = useState(true)

  const login = (token, userData) => {
    localStorage.setItem('phd_token', token)
    setUser(userData)
    setIsAdmin(userData.isAdmin || false)
  }

  const logout = () => {
    localStorage.removeItem('phd_token')
    setUser(null)
    setIsAdmin(false)
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('phd_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      // Use the existing checkIsAdmin endpoint but rename its purpose to 'verifyToken'
      const res = await checkIsAdmin()
      if (res.data) {
        setUser(res.data.user || { id: res.data.userId }) // Fallback for various backend responses
        setIsAdmin(res.data.isAdmin === true)
      }
    } catch (err) {
      console.error('Auth verification failed:', err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout, signOut: logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
