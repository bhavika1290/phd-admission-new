import prisma from '../services/prismaClient.js'
import { evaluateEligibility, validateExamDetails, formatExamLabel } from '../services/applicationRules.js'
import { sendSubmissionNotificationEmails, sendFinalConfirmationEmail } from '../services/emailService.js'

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function combineName(firstName, lastName, fallbackName = '') {
  const parts = [firstName, lastName].map((part) => String(part || '').trim()).filter(Boolean)
  if (parts.length) return parts.join(' ')
  return String(fallbackName || '').trim()
}

function normalizeEducationEntry(entry) {
  return {
    level: entry.level,
    board: entry.board || null,
    degree_name: entry.degree_name || null,
    custom_degree_name: entry.custom_degree_name || null,
    cfti_status: entry.cfti_status || null,
    discipline: entry.discipline || null,
    institute: entry.institute || null,
    study_type: entry.study_type || null,
    year: toNumber(entry.year),
    year_of_passing: toNumber(entry.year_of_passing ?? entry.year),
    score_type: entry.score_type || null,
    score_value: toNumber(entry.score_value),
    division: entry.division || null,
  }
}

function normalizeExamEntry(entry) {
  return {
    exam_type: entry.exam_name || entry.exam_type || null,
    exam_name: entry.exam_name || entry.exam_type || null,
    custom_exam_name: entry.custom_exam_name || null,
    branch: entry.branch || null,
    year: toNumber(entry.year),
    valid_upto: entry.valid_upto || null,
    percentile: toNumber(entry.percentile),
    rank: toNumber(entry.rank),
    score: toNumber(entry.score),
    air: toNumber(entry.air),
    duration: entry.duration || null,
  }
}

function formatEducationSummary(entries = [], level) {
  return entries
    .filter((entry) => entry.level === level)
    .map((entry) => ({
      board: entry.board || null,
      degree_name: entry.degree_name || null,
      custom_degree_name: entry.custom_degree_name || null,
      cfti_status: entry.cfti_status || null,
      discipline: entry.discipline || null,
      institute: entry.institute || null,
      study_type: entry.study_type || null,
      year_of_passing: entry.year_of_passing ?? entry.year ?? null,
      score_type: entry.score_type || null,
      score_value: entry.score_value ?? null,
      division: entry.division || null,
    }))
}

function formatExamSummary(entries = []) {
  return entries.map((entry) => ({
    exam_name: formatExamLabel(entry),
    custom_exam_name: entry.custom_exam_name || null,
    score: entry.score ?? null,
    percentile: entry.percentile ?? null,
    rank: entry.rank ?? null,
    air: entry.air ?? null,
    year: entry.year ?? null,
    branch: entry.branch || null,
    valid_upto: entry.valid_upto || null,
    duration: entry.duration || null,
  }))
}

function buildEligibilityResult(body) {
  const education = Array.isArray(body.education) ? body.education : []
  const eligibility = evaluateEligibility({
    category: body.category,
    education,
  })

  return eligibility
}

function normalizeApplicationPayload(body, userEmail) {
  const firstName = String(body.first_name || '').trim()
  const lastName = String(body.last_name || '').trim()
  const fullName = combineName(firstName, lastName, body.name || '')
  const researchPref1 = String(body.research_pref_1 || body.research_area || '').trim()
  const researchPref2 = String(body.research_pref_2 || '').trim() || null
  const email = String(body.email || '').trim() || null
  const examEntries = body.exam_details?.length ? body.exam_details : body.exam_scores || []

  return {
    first_name: firstName || null,
    last_name: lastName || null,
    gender: body.gender || null,
    email: email || userEmail,
    name: fullName,
    dob: body.dob ? new Date(body.dob) : null,
    category: body.category || null,
    marital_status: body.marital_status || null,
    nationality: body.nationality || 'Indian',
    research_area: researchPref1 || null,
    research_pref_1: researchPref1 || null,
    research_pref_2: researchPref2,
    study_mode: body.study_mode || null,
    address: body.address || null,
    phone: body.phone || null,
    declaration_accepted: !!body.declaration_accepted,
    nbhm_eligible: !!body.nbhm_eligible,
    eligibility_status: 'Eligible',
    eligibility_message: 'Meets configured eligibility criteria.',
    education: (body.education || []).map(normalizeEducationEntry),
    exam_details: examEntries.map(normalizeExamEntry),
  }
}

