import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const CATEGORY_COLORS = {
  GEN: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  OBC: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  SC: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ST: 'bg-green-500/20 text-green-300 border-green-500/30',
}

function SortIcon({ column, sortBy, order }) {
  if (sortBy !== column) return <ChevronsUpDown size={12} className="text-white/20" />
  return order === 'asc'
    ? <ChevronUp size={12} className="text-primary-400" />
    : <ChevronDown size={12} className="text-primary-400" />
}

function fmtScore(row) {
  if (!row) return '—'
  if (row.score_value == null && row.score == null) return '—'
  if (row.score_value != null) {
    return row.score_type === 'cgpa'
      ? `${row.score_value} CGPA`
      : `${row.score_value}%`
  }
  return row.score
}

function fmtExam(row) {
  if (!row) return '—'
  const parts = []
  if (row.exam_name) parts.push(row.exam_name)
  if (row.score != null) parts.push(`Score ${row.score}`)
  if (row.percentile != null) parts.push(`Pct ${row.percentile}`)
  if (row.rank != null) parts.push(`Rank ${row.rank}`)
  if (row.air != null) parts.push(`All India Rank ${row.air}`)
  return parts.length ? parts.join(' · ') : '—'
}

function fmtEducationSummary(rows = []) {
  if (!rows.length) return '—'
  return rows.map((row) => {
    const degree = row.custom_degree_name || row.degree_name || 'Degree'
    const score = fmtScore(row)
    return `${degree} ${score !== '—' ? `(${score})` : ''}`.trim()
  }).join(', ')
}

function fmtResearch(app) {
  const prefs = [app.research_pref_1, app.research_pref_2].filter(Boolean)
  if (!prefs.length) return '—'
  return prefs.join(' • ')
}

function SortableHeader({ column, label, sortBy, order, onSort }) {
  return (
    <th
      className="px-4 py-3 font-semibold tracking-wider cursor-pointer hover:text-white/80 select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon column={column} sortBy={sortBy} order={order} />
      </div>
    </th>
  )
}

export default function ApplicantsTable({ data, loading, sortBy, order, onSort }) {
  if (loading) {
    return (
      <div className="glass-card p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-white/40 text-sm">Loading applicants...</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-white/40 text-lg">No applicants found matching the filters.</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[1200px]">
          <thead>
            <tr>
              <th className="px-4 py-3 font-semibold tracking-wider">#</th>
              <SortableHeader column="name" label="Applicant" sortBy={sortBy} order={order} onSort={onSort} />
              <th className="px-4 py-3 font-semibold tracking-wider">Category</th>
              <th className="px-4 py-3 font-semibold tracking-wider">Research Preferences</th>
              <th className="px-4 py-3 font-semibold tracking-wider">Education</th>
              <th className="px-4 py-3 font-semibold tracking-wider">Exam Details</th>
              <th className="px-4 py-3 font-semibold tracking-wider">Eligibility</th>
              <th className="px-4 py-3 font-semibold tracking-wider">New</th>
              <SortableHeader column="created_at" label="Applied" sortBy={sortBy} order={order} onSort={onSort} />
            </tr>
          </thead>
          <tbody>
            {data.map((app, idx) => (
              <tr key={app.id}>
                <td className="px-4 py-3 text-white/40 text-xs">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{app.full_name || app.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{app.email || '—'}</p>
                    <p className="text-[11px] text-white/30 mt-1">{app.gender || '—'} · {app.study_mode || '—'}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge border ${CATEGORY_COLORS[app.category] || 'bg-white/10 text-white/60 border-white/10'}`}>
                    {app.category || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70 text-xs max-w-[200px]">
                  {fmtResearch(app)}
                </td>
                <td className="px-4 py-3 text-white/70 text-xs max-w-[220px]">
                  {fmtEducationSummary(app.education_summary?.postGraduation || app.pct_pg || [])}
                </td>
                <td className="px-4 py-3 text-white/70 text-xs max-w-[240px]">
                  {Array.isArray(app.exam_details) && app.exam_details.length
                    ? app.exam_details.map((row) => fmtExam(row)).join(' | ')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge border ${
                      app.eligibility_status === 'Eligible'
                        ? 'bg-success-500/20 text-success-500 border-success-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {app.eligibility_status || 'Pending'}
                  </span>
                  {app.eligibility_message && (
                    <p className="text-[11px] text-white/35 mt-1 max-w-[180px]">{app.eligibility_message}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {app.is_new_application ? (
                    <span className="badge bg-accent-500/20 text-accent-300 border border-accent-500/30">New Application</span>
                  ) : (
                    <span className="badge bg-white/5 text-white/40 border border-white/10">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
