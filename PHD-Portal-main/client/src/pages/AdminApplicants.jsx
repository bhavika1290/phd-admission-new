import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Download, Filter, Loader2, RotateCcw, Columns, X, Plus, Search, Layers, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllApplications, exportApplications } from '../services/api'
import AdminFilterSort from '../components/AdminFilterSort'
import ApplicantsTable from '../components/Table'

const ALL_COLUMNS = [
  { id: 'name', label: 'Identity' },
  { id: 'email', label: 'Email' },
  { id: 'gender', label: 'Gender' },
  { id: 'category', label: 'Category' },
  { id: 'study_mode', label: 'Mode' },
  { id: 'research_area', label: 'Research' },
  { id: 'phone', label: 'Phone' },
  { id: 'score_10th', label: '10th' },
  { id: 'score_12th', label: '12th' },
  { id: 'score_grad', label: 'Grad' },
  { id: 'score_pg', label: 'Post-Grad' },
  { id: 'exam_details', label: 'Exams' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'created_at', label: 'Date' },
]

export default function AdminApplicants() {
  const [applications, setApplications] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedCols, setSelectedCols] = useState(['name', 'email', 'category', 'research_area', 'eligibility', 'created_at'])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    eligibility: 'all',
    minCgpa: '',
    minGate: '',
    sortBy: 'created_at',
    order: 'desc'
  })

  const [isDirty, setIsDirty] = useState(false)

  const fetchApplications = useCallback(async (currentFilters = filters, currentPage = page, currentSearch = search) => {
    setLoading(true)
    try {
      const params = {
        status: currentFilters.status !== 'all' ? currentFilters.status : undefined,
        category: currentFilters.category !== 'all' ? currentFilters.category : undefined,
        eligibilityStatus: currentFilters.eligibility !== 'all' ? currentFilters.eligibility : undefined,
        minCgpa: currentFilters.minCgpa || undefined,
        gateScore: currentFilters.minGate || undefined,
        sortBy: currentFilters.sortBy,
        order: currentFilters.order,
        limit,
        offset: (currentPage - 1) * limit,
        search: currentSearch || undefined
      }
      const res = await getAllApplications(params)
      setApplications(res.data.applications || [])
      setTotalCount(res.data.total || 0)
      setIsDirty(false)
    } catch {
      toast.error('Registry access failure')
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit, search])

  useEffect(() => {
    fetchApplications()
  }, [page, limit])

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setIsDirty(true)
  }

  const handleSort = (column) => {
    const newOrder = filters.sortBy === column && filters.order === 'desc' ? 'asc' : 'desc'
    const updated = { ...filters, sortBy: column, order: newOrder }
    setFilters(updated)
    fetchApplications(updated, 1)
    setPage(1)
  }

  const handleSearch = (e) => {
    const val = e.target.value
    setSearch(val)
    setIsDirty(true)
  }

  const executeQuery = () => {
    setPage(1)
    fetchApplications(filters, 1, search)
  }

  const totalPages = Math.ceil(totalCount / limit)

  const handleExport = async () => {
    if (selectedCols.length === 0) return toast.error('Select column protocol')
    setExporting(true)
    try {
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        eligibilityStatus: filters.eligibility !== 'all' ? filters.eligibility : undefined,
        minCgpa: filters.minCgpa || undefined,
        gateScore: filters.minGate || undefined,
        columns: selectedCols.join(','),
        search: search || undefined
      }
      await exportApplications(params)
      toast.success('Excel compiled successfully')
    } catch (err) {
      toast.error(`Export failure: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  const toggleColumn = (colId) => {
    if (selectedCols.includes(colId)) {
      setSelectedCols(selectedCols.filter(c => c !== colId))
    } else {
      setSelectedCols([...selectedCols, colId])
    }
  }

  return (
    <div className="space-y-10 min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col gap-6">
        {/* Top: Filter and Sort */}
        <div className="glass-card !p-8 border-blue-100 shadow-xl bg-white space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-blue-50 pb-6 gap-6">
              <div className="flex items-center gap-4 flex-grow max-w-xl">
                 <div className="p-3 rounded-xl bg-[#003366] text-white shadow-lg">
                    <SlidersHorizontal size={20} />
                 </div>
                 <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text"
                      placeholder="Search name, email, or transaction ID..."
                      value={search}
                      onChange={handleSearch}
                      onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all"
                    />
                 </div>
              </div>
              <button
                onClick={executeQuery}
                disabled={loading}
                className={`px-10 py-4 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all flex items-center gap-3 ${
                  isDirty 
                    ? 'bg-[#003366] text-white shadow-2xl hover:scale-105 active:scale-95' 
                    : 'bg-blue-50 text-[#003366] opacity-40 cursor-default font-black'
                }`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Execute Query
              </button>
           </div>

           <AdminFilterSort 
              filters={filters}
              onFilterChange={handleFilterChange} 
              onSortChange={(val) => {
                const [col, ord] = val.split('-')
                handleSort(col)
              }} 
           />
        </div>

        {/* Bottom: Columns Configuration */}
        <div className="glass-card !p-8 border-blue-100 shadow-xl bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 text-[#003366] border border-blue-200">
                  <Columns size={20} />
                </div>
                <div>
                   <h3 className="text-2xl font-bold font-heading text-[#003366]">Display Columns</h3>
                   <p className="text-[11px] font-black text-[#003366] uppercase tracking-widest mt-1">Configure registry visualization and export parameters</p>
                </div>
             </div>

             <div className="flex flex-wrap items-center gap-3 md:justify-end flex-grow max-w-4xl">
                {selectedCols.map(colId => {
                  const col = ALL_COLUMNS.find(c => c.id === colId)
                  return (
                    <div key={colId} className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-[#003366] rounded-full group transition-all">
                      <span className="text-[11px] font-bold text-[#003366] uppercase tracking-widest">{col?.label}</span>
                      <button onClick={() => toggleColumn(colId)} className="text-[#003366] hover:text-red-600">
                        <X size={12} />
                      </button>
                    </div>
                  )
                })}
                <div className="relative ml-2">
                   <select 
                      onChange={(e) => {
                        if (e.target.value) toggleColumn(e.target.value)
                        e.target.value = ""
                      }}
                      className="h-11 pl-5 pr-12 bg-white border-2 border-[#003366] rounded-full font-bold text-[12px] uppercase tracking-widest text-[#003366] appearance-none focus:ring-2 focus:ring-[#003366]/10 outline-none cursor-pointer"
                    >
                      <option value="">+ Add Column</option>
                      {ALL_COLUMNS.filter(c => !selectedCols.includes(c.id)).map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    <Plus size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#003366]" />
                </div>
                
                <button
                   onClick={handleExport}
                   disabled={exporting || loading}
                   className="btn-saffron h-11 !px-10 !bg-[#003366] flex items-center justify-center gap-3 shadow-xl active:scale-95 ml-4"
                >
                   {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                   <span className="text-[12px] font-black uppercase tracking-widest">{exporting ? 'Compiling...' : 'Export Excel'}</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-up">
        <ApplicantsTable 
          data={applications} 
          loading={loading}
          sortBy={filters.sortBy}
          order={filters.order}
          onSort={handleSort}
          visibleColumns={selectedCols}
        />
        
        {/* Pagination Controls */}
        {!loading && totalCount > 0 && (
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 glass-card !p-6 bg-white border-blue-50">
            <p className="text-[11px] font-black text-[#003366]/40 uppercase tracking-widest italic">
              Showing <span className="text-[#003366] font-bold">{(page-1)*limit + 1}</span> to <span className="text-[#003366] font-bold">{Math.min(page*limit, totalCount)}</span> of <span className="text-[#003366] font-bold">{totalCount}</span> entries
            </p>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 rounded-xl bg-blue-50 text-[#003366] disabled:opacity-30 hover:bg-blue-100 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = page
                  if (page <= 3) pageNum = i + 1
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = page - 2 + i
                  
                  if (pageNum < 1 || pageNum > totalPages) return null
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                        page === pageNum 
                          ? 'bg-[#003366] text-white shadow-lg scale-110' 
                          : 'bg-white border border-blue-50 text-[#003366] hover:bg-blue-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-3 rounded-xl bg-blue-50 text-[#003366] disabled:opacity-30 hover:bg-blue-100 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black text-[#003366]/30 uppercase tracking-widest">Page Size</span>
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#003366] outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
