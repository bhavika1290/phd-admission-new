import prisma from '../services/prismaClient.js'


// Get all announcements
export async function getAnnouncements(req, res) {
  try {
    const now = new Date()
    
    const announcements = await prisma.announcement.findMany({
      where: {
        is_active: true,
        OR: [
          { start_date: null },
          { start_date: { lte: now } },
        ],
      },
      orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
    })

    res.json({ announcements })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    res.status(500).json({ error: 'Failed to fetch announcements' })
  }
}

// Create announcement
export async function createAnnouncement(req, res) {
  try {
    const { title, content, priority, is_active, start_date, end_date } = req.body
    const userId = req.user?.id

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority || 'normal',
        is_active: is_active !== false,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        created_by: userId,
      },
    })

    // Notify all applicants
    const applications = await prisma.application.findMany({
      where: { is_submitted: true },
      select: { user_id: true, email: true, name: true },
    })

    // Create in-app notifications
    const notifications = applications.map(app => ({
      user_id: app.user_id,
      type: 'announcement',
      title: 'New Announcement',
      message: title,
      link: '/',
    }))

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications })
    }

    res.json({ announcement })
  } catch (error) {
    console.error('Error creating announcement:', error)
    res.status(500).json({ error: 'Failed to create announcement' })
  }
}

// Update announcement
export async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params
    const { title, content, priority, is_active, start_date, end_date } = req.body

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(priority && { priority }),
        ...(is_active !== undefined && { is_active }),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
      },
    })

    res.json({ announcement })
  } catch (error) {
    console.error('Error updating announcement:', error)
    res.status(500).json({ error: 'Failed to update announcement' })
  }
}

// Delete announcement
export async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params

    await prisma.announcement.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    res.status(500).json({ error: 'Failed to delete announcement' })
  }
}