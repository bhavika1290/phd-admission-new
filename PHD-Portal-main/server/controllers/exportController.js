import ExcelJS from 'exceljs'
import { fetchFlatApplications } from './applicationController.js'

/**
 * GET /api/export
 * Admin: export filtered applications as Excel
 */
export async function exportApplications(req, res) {
  try {
    const { applications: data } = await fetchFlatApplications(req.query)

    const workbook  = new ExcelJS.Workbook()
    workbook.creator = 'PhD Admission Portal'
    workbook.created  = new Date()

    const ws = workbook.addWorksheet('PhD Applicants', {
      pageSetup: { fitToPage: true, orientation: 'landscape' },
    })

    // ── Column definitions mapping ──
    const COLUMN_MAP = {
      name: { header: 'Name', key: 'name', width: 25 },
      gender: { header: 'Gender', key: 'gender', width: 10 },
      email: { header: 'Email', key: 'email', width: 28 },
      dob: { header: 'DOB', key: 'dob', width: 12 },
      category: { header: 'Category', key: 'category', width: 10 },
      marital_status: { header: 'Marital Status', key: 'marital_status', width: 14 },
      nationality: { header: 'Nationality', key: 'nationality', width: 14 },
      study_mode: { header: 'Study Mode', key: 'study_mode', width: 16 },
      research_area: { header: 'Research Area', key: 'research_area', width: 22 },
      research_pref_2: { header: 'Research Pref 2', key: 'research_pref_2', width: 22 },
      phone: { header: 'Phone', key: 'phone', width: 14 },
      score_10th: { header: '10th', key: 'score_10th', width: 14 },
      score_12th: { header: '12th', key: 'score_12th', width: 14 },
      score_grad: { header: 'Graduation', key: 'score_grad', width: 18 },
      score_pg: { header: 'Post Graduation', key: 'score_pg', width: 18 },
      exam_details: { header: 'Exam Details', key: 'exam_details', width: 30 },
      eligibility: { header: 'Eligibility', key: 'eligibility', width: 16 },
      new_application: { header: 'New Application', key: 'new_application', width: 16 },
      created_at: { header: 'Applied Date', key: 'created_at', width: 14 },
      address: { header: 'Address', key: 'address', width: 30 },
      nbhm_eligible: { header: 'NBHM Eligible', key: 'nbhm_eligible', width: 15 },
    }

    const requestedCols = req.query.columns ? req.query.columns.split(',') : []
    
    let finalColumns = []
    finalColumns.push({ header: '#', key: 'idx', width: 5 })

    if (requestedCols.length > 0) {
      requestedCols.forEach(colKey => {
        if (COLUMN_MAP[colKey]) {
          finalColumns.push(COLUMN_MAP[colKey])
        }
      })
    } else {
      // Default columns if none specified
      finalColumns = [
        { header: '#', key: 'idx', width: 5 },
        COLUMN_MAP.name,
        COLUMN_MAP.email,
        COLUMN_MAP.research_area,
        COLUMN_MAP.category,
        COLUMN_MAP.eligibility,
        COLUMN_MAP.created_at
      ]
    }

    ws.columns = finalColumns

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
      if (s === null || s === undefined || s === '') return ''
      if (typeof s === 'object' && s !== null && !Array.isArray(s)) {
        if (!s.score_value) return ''
        return `${s.score_value} (${s.score_type === 'cgpa' ? 'CGPA' : '%'})`
      }
      return String(s)
    }

    // ── Add data rows ──
    data.forEach((row, i) => {
      const rowData = { idx: i + 1 }
      finalColumns.forEach(col => {
        if (col.key === 'idx') return
        
        if (col.key === 'name') rowData.name = row.full_name || row.name
        else if (col.key === 'dob') rowData.dob = row.dob ? new Date(row.dob).toLocaleDateString() : ''
        else if (col.key === 'score_10th') rowData.score_10th = fmtScore(row.pct_10th)
        else if (col.key === 'score_12th') rowData.score_12th = fmtScore(row.pct_12th)
        else if (col.key === 'score_grad') rowData.score_grad = fmtScore(row.pct_grad)
        else if (col.key === 'score_pg') rowData.score_pg = Array.isArray(row.pct_pg) ? row.pct_pg.map(fmtScore).join(', ') : fmtScore(row.pct_pg)
        else if (col.key === 'exam_details') rowData.exam_details = Array.isArray(row.exam_details) ? row.exam_details.map((exam) => `${exam.exam_name}${exam.score != null ? ` ${exam.score}` : ''}${exam.percentile != null ? ` pct ${exam.percentile}` : ''}${exam.rank != null ? ` rank ${exam.rank}` : ''}`).join(' | ') : ''
        else if (col.key === 'eligibility') rowData.eligibility = row.eligibility_status || 'Pending'
        else if (col.key === 'new_application') rowData.new_application = row.is_new_application ? 'Yes' : 'No'
        else if (col.key === 'created_at') rowData.created_at = row.created_at ? new Date(row.created_at).toLocaleDateString() : ''
        else rowData[col.key] = row[col.key] || ''
      })

      const r = ws.addRow(rowData)

      // Zebra striping
      if (i % 2 === 0) {
        r.eachCell(cell => {
          cell.fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: 'FFF1F5F9' }, // slate-100
          }
        })
      }

      // Conditional styling only if columns exist
      const hasCol = (key) => finalColumns.some(c => c.key === key)

      if (hasCol('eligibility')) {
        const eligibilityCell = r.getCell('eligibility')
        if (row.eligibility_status === 'Eligible') {
          eligibilityCell.font = { bold: true, color: { argb: 'FF16A34A' } }
        }
      }

      if (hasCol('new_application')) {
        const newAppCell = r.getCell('new_application')
        if (row.is_new_application) {
          newAppCell.font = { bold: true, color: { argb: 'FF7C3AED' } }
        }
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