async function writeApplicationRelations(tx, applicationId, education = [], examDetails = []) {
  await tx.education.deleteMany({ where: { application_id: applicationId } })
  const educationRows = education
    .filter((entry) => entry.level)
    .map((entry) => ({
      application_id: applicationId,
      level: entry.level,
      board: entry.board,
      degree_name: entry.degree_name,
      custom_degree_name: entry.custom_degree_name,
      cfti_status: entry.cfti_status,
      discipline: entry.discipline,
      institute: entry.institute,
      study_type: entry.study_type || 'Regular',
      year: entry.year,
      year_of_passing: entry.year_of_passing,
      score_type: entry.score_type,
      score_value: entry.score_value,
      division: entry.division,
    }))

  if (educationRows.length) {
    await tx.education.createMany({ data: educationRows })
  }

  await tx.examScore.deleteMany({ where: { application_id: applicationId } })
  const examRows = examDetails
    .filter((entry) => entry.exam_name)
    .map((entry) => ({
      application_id: applicationId,
      exam_type: entry.exam_name,
      exam_name: entry.exam_name,
      custom_exam_name: entry.custom_exam_name,
      branch: entry.branch,
      year: entry.year,
      valid_upto: entry.valid_upto,
      percentile: entry.percentile,
      rank: entry.rank,
      score: entry.score,
      air: entry.air,
      duration: entry.duration,
    }))

  if (examRows.length) {
    await tx.examScore.createMany({ data: examRows })
  }
}

// ─── Fetch flattened application data ─────────────
export async function fetchFlatApplications(params = {}) {
  const where = {}

  if (params.status && params.status !== 'all') {
    where.status = params.status
  }

  if (params.category && params.category !== 'all') {
    where.category = params.category
  }

  if (params.studyMode && params.studyMode !== 'all') {
    where.study_mode = params.studyMode
  }

  if (params.eligibilityStatus && params.eligibilityStatus !== 'all') {
    where.eligibility_status = params.eligibilityStatus
  }

  if (params.nbhmEligible === 'true') {
    where.nbhm_eligible = true
  }

  if (params.nbhmEligible === 'false') {
    where.nbhm_eligible = false
  }

  if (params.minCgpa) {
     where.education = {
       some: {
         level: 'Graduation',
         score_value: { gte: parseFloat(params.minCgpa) }
       }
     }
  }

  if (params.gateScore) {
    where.exam_scores = {
      some: {
        OR: [
          { exam_type: 'GATE' },
          { exam_name: 'GATE' },
        ],
        score: { gte: parseFloat(params.gateScore) },
      },
    }
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
      { transaction_id: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  const sortCol = params.sortBy || 'created_at'
  const direction = params.order || 'desc'
  const validSortCols = ['name', 'created_at', 'category', 'merit_score', 'rank']
  const orderBy = validSortCols.includes(sortCol) ? { [sortCol]: direction } : { created_at: 'desc' }

  const take = parseInt(params.limit) || undefined
  const skip = parseInt(params.offset) || undefined

  const [applications, totalCount] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        education: true,
        exam_scores: true,
      },
    }),
    prisma.application.count({ where })
  ])

  const mapped = applications.map((app) => {
    const education = app.education || []
    const exams = app.exam_scores || []
    const isNewApplication = Date.now() - new Date(app.created_at).getTime() < 24 * 60 * 60 * 1000

    const researchArea = app.research_pref_1 || app.research_area || 'Not specified'

    return {
      id: app.id,
      user_id: app.user_id,
      first_name: app.first_name || '',
      last_name: app.last_name || '',
      full_name: combineName(app.first_name, app.last_name, app.name),
      gender: app.gender || '',
      email: app.email || '',
      name: app.name,
      dob: app.dob,
      category: app.category,
      marital_status: app.marital_status,
      nationality: app.nationality,
      research_area: researchArea,
      research_pref_1: app.research_pref_1 || researchArea,
      research_pref_2: app.research_pref_2 || '',
      study_mode: app.study_mode || '',
      address: app.address,
      phone: app.phone,
      status: app.status || 'pending',
      declaration_accepted: app.declaration_accepted,
      nbhm_eligible: app.nbhm_eligible,
      eligibility_status: app.eligibility_status || 'Pending',
      eligibility_message: app.eligibility_message || '',
      is_new_application: isNewApplication,
      created_at: app.created_at,
      updated_at: app.updated_at,
      merit_score: app.merit_score,
      rank: app.rank,
      education,
      exam_details: formatExamSummary(exams),
      exam_scores: exams.map((entry) => ({
        ...entry,
        exam_name: formatExamLabel(entry),
      })),
      education_summary: {
        tenth: formatEducationSummary(education, '10th'),
        twelfth: formatEducationSummary(education, '12th'),
        graduation: formatEducationSummary(education, 'Graduation'),
        postGraduation: formatEducationSummary(education, 'Post Graduation'),
      },
      pct_10th: education.find((entry) => entry.level === '10th')?.score_value || null,
      pct_12th: education.find((entry) => entry.level === '12th')?.score_value || null,
      pct_grad: education.find((entry) => entry.level === 'Graduation')?.score_value || null,
      pct_pg: education.filter((entry) => entry.level === 'Post Graduation').map(e => e.score_value),
    }
  })

  return { applications: mapped, total: totalCount }
}

