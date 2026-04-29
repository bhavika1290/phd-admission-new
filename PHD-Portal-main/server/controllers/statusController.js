import prisma from '../services/prismaClient.js'
import { sendBulkEmail } from '../services/emailService.js'

// Get all applications with filters
export async function getAllApplications(req, res) {
  try {
    const { 
      minCGPA, category, gateScore, nbhmEligible, 
      sortBy, order, search, status, department 
    } = req.query

    const where = {}
    
    if (category) where.category = category
    if (nbhmEligible !== '') where.nbhm_eligible = nbhmEligible === 'true'
    if (status) where.status = status
    if (department) where.department_id = department
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orderBy = {}
    if (sortBy) {
      orderBy[sortBy] = order === 'asc' ? 'asc' : 'desc'
    } else {
      orderBy.created_at = 'desc'
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy,
      include: {
        user: { select: { email: true } },
        education: true,
        exam_scores: true,
      },
    })

    // Filter by GATE score
    let filtered = applications
    if (gateScore) {
      filtered = filtered.filter(app => {
        const gateScore = app.exam_scores.find(e => 
          e.exam_name === 'GATE' || e.exam_type === 'GATE'
        )
        return gateScore && gateScore.score >= parseFloat(gateScore)
      })
    }

    // Filter by CGPA
    if (minCGPA) {
      filtered = filtered.filter(app => {
        const pgEducation = app.education.find(e => e.level === 'Post Graduation')
        return pgEducation && pgEducation.score_value >= parseFloat(minCGPA)
      })
    }

    // Add computed fields
    const withComputed = filtered.map(app => {
      const gateExam = app.exam_scores.find(e => 
        e.exam_name === 'GATE' || e.exam_type === 'GATE'
      )
      const csirExam = app.exam_scores.find(e => 
        e.exam_name === 'CSIR' || e.exam_type === 'CSIR'
      )
      const pgEdu = app.education.find(e => e.level === 'Post Graduation')
      
      return {
        ...app,
        gate_score: gateExam?.score || null,
        gate_percentile: gateExam?.percentile || null,
        gate_air: gateExam?.air || null,
        csir_score: csirExam?.score || null,
        csir_percentile: csirExam?.percentile || null,
        pg_cgpa: pgEdu?.score_value || null,
        is_new_application: app.is_submitted && 
          app.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    })

    res.json({ applications: withComputed })
  } catch (error) {
    console.error('Error fetching applications:', error)
    res.status(500).json({ error: 'Failed to fetch applications' })
  }
}

// Get single application
export async function getApplication(req, res) {
  try {
    const { id } = req.params
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        education: true,
        exam_scores: true,
        status_history: { orderBy: { created_at: 'desc' } },
        interviews: { orderBy: { interview_date: 'desc' } },
      },
    })

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    res.json({ application })
  } catch (error) {
    console.error('Error fetching application:', error)
    res.status(500).json({ error: 'Failed to fetch application' })
  }
}

// Update application status
export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params
    const { status, note } = req.body
    const adminId = req.user?.id

    const validStatuses = [
      'draft', 'submitted', 'under_review', 
      'shortlisted', 'waitlisted', 'rejected', 'selected'
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const application = await prisma.application.findUnique({ where: { id } })
    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const previousStatus = application.status

    // Update application
    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        status_note: note || null,
        status_updated_at: new Date(),
      },
    })

    // Create status history
    await prisma.applicationStatusHistory.create({
      data: {
        application_id: id,
        status: previousStatus,
        new_status: status,
        note: note || null,
        updated_by: adminId,
      },
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        user_id: application.user_id,
        type: 'status_update',
        title: 'Application Status Updated',
        message: `Your application status has been updated to: ${status.replace('_', ' ')}`,
        link: '/application',
      },
    })

    // Send email notification
    try {
      await sendBulkEmail({
        to: application.email,
        subject: 'PhD Application Status Update',
        body: `<p>Dear ${application.name},</p>
          <p>Your application status has been updated to: <strong>${status.replace('_', ' ')}</strong></p>
          ${note ? `<p>Note: ${note}</p>` : ''}
          <p>Login to your portal to view details.</p>`,
      })
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError)
    }

    res.json({ application: updated })
  } catch (error) {
    console.error('Error updating status:', error)
    res.status(500).json({ error: 'Failed to update status' })
  }
}

// Bulk update status
export async function bulkUpdateStatus(req, res) {
  try {
    const { applicationIds, status, note } = req.body
    const adminId = req.user?.id

    if (!applicationIds || !Array.isArray(applicationIds)) {
      return res.status(400).json({ error: 'Application IDs required' })
    }

    const validStatuses = [
      'draft', 'submitted', 'under_review', 
      'shortlisted', 'waitlisted', 'rejected', 'selected'
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const results = []
    for (const appId of applicationIds) {
      const application = await prisma.application.findUnique({ where: { id: appId } })
      if (application) {
        const previousStatus = application.status
        
        await prisma.application.update({
          where: { id: appId },
          data: {
            status,
            status_note: note || null,
            status_updated_at: new Date(),
          },
        })

        await prisma.applicationStatusHistory.create({
          data: {
            application_id: appId,
            status: previousStatus,
            new_status: status,
            note: note || null,
            updated_by: adminId,
          },
        })

        results.push(appId)
      }
    }

    res.json({ 
      success: true, 
      updated: results.length,
      applicationIds: results 
    })
  } catch (error) {
    console.error('Error in bulk status update:', error)
    res.status(500).json({ error: 'Failed to update statuses' })
  }
}

// Get application statistics
export async function getApplicationStats(req, res) {
  try {
    const applications = await prisma.application.findMany({
      where: { is_submitted: true },
      include: {
        exam_scores: true,
        education: true,
      },
    })

    const stats = {
      total: applications.length,
      byStatus: {},
      byCategory: {},
      eligible: 0,
      nbhm: 0,
      avgGateScore: 0,
      gateScores: [],
    }

    let totalGateScore = 0
    let gateCount = 0

    applications.forEach(app => {
      // By status
      stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1
      
      // By category
      stats.byCategory[app.category] = (stats.byCategory[app.category] || 0) + 1
      
      // Eligibility
      if (app.eligibility_status === 'Eligible') stats.eligible++
      if (app.nbhm_eligible) stats.nbhm++

      // GATE scores
      const gateExam = app.exam_scores.find(e => 
        e.exam_name === 'GATE' || e.exam_type === 'GATE'
      )
      if (gateExam?.score) {
        totalGateScore += gateExam.score
        gateCount++
        stats.gateScores.push(gateExam.score)
      }
    })

    stats.avgGateScore = gateCount > 0 ? (totalGateScore / gateCount).toFixed(2) : 0

    res.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
}

// Get department-wise stats
export async function getDepartmentStats(req, res) {
  try {
    const departments = await prisma.department.findMany({
      where: { is_active: true },
    })

    const stats = await Promise.all(
      departments.map(async (dept) => {
        const count = await prisma.application.count({
          where: { department_id: dept.id, is_submitted: true },
        })
        return { department: dept.name, count }
      })
    )

    res.json({ departmentStats: stats })
  } catch (error) {
    console.error('Error fetching department stats:', error)
    res.status(500).json({ error: 'Failed to fetch department stats' })
  }
}