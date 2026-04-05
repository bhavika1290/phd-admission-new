import ExcelJS from 'exceljs'
import { fetchFlatApplications } from './applicationController.js'

/**
 * GET /api/export
 * Admin: export filtered applications as Excel
 */
export async function exportApplications(req, res) {
  try {
    const data = await fetchFlatApplications(req.query)

    const workbook  = new ExcelJS.Workbook()
    workbook.creator = 'PhD Admission Portal'
    workbook.created  = new Date()

    const ws = workbook.addWorksheet('PhD Applicants', {
      pageSetup: { fitToPage: true, orientation: 'landscape' },
    })

    // ── Column definitions ──
    ws.columns = [
      { header: '#',                  key: 'idx',              width: 5  },
      { header: 'Name',               key: 'name',             width: 25 },
      { header: 'Gender',             key: 'gender',           width: 10 },
      { header: 'Email',              key: 'email',            width: 28 },
      { header: 'DOB',                key: 'dob',              width: 12 },
      { header: 'Category',           key: 'category',         width: 10 },
      { header: 'Marital Status',     key: 'marital_status',   width: 14 },
      { header: 'Nationality',        key: 'nationality',      width: 14 },
      { header: 'Study Mode',         key: 'study_mode',       width: 16 },
      { header: 'Research Area',      key: 'research_area',    width: 22 },
      { header: 'Research Pref 2',    key: 'research_pref_2',   width: 22 },
      { header: 'Phone',              key: 'phone',            width: 14 },
      { header: '10th',               key: 'score_10th',       width: 14 },
      { header: '12th',               key: 'score_12th',       width: 14 },
      { header: 'Graduation',         key: 'score_grad',       width: 18 },
      { header: 'Post Graduation',    key: 'score_pg',         width: 18 },
      { header: 'Exam Details',       key: 'exam_details',     width: 30 },
      { header: 'Eligibility',        key: 'eligibility',      width: 16 },
      { header: 'New Application',    key: 'new_application',  width: 16 },
      { header: 'Applied Date',       key: 'created_at',       width: 14 },
    ]

    // ── Style header row ──
    const headerRow = ws.getRow(1)
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: 'FF4338CA' }, // indigo-700
      }
      cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF6366F1' } },
      }
    })
    headerRow.height = 24

    // Helper: format education score
    const fmtScore = (s) => {
      if (!s?.score_value) return ''
      return `${s.score_value} (${s.score_type === 'cgpa' ? 'CGPA' : '%'})`
    }

    // ── Add data rows ──
    data.forEach((row, i) => {
      const r = ws.addRow({
        idx:             i + 1,
        name:            row.full_name || row.name,
        gender:          row.gender,
        email:           row.email,
        dob:             row.dob ? new Date(row.dob).toLocaleDateString() : '',
        category:        row.category,
        marital_status:  row.marital_status,
        nationality:     row.nationality,
        study_mode:      row.study_mode,
        research_area:   row.research_area,
        research_pref_2: row.research_pref_2,
        phone:           row.phone,
        score_10th:      fmtScore(row.pct_10th),
        score_12th:      fmtScore(row.pct_12th),
        score_grad:      fmtScore(row.pct_grad),
        score_pg:        Array.isArray(row.pct_pg) ? row.pct_pg.map(fmtScore).join(', ') : fmtScore(row.pct_pg),
        exam_details:    Array.isArray(row.exam_details) ? row.exam_details.map((exam) => `${exam.exam_name}${exam.score != null ? ` ${exam.score}` : ''}${exam.percentile != null ? ` pct ${exam.percentile}` : ''}${exam.rank != null ? ` rank ${exam.rank}` : ''}`).join(' | ') : '',
        eligibility:     row.eligibility_status || 'Pending',
        new_application: row.is_new_application ? 'Yes' : 'No',
        created_at:      row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
      })

      // Zebra striping
      if (i % 2 === 0) {
        r.eachCell(cell => {
          cell.fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: 'FFF1F5F9' }, // slate-100
          }
        })
      }

      const eligibilityCell = r.getCell('eligibility')
      if (row.eligibility_status === 'Eligible') {
        eligibilityCell.font = { bold: true, color: { argb: 'FF16A34A' } }
      }

      const newAppCell = r.getCell('new_application')
      if (row.is_new_application) {
        newAppCell.font = { bold: true, color: { argb: 'FF7C3AED' } }
      }

      r.alignment = { vertical: 'middle' }
    })

    // ── Freeze header ──
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

    // ── Auto filter ──
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to:   { row: 1, column: ws.columns.length },
    }

    // ── Stream to response ──
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="phd_applications_${Date.now()}.xlsx"`)
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('exportApplications error:', err)
    res.status(500).json({ error: err.message })
  }
}
