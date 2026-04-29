import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Bell, Check, Trash2, Loader2, ChevronLeft,
  FileText, AlertCircle, Calendar, Mail
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { 
  getNotifications, 
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification 
} from '../services/api'
import LoadingScreen from '../components/LoadingScreen'

const NOTIFICATION_ICONS = {
  status_update: FileText,
  reminder: AlertCircle,
  announcement: Bell,
  calendar: Calendar,
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await getNotifications()
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    setProcessing(id)
    try {
      await markNotificationRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to mark as read')
    } finally {
      setProcessing(null)
    }
  }

  const handleMarkAllRead = async () => {
    setProcessing('all')
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (id) => {
    setProcessing(id)
    try {
      await deleteNotification(id)
      setNotifications(prev => {
        const deleted = prev.find(n => n.id === id)
        if (deleted && !deleted.is_read) {
          setUnreadCount(prev => Math.max(0, unreadCount - 1))
        }
        return prev.filter(n => n.id !== id)
      })
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    } finally {
      setProcessing(null)
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkRead(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-white" />
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                {unreadCount > 0 && (
                  <p className="text-xs text-white/40">{unreadCount} unread</p>
                )}
              </div>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={processing === 'all'}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              {processing === 'all' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Mark All Read
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Bell
              const isProcessing = processing === notification.id

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`glass-card p-4 cursor-pointer transition-all ${
                    notification.is_read 
                      ? 'opacity-60 hover:opacity-80' 
                      : 'border-l-4 border-l-primary-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      notification.is_read ? 'bg-white/5' : 'bg-primary-600/20'
                    }`}>
                      <Icon size={18} className={
                        notification.is_read ? 'text-white/40' : 'text-primary-400'
                      } />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-medium ${
                            notification.is_read ? 'text-white/60' : 'text-white'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-white/50 text-sm mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          disabled={isProcessing}
                          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors"
                        >
                          {isProcessing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                      
                      <p className="text-white/30 text-xs mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/50">No notifications yet</p>
            <p className="text-white/30 text-sm mt-1">
              You'll receive updates about your application here
            </p>
          </div>
        )}
      </main>
    </div>
  )
}