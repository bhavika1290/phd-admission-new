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
      { header: 'Email',              key: 'email',            width: 28 },
      { header: 'DOB',                key: 'dob',              width: 12 },
      { header: 'Category',           key: 'category',         width: 10 },
      { header: 'Marital Status',     key: 'marital_status',   width: 14 },
      { header: 'Nationality',        key: 'nationality',      width: 14 },
      { header: 'Research Area',      key: 'research_area',    width: 22 },
      { header: 'Phone',              key: 'phone',            width: 14 },
      { header: '10th Score',         key: 'score_10th',       width: 14 },
      { header: '12th Score',         key: 'score_12th',       width: 14 },
      { header: 'Graduation Score',   key: 'score_grad',       width: 18 },
      { header: 'PG Score',           key: 'score_pg',         width: 14 },
      // GATE
      { header: 'GATE Branch',        key: 'gate_branch',      width: 15 },
      { header: 'GATE Year',          key: 'gate_year',        width: 11 },
      { header: 'GATE Valid Upto',    key: 'gate_valid_upto',  width: 14 },
      { header: 'GATE Percentile',    key: 'gate_percentile',  width: 15 },
      { header: 'GATE Score',         key: 'gate_score',       width: 12 },
      { header: 'GATE AIR',           key: 'gate_air',         width: 10 },
      // CSIR
      { header: 'CSIR Branch',        key: 'csir_branch',      width: 15 },
      { header: 'CSIR Year',          key: 'csir_year',        width: 11 },
      { header: 'CSIR Valid Upto',    key: 'csir_valid_upto',  width: 14 },
      { header: 'CSIR Percentile',    key: 'csir_percentile',  width: 15 },
      { header: 'CSIR Score',         key: 'csir_score',       width: 12 },
      { header: 'CSIR Duration',      key: 'csir_duration',    width: 14 },
      // Other
      { header: 'NBHM Eligible',      key: 'nbhm_eligible',    width: 14 },
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
        name:            row.name,
        email:           row.email,
        dob:             row.dob ? new Date(row.dob).toLocaleDateString() : '',
        category:        row.category,
        marital_status:  row.marital_status,
        nationality:     row.nationality,
        research_area:   row.research_area,
        phone:           row.phone,
        score_10th:      fmtScore(row.pct_10th),
        score_12th:      fmtScore(row.pct_12th),
        score_grad:      fmtScore(row.pct_grad),
        score_pg:        fmtScore(row.pct_pg),
        gate_branch:     row.gate_branch,
        gate_year:       row.gate_year,
        gate_valid_upto: row.gate_valid_upto,
        gate_percentile: row.gate_percentile,
        gate_score:      row.gate_score,
        gate_air:        row.gate_air,
        csir_branch:     row.csir_branch,
        csir_year:       row.csir_year,
        csir_valid_upto: row.csir_valid_upto,
        csir_percentile: row.csir_percentile,
        csir_score:      row.csir_score,
        csir_duration:   row.csir_duration,
        nbhm_eligible:   row.nbhm_eligible ? 'Yes' : 'No',
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

      // NBHM highlight
      const nbhmCell = r.getCell('nbhm_eligible')
      if (row.nbhm_eligible) {
        nbhmCell.font = { bold: true, color: { argb: 'FF16A34A' } }
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
