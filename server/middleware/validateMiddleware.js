import { z } from 'zod'

// Helper: convert empty string to null before coercing
const numOrNull = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.coerce.number().nullable().optional()
)
const intOrNull = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.coerce.number().int().nullable().optional()
)

const educationSchema = z.object({
  level:       z.enum(['10th', '12th', 'Graduation', 'Post Graduation']),
  discipline:  z.string().optional(),
  institute:   z.string().optional(),
  study_type:  z.enum(['Regular', 'Part-time']).optional(),
  year:        z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).nullable().optional()
  ),
  score_type:  z.enum(['percentage', 'cgpa']).optional().nullable(),
  score_value: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.coerce.number().min(0).max(100).nullable().optional()
  ),
  division:    z.string().optional(),
})

const examScoreSchema = z.object({
  exam_type:  z.enum(['GATE', 'CSIR']),
  branch:     z.string().optional().nullable(),
  year:       z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1).nullable().optional()
  ),
  valid_upto: z.string().optional().nullable(),
  percentile: numOrNull,
  score:      numOrNull,
  air:        intOrNull,
  duration:   z.string().optional().nullable(),
})

export const applicationSchema = z.object({
  name:           z.string().min(2, 'Name must be at least 2 characters'),
  email:          z.string().email('Invalid email').optional().nullable(),
  dob:            z.string().optional().nullable(),
  category:       z.enum(['GEN', 'OBC', 'SC', 'ST']).optional(),
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional().nullable(),
  nationality:    z.string().optional().nullable(),
  research_area:  z.string().optional().nullable(),
  address:        z.string().optional(),
  phone:          z.string().optional(),
  nbhm_eligible:  z.boolean().optional().default(false),
  education:      z.array(educationSchema).optional().default([]),
  exam_scores:    z.array(examScoreSchema).optional().default([]),
}).superRefine((data, ctx) => {
  // At least one of GATE or CSIR must have a score
  const hasGate = data.exam_scores?.some(e => e.exam_type === 'GATE' && e.score != null && e.score !== '')
  const hasCsir = data.exam_scores?.some(e => e.exam_type === 'CSIR' && e.score != null && e.score !== '')
  if (!hasGate && !hasCsir) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['exam_scores'],
      message: 'At least one qualifying exam (GATE or CSIR) score is required.',
    })
  }
})

/**
 * Middleware factory: validate req.body against a Zod schema.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      const formErrors = result.error.flatten().formErrors
      return res.status(400).json({ error: 'Validation failed', details: errors, formErrors })
    }
    req.validatedBody = result.data
    next()
  }
}
