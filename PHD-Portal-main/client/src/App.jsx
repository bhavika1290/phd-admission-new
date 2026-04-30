import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Landing from './pages/Landing'
import ApplicationForm from './pages/ApplicationForm'
import PaymentPage from './pages/PaymentPage'
import AdminLayout from './pages/AdminLayout'
import AdminApplicants from './pages/AdminApplicants'
import StudentDashboard from './pages/StudentDashboard'
import NotificationsPage from './pages/NotificationsPage'
import GuidelinesPage from './pages/GuidelinesPage'
import AdminDashboard from './pages/AdminDashboard'

// Admin Components (rendered as pages via Outlet)
import AdminAnalytics from './components/AdminAnalytics'
import AdminStatusManagement from './components/AdminStatusManagement'
import AdminEmailBulkSender from './components/AdminEmailBulkSender'
import AdminEmailTemplates from './components/AdminEmailTemplates'

import LoadingScreen from './components/LoadingScreen'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />
  if (!requireAdmin && isAdmin) return <Navigate to="/admin" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/guidelines" element={<GuidelinesPage />} />
      
      {/* Student Routes */}
      <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

      {/* Dedicated admin sub-pages via layout shell */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="applicants" element={<AdminApplicants />} />
        <Route path="status" element={<AdminStatusManagement />} />
        <Route path="bulk-email" element={<AdminEmailBulkSender />} />
        <Route path="templates" element={<AdminEmailTemplates />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#003366',
              color: '#F0F9FF',
              border: '1px solid rgba(240, 249, 255, 0.2)',
              borderRadius: '24px',
              fontSize: '11px',
              padding: '18px 32px',
              fontFamily: 'inherit',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              boxShadow: '0 30px 60px rgba(0, 31, 63, 0.2)',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
