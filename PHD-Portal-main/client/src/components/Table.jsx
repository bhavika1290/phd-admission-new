import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const CATEGORY_COLORS = {
  GEN: 'bg-blue-50/50 text-black border-blue-200',
  OBC: 'bg-blue-100/40 text-black border-black/10',
  SC: 'bg-blue-200/20 text-black border-black/20',
  ST: 'bg-[#003366] text-white border-white/20',
}

function SortIcon({ column, sortBy, order }) {
  if (sortBy !== column) return <ChevronsUpDown size={14} className="text-[#003366]/30" />
  return order === 'asc'
    ? <ChevronUp size={14} className="text-[#003366] font-black" />
    : <ChevronDown size={14} className="text-[#003366] font-black" />
}

function fmtScore(row) {
  if (!row) return '—'
  if (row.score_value == null && row.score == null) return '—'
  if (row.score_value != null) {
    return row.score_type === 'cgpa' ? `${row.score_value} CGPA` : `${row.score_value}%`
  }
  return row.score
}

function fmtResearch(app) {
  const prefs = [app.research_pref_1, app.research_pref_2].filter(Boolean)
  return prefs.length ? prefs.join(' · ') : '—'
}

const COLUMN_RENDERERS = {
  name: (app) => (
    <div className="space-y-1">
      <p className="font-bold text-black text-[16px] capitalize tracking-tight">{app.full_name || app.name}</p>
      <p className="text-[12px] text-[#003366] font-mono tracking-tighter font-bold">REF: {app.id}</p>
    </div>
  ),
  email: (app) => <p className="text-[13px] font-bold text-[#4169E1] lowercase italic">{app.email || '—'}</p>,
  gender: (app) => <span className="text-[12px] font-black uppercase tracking-widest text-[#003366]/80">{app.gender || '—'}</span>,
  category: (app) => (
    <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border border-[#003366]/20 ${CATEGORY_COLORS[app.category] || 'bg-white'}`}>
      {app.category || '—'}
    </span>
  ),
  study_mode: (app) => <span className="text-[12px] font-black uppercase tracking-widest text-[#003366]/80">{app.study_mode || '—'}</span>,
  research_area: (app) => <p className="text-[13px] font-black text-black leading-relaxed max-w-[240px]">{fmtResearch(app)}</p>,
  phone: (app) => <p className="text-[13px] font-mono text-[#003366] font-bold tracking-widest">{app.phone || '—'}</p>,
  score_10th: (app) => <p className="text-[13px] font-black text-black">{fmtScore(app.pct_10th)}</p>,
  score_12th: (app) => <p className="text-[13px] font-black text-black">{fmtScore(app.pct_12th)}</p>,
  score_grad: (app) => <p className="text-[13px] font-black text-black">{fmtScore(app.pct_grad)}</p>,
  score_pg: (app) => (
    <p className="text-[13px] font-black text-black max-w-[200px]">
      {(app.pct_pg || []).map(p => fmtScore(p)).join(', ') || '—'}
    </p>
  ),
  exam_details: (app) => <p className="text-[13px] font-bold text-black max-w-[250px] leading-snug">{app.exam_details || '—'}</p>,
  eligibility: (app) => (
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full ${app.eligibility_status === 'Eligible' ? 'bg-[#4169E1]' : 'bg-red-600'}`} />
      <span className="text-[12px] font-black uppercase tracking-widest text-black">{app.eligibility_status || 'Pending'}</span>
    </div>
  ),
  created_at: (app) => <p className="text-[13px] font-mono text-[#003366] font-bold italic">{app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}</p>,
}

export default function ApplicantsTable({ data, loading, sortBy, order, onSort, visibleColumns = [] }) {
  if (loading) {
    return (
      <div className="glass-card !p-16 flex flex-col items-center justify-center border-blue-50 bg-white">
        <div className="spinner mb-8 border-t-[#003366]" />
        <p className="text-[12px] font-black text-[#003366] uppercase tracking-[0.4em] animate-pulse">Synchronizing Registry Core...</p>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="glass-card !p-20 text-center border-blue-50 bg-white">
        <p className="text-[13px] font-black text-[#003366] uppercase tracking-[0.3em]">No discovered registry protocols</p>
      </div>
    )
  }

  const columnsToShow = visibleColumns.length ? visibleColumns : ['name', 'email', 'category', 'research_area', 'eligibility', 'created_at']

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-2xl border-[#003366]/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50 border-b border-[#003366]/20">
              <th className="px-8 py-6 text-[11px] font-black text-[#003366] uppercase tracking-[0.3em] w-20">Idx</th>
              {columnsToShow.map(colId => {
                const isSortable = ['name', 'created_at', 'category'].includes(colId)
                return (
                  <th 
                    key={colId}
                    onClick={() => isSortable && onSort(colId)}
                    className={`px-8 py-6 text-[11px] font-black text-[#003366] uppercase tracking-[0.3em] ${isSortable ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                       {colId.replace(/_/g, ' ')}
                       {isSortable && <SortIcon column={colId} sortBy={sortBy} order={order} />}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#003366]/10">
            {data.map((app, idx) => (
              <tr key={app.id} className="hover:bg-blue-50/50 transition-all duration-300">
                <td className="px-8 py-8 text-[12px] font-mono text-[#003366] font-black tracking-widest border-r border-[#003366]/05">
                  {String(idx + 1).padStart(2, '0')}
                </td>
                {columnsToShow.map(colId => (
                  <td key={colId} className="px-8 py-8">
                    {COLUMN_RENDERERS[colId] ? COLUMN_RENDERERS[colId](app) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
