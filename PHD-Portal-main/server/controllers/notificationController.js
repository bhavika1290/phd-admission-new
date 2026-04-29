import prisma from '../services/prismaClient.js'


// Get all notifications for user
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id
    const { unreadOnly } = req.query

    const where = { user_id: userId }
    if (unreadOnly === 'true') {
      where.is_read = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({
      where: { user_id: userId, is_read: false },
    })

    res.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}

// Mark notification as read
export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params

    await prisma.notification.update({
      where: { id },
      data: { is_read: true },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error marking notification read:', error)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user.id

    await prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications read:', error)
    res.status(500).json({ error: 'Failed to mark all notifications as read' })
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params

    await prisma.notification.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ error: 'Failed to delete notification' })
  }
}

// Create notification (admin)
export async function createNotification(req, res) {
  try {
    const { user_id, type, title, message, link } = req.body

    const notification = await prisma.notification.create({
      data: { user_id, type, title, message, link },
    })

    res.json({ notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    res.status(500).json({ error: 'Failed to create notification' })
  }
}

// Broadcast notification to all applicants
export async function broadcastNotification(req, res) {
  try {
    const { type, title, message, link } = req.body

    const applications = await prisma.application.findMany({
      where: { is_submitted: true },
      select: { user_id: true },
    })

    const notifications = applications.map(app => ({
      user_id: app.user_id,
      type: type || 'announcement',
      title,
      message,
      link: link || null,
    }))

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications })
    }

    res.json({ success: true, count: notifications.length })
  } catch (error) {
    console.error('Error broadcasting notification:', error)
    res.status(500).json({ error: 'Failed to broadcast notification' })
  }
}