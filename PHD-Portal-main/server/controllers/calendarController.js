import prisma from '../services/prismaClient.js'

// Get all calendar events
export async function getCalendarEvents(req, res) {
  try {
    const now = new Date()
    
    const events = await prisma.admissionCalendar.findMany({
      where: {
        is_active: true,
        OR: [
          { event_date: { gte: now } },
          { event_date: null },
        ],
      },
      orderBy: { event_date: 'asc' },
    })

    res.json({ events })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    res.status(500).json({ error: 'Failed to fetch calendar events' })
  }
}

// Create calendar event
export async function createCalendarEvent(req, res) {
  try {
    const { title, description, event_type, event_date } = req.body

    const event = await prisma.admissionCalendar.create({
      data: {
        title,
        description: description || null,
        event_type,
        event_date: event_date ? new Date(event_date) : null,
      },
    })

    res.json({ event })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    res.status(500).json({ error: 'Failed to create calendar event' })
  }
}

// Update calendar event
export async function updateCalendarEvent(req, res) {
  try {
    const { id } = req.params
    const { title, description, event_type, event_date, is_active } = req.body

    const event = await prisma.admissionCalendar.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(event_type && { event_type }),
        ...(event_date && { event_date: new Date(event_date) }),
        ...(is_active !== undefined && { is_active }),
      },
    })

    res.json({ event })
  } catch (error) {
    console.error('Error updating calendar event:', error)
    res.status(500).json({ error: 'Failed to update calendar event' })
  }
}

// Delete calendar event
export async function deleteCalendarEvent(req, res) {
  try {
    const { id } = req.params

    await prisma.admissionCalendar.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    res.status(500).json({ error: 'Failed to delete calendar event' })
  }
}