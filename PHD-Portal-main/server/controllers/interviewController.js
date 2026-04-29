import prisma from '../services/prismaClient.js'
import { sendBulkEmail } from '../services/emailService.js'

// Schedule interview
export async function scheduleInterview(req, res) {
  try {
    const { application_id, interview_date, time_slot, venue, mode, meeting_link } = req.body

    const interview = await prisma.interview.create({
      data: {
        application_id,
        interview_date: new Date(interview_date),
        time_slot,
        venue: venue || null,
        mode: mode || 'offline',
        meeting_link: meeting_link || null,
      },
      include: { application: true },
    })

    // Send notification to student
    await prisma.notification.create({
      data: {
        user_id: interview.application.user_id,
        type: 'reminder',
        title: 'Interview Scheduled',
        message: `Your interview has been scheduled for ${new Date(interview_date).toLocaleDateString()} at ${time_slot}`,
        link: '/application',
      },
    })

    // Send email
    try {
      await sendBulkEmail({
        to: interview.application.email,
        subject: 'PhD Interview Scheduled',
        body: `<p>Dear ${interview.application.name},</p>
          <p>Your interview has been scheduled:</p>
          <ul>
            <li>Date: ${new Date(interview_date).toLocaleDateString()}</li>
            <li>Time: ${time_slot}</li>
            <li>Venue: ${venue || 'To be announced'}</li>
            ${meeting_link ? `<li>Meeting Link: <a href="${meeting_link}">${meeting_link}</a></li>` : ''}
          </ul>
          <p>Please login to your portal for more details.</p>`,
      })
    } catch (emailError) {
      console.error('Failed to send interview email:', emailError)
    }

    res.json({ interview })
  } catch (error) {
    console.error('Error scheduling interview:', error)
    res.status(500).json({ error: 'Failed to schedule interview' })
  }
}

// Update interview
export async function updateInterview(req, res) {
  try {
    const { id } = req.params
    const { interview_date, time_slot, venue, mode, meeting_link, status, feedback, score } = req.body

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        ...(interview_date && { interview_date: new Date(interview_date) }),
        ...(time_slot && { time_slot }),
        ...(venue !== undefined && { venue }),
        ...(mode && { mode }),
        ...(meeting_link !== undefined && { meeting_link }),
        ...(status && { status }),
        ...(feedback !== undefined && { feedback }),
        ...(score && { score }),
      },
    })

    res.json({ interview })
  } catch (error) {
    console.error('Error updating interview:', error)
    res.status(500).json({ error: 'Failed to update interview' })
  }
}

// Get interviews for application
export async function getInterviewsByApplication(req, res) {
  try {
    const { applicationId } = req.params

    const interviews = await prisma.interview.findMany({
      where: { application_id: applicationId },
      orderBy: { interview_date: 'desc' },
    })

    res.json({ interviews })
  } catch (error) {
    console.error('Error fetching interviews:', error)
    res.status(500).json({ error: 'Failed to fetch interviews' })
  }
}

// Get all interviews (admin)
export async function getAllInterviews(req, res) {
  try {
    const { status, dateFrom, dateTo } = req.query

    const where = {}
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.interview_date = {}
      if (dateFrom) where.interview_date.gte = new Date(dateFrom)
      if (dateTo) where.interview_date.lte = new Date(dateTo)
    }

    const interviews = await prisma.interview.findMany({
      where,
      orderBy: { interview_date: 'asc' },
      include: {
        application: { select: { name: true, email: true } },
      },
    })

    res.json({ interviews })
  } catch (error) {
    console.error('Error fetching interviews:', error)
    res.status(500).json({ error: 'Failed to fetch interviews' })
  }
}

// Delete interview
export async function deleteInterview(req, res) {
  try {
    const { id } = req.params

    await prisma.interview.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting interview:', error)
    res.status(500).json({ error: 'Failed to delete interview' })
  }
}