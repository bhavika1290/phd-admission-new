import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const CATEGORY_COLORS = {
  GEN: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  OBC: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  SC:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ST:  'bg-green-500/20 text-green-300 border-green-500/30',
}

// Helper: render education score object as "8.5 CGPA" or "85.0 %" or "—"
function fmtEduScore(s) {
  if (!s || s.score_value == null) return '—'
  return s.score_type === 'cgpa'
    ? `${s.score_value} CGPA`
    : `${s.score_value}%`
}

function SortIcon({ column, sortBy, order }) {
  if (sortBy !== column) return <ChevronsUpDown size={12} className="text-white/20" />
  return order === 'asc'
    ? <ChevronUp size={12} className="text-primary-400" />
    : <ChevronDown size={12} className="text-primary-400" />
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

  const sortableCol = (col, label) => (
    <th
      className="px-4 py-3 font-semibold tracking-wider cursor-pointer hover:text-white/80 select-none"
      onClick={() => onSort(col)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon column={col} sortBy={sortBy} order={order} />
      </div>
    </th>
  )

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="px-4 py-3 font-semibold tracking-wider">#</th>
              {sortableCol('name', 'Name')}
              <th className="px-4 py-3 font-semibold tracking-wider">Category</th>
              <th className="px-4 py-3 font-semibold tracking-wider">Research Area</th>
              <th className="px-4 py-3 font-semibold tracking-wider">10th</th>
              <th className="px-4 py-3 font-semibold tracking-wider">12th</th>
              <th className="px-4 py-3 font-semibold tracking-wider">Grad</th>
              <th className="px-4 py-3 font-semibold tracking-wider">PG</th>
              <th className="px-4 py-3 font-semibold tracking-wider">GATE</th>
              <th className="px-4 py-3 font-semibold tracking-wider">CSIR</th>
              <th className="px-4 py-3 font-semibold tracking-wider">NBHM</th>
              {sortableCol('created_at', 'Applied')}
            </tr>
          </thead>
          <tbody>
            {data.map((app, idx) => (
              <tr key={app.id}>
                <td className="px-4 py-3 text-white/40 text-xs">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{app.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{app.email || '—'}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge border ${CATEGORY_COLORS[app.category] || 'bg-white/10 text-white/60 border-white/10'}`}>
                    {app.category || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/60 text-xs max-w-[140px] truncate"
                  title={app.research_area}>
                  {app.research_area || '—'}
                </td>
                <td className="px-4 py-3 text-white/70 text-xs">{fmtEduScore(app.pct_10th)}</td>
                <td className="px-4 py-3 text-white/70 text-xs">{fmtEduScore(app.pct_12th)}</td>
                <td className="px-4 py-3 text-white/70 text-xs">{fmtEduScore(app.pct_grad)}</td>
                <td className="px-4 py-3 text-white/70 text-xs">{fmtEduScore(app.pct_pg)}</td>

                {/* GATE */}
                <td className="px-4 py-3 text-xs">
                  {app.gate_score != null ? (
                    <div>
                      <span className="font-mono font-medium text-accent-400">{app.gate_score}</span>
                      {app.gate_air && <span className="text-white/30 ml-1">AIR {app.gate_air}</span>}
                    </div>
                  ) : '—'}
                </td>

                {/* CSIR */}
                <td className="px-4 py-3 text-xs">
                  {app.csir_score != null ? (
                    <div>
                      <span className="font-mono font-medium text-accent-400">{app.csir_score}</span>
                      {app.csir_duration && <span className="text-white/30 ml-1">{app.csir_duration}</span>}
                    </div>
                  ) : '—'}
                </td>

                <td className="px-4 py-3">
                  {app.nbhm_eligible
                    ? <span className="badge bg-success-500/20 text-success-500 border border-success-500/30">Yes</span>
                    : <span className="badge bg-white/5 text-white/40 border border-white/10">No</span>}
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