// ─── Merit Calculation ──────────────────────────────────────
export async function calculateMeritList(req, res) {
  try {
    const applications = await prisma.application.findMany({
      where: { is_submitted: true, eligibility_status: 'Eligible' },
      include: { education: true, exam_scores: true }
    })

    const scored = applications.map(app => {
      let score = 0
      // 50% GATE Score (assuming score out of 1000)
      const gate = app.exam_scores.find(e => formatExamLabel(e) === 'GATE')
      if (gate && gate.score) score += (gate.score / 1000) * 50

      // 20% PG Percentage
      const pg = app.education.find(e => e.level === 'Post Graduation')
      if (pg && pg.score_value) score += (pg.score_value / 100) * 20

      // 20% Graduation Percentage
      const grad = app.education.find(e => e.level === 'Graduation')
      if (grad && grad.score_value) score += (grad.score_value / 100) * 20

      // 10% 12th Percentage
      const twelfth = app.education.find(e => e.level === '12th')
      if (twelfth && twelfth.score_value) score += (twelfth.score_value / 100) * 10

      return { id: app.id, score }
    })

    scored.sort((a, b) => b.score - a.score)

    await prisma.$transaction(
      scored.map((item, index) => 
        prisma.application.update({
          where: { id: item.id },
          data: { merit_score: item.score, rank: index + 1 }
        })
      )
    )

    return res.status(200).json({ message: 'Merit list generated successfully.', count: scored.length })
  } catch (err) {
    console.error('Error in calculateMeritList:', err)
    return res.status(500).json({ error: 'Failed to generate merit list.' })
  }
}

// ─── Controllers ─────────────────────────────────────────────

/**
 * POST /api/application
 */
export async function submitApplication(req, res) {
  const userId = req.user.id
  const userEmail = req.user.email
  const body = req.validatedBody

  try {
    const examEntries = body.exam_details?.length ? body.exam_details : body.exam_scores || []
    const examValidation = validateExamDetails(examEntries)
    if (!examValidation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: { exam_details: examValidation.issues },
      })
    }

    const eligibility = buildEligibilityResult(body)
    const normalized = normalizeApplicationPayload(body, userEmail)
    normalized.eligibility_status = eligibility.eligible ? 'Eligible' : 'Ineligible'
    normalized.eligibility_message = eligibility.eligible 
      ? 'Meets configured eligibility criteria.' 
      : (eligibility.issues || []).join('; ')

    const { education, exam_details, ...applicationData } = normalized

    const applicationId = await prisma.$transaction(async (tx) => {
      const app = await tx.application.upsert({
        where: { user_id: userId },
        update: { ...applicationData, updated_at: new Date() },
        create: { user_id: userId, ...applicationData, created_at: new Date(), updated_at: new Date() },
      })

      await writeApplicationRelations(tx, app.id, education, exam_details)
      return app.id
    })

    return res.status(200).json({ message: 'Application saved.', id: applicationId })
  } catch (err) {
    console.error('submitApplication error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

/**
 * POST /api/application/finalize
 */
export async function finalizeApplication(req, res) {
  const userId = req.user.id
  const { transaction_id, payment_date } = req.body

  if (!transaction_id || !payment_date) {
    return res.status(400).json({ error: 'Transaction ID and Date are required.' })
  }

  try {
    const existing = await prisma.application.findUnique({ where: { user_id: userId } })
    if (!existing) return res.status(404).json({ error: 'Application not found.' })
    if (existing.is_submitted) return res.status(400).json({ error: 'Already submitted.' })

    const updated = await prisma.application.update({
      where: { id: existing.id },
      data: {
        transaction_id,
        payment_date: new Date(payment_date),
        is_submitted: true,
        updated_at: new Date(),
      },
    })

    const adminUsers = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { email: true },
    })

    await sendSubmissionNotificationEmails({
      studentEmail: updated.email,
      studentName: updated.name,
      applicationId: updated.id,
      researchPref1: updated.research_pref_1 || updated.research_area,
      eligibilityStatus: updated.eligibility_status,
      adminEmails: adminUsers.map((admin) => admin.email),
    })

    return res.status(200).json({ message: 'Final submission successful!', application: updated })
  } catch (err) {
    console.error('finalizeApplication error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

/**
 * GET /api/application/me
 */
export async function getMyApplication(req, res) {
  const userId = req.user.id
  try {
    const data = await prisma.application.findUnique({
      where: { user_id: userId },
      include: { education: true, exam_scores: true, messages: { orderBy: { createdAt: 'asc' } }, interview_slot: true },
    })
    return res.status(200).json({ application: data || null })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/applications
 */
export async function getAllApplications(req, res) {
  try {
    const result = await fetchFlatApplications(req.query)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * PATCH /api/admin/application/:applicationId/payment
 * Admin: verify or reject a payment transaction
 */
export async function updatePaymentStatus(req, res) {
  const { applicationId } = req.params
  const { payment_status } = req.body

  const allowed = ['pending', 'initiated', 'completed', 'failed']
  if (!allowed.includes(payment_status)) {
    return res.status(400).json({ error: `Invalid payment_status. Must be one of: ${allowed.join(', ')}` })
  }

  try {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { payment_status },
    })
    return res.status(200).json({ success: true, payment_status: updated.payment_status })
  } catch (err) {
    console.error('updatePaymentStatus error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
