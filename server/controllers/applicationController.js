import prisma from '../services/prismaClient.js'

// ─── Fetch flattened application data ─────────────

export async function fetchFlatApplications(params = {}) {
  let where = {}

  if (params.category) {
    where.category = params.category
  }
  if (params.nbhmEligible === 'true') {
    where.nbhm_eligible = true
  }
  if (params.nbhmEligible === 'false') {
    where.nbhm_eligible = false
  }

  // GATE/CSIR score filtering
  if (params.gateScore) {
    where.exam_scores = {
      some: {
        exam_type: 'GATE',
        score: { gte: parseFloat(params.gateScore) }
      }
    }
  }

  // Sorting
  let orderBy = {}
  const sortCol = params.sortBy || 'created_at'
  const direction = params.order || 'desc'
  const validSortCols = ['name', 'created_at', 'category']
  if (validSortCols.includes(sortCol)) {
    orderBy[sortCol] = direction
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy,
    include: {
      education: true,
      exam_scores: true
    }
  })

  // Flatten & map
  return applications.map(app => {
    const edu = app.education || []
    const exams = app.exam_scores || []

    const get = (level) => edu.find(e => e.level === level)
    const getExam = (type) => exams.find(e => e.exam_type === type)

    const gate = getExam('GATE')
    const csir = getExam('CSIR')

    return {
      id: app.id,
      user_id: app.user_id,
      email: app.email || '',
      name: app.name,
      dob: app.dob,
      category: app.category,
      marital_status: app.marital_status,
      nationality: app.nationality,
      research_area: app.research_area,
      address: app.address,
      phone: app.phone,
      nbhm_eligible: app.nbhm_eligible,
      created_at: app.created_at,
      // Education
      pct_10th:  { score_type: get('10th')?.score_type, score_value: get('10th')?.score_value },
      pct_12th:  { score_type: get('12th')?.score_type, score_value: get('12th')?.score_value },
      pct_grad:  { score_type: get('Graduation')?.score_type, score_value: get('Graduation')?.score_value },
      pct_pg:    { score_type: get('Post Graduation')?.score_type, score_value: get('Post Graduation')?.score_value },
      // GATE
      gate_branch:     gate?.branch ?? null,
      gate_year:       gate?.year ?? null,
      gate_valid_upto: gate?.valid_upto ?? null,
      gate_percentile: gate?.percentile ?? null,
      gate_score:      gate?.score ?? null,
      gate_air:        gate?.air ?? null,
      // CSIR
      csir_branch:     csir?.branch ?? null,
      csir_year:       csir?.year ?? null,
      csir_valid_upto: csir?.valid_upto ?? null,
      csir_percentile: csir?.percentile ?? null,
      csir_score:      csir?.score ?? null,
      csir_duration:   csir?.duration ?? null,
      education: edu,
      exam_scores: exams,
    }
  })
}

// ─── Controllers ─────────────────────────────────────────────

/**
 * POST /api/application
 */
export async function submitApplication(req, res) {
  const userId = req.user.id
  const email = req.user.email
  const body = req.validatedBody

  try {
    const applicationId = await prisma.$transaction(async (tx) => {
      // 1. Upsert main application record
      const appData = {
        name:           body.name,
        email:          body.email || email,
        dob:            body.dob ? new Date(body.dob) : null,
        category:       body.category,
        marital_status: body.marital_status,
        nationality:    body.nationality || 'Indian',
        research_area:  body.research_area,
        address:        body.address,
        phone:          body.phone,
        nbhm_eligible:  body.nbhm_eligible,
        updated_at:     new Date()
      }

      const app = await tx.application.upsert({
        where: { user_id: userId },
        update: appData,
        create: {
          user_id: userId,
          created_at: new Date(),
          ...appData
        }
      })

      const appId = app.id

      // 2. Clear old education rows, add new ones
      await tx.education.deleteMany({ where: { application_id: appId } })
      if (body.education?.length) {
        const eduRows = body.education
          .filter(e => e.discipline || e.institute || e.score_value || e.year)
          .map(e => ({
            application_id: appId,
            level:      e.level,
            discipline: e.discipline,
            institute:  e.institute,
            study_type: e.study_type || 'Regular',
            year:       e.year,
            score_type: e.score_type,
            score_value: e.score_value,
            division:   e.division,
          }))
        if (eduRows.length) await tx.education.createMany({ data: eduRows })
      }

      // 3. Clear old exam scores, add new ones
      await tx.examScore.deleteMany({ where: { application_id: appId } })
      if (body.exam_scores?.length) {
        const scoreRows = body.exam_scores
          .filter(s => s.score != null)
          .map(s => ({
            application_id: appId,
            exam_type:  s.exam_type,
            branch:     s.branch,
            year:       s.year,
            valid_upto: s.valid_upto,
            percentile: s.percentile,
            score:      s.score,
            air:        s.exam_type === 'GATE' ? s.air : null,
            duration:   s.exam_type === 'CSIR' ? s.duration : null,
          }))
        if (scoreRows.length) await tx.examScore.createMany({ data: scoreRows })
      }

      return appId
    })

    return res.status(200).json({ message: 'Application saved.', id: applicationId })
  } catch (err) {
    console.error('submitApplication error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error.' })
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
      include: {
        education: true,
        exam_scores: true
      }
    })

    return res.status(200).json({ application: data || null })
  } catch (err) {
    console.error('getMyApplication error:', err)
    return res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/applications
 * Admin: get all applications with filters
 */
export async function getAllApplications(req, res) {
  try {
    const results = await fetchFlatApplications(req.query)
    return res.status(200).json({ applications: results, total: results.length })
  } catch (err) {
    console.error('getAllApplications error:', err)
    return res.status(500).json({ error: err.message })
  }
}
