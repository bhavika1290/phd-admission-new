import React, { useState } from 'react'
import { Filter, SlidersHorizontal, Search, Settings2, RotateCcw, Hash, BarChart3, ArrowUpDown } from 'lucide-react'

export default function AdminFilterSort({ filters, onFilterChange, onSortChange }) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value })
  }

  const resetFilters = () => {
    onFilterChange({ 
      status: 'all', 
      category: 'all', 
      eligibility: 'all', 
      minCgpa: '', 
      minGate: '' 
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      <div className="space-y-2 lg:col-span-1">
        <label className="text-[11px] font-black text-[#003366] uppercase tracking-widest ml-1">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="form-input !py-4 !px-5 font-bold text-[13px] bg-white border-2 border-[#003366] uppercase tracking-wider text-[#003366]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-2 lg:col-span-1">
          <label className="text-[11px] font-black text-[#003366] uppercase tracking-widest ml-1">Category</label>
          <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="form-input !py-4 !px-5 font-bold text-[13px] bg-white border-2 border-[#003366] uppercase tracking-wider text-[#003366]"
        >
          <option value="all">All Category</option>
          <option value="GEN">General</option>
          <option value="OBC">OBC-NCL</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="EWS">EWS</option>
        </select>
      </div>

      <div className="space-y-2 lg:col-span-1">
          <label className="text-[11px] font-black text-[#003366] uppercase tracking-widest ml-1">Min CGPA</label>
          <div className="relative">
            <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#003366]" />
            <input
            type="number"
            step="0.1"
            placeholder="0.0"
            value={filters.minCgpa}
            onChange={(e) => handleFilterChange('minCgpa', e.target.value)}
            className="form-input !py-4 !pl-10 !px-5 font-bold text-[13px] bg-white border-2 border-[#003366] text-[#003366] placeholder-[#003366]/20"
            />
          </div>
      </div>

      <div className="space-y-2 lg:col-span-1">
          <label className="text-[11px] font-black text-[#003366] uppercase tracking-widest ml-1">GATE Score</label>
          <div className="relative">
            <BarChart3 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#003366]" />
            <input
            type="number"
            placeholder="0"
            value={filters.minGate}
            onChange={(e) => handleFilterChange('minGate', e.target.value)}
            className="form-input !py-4 !pl-10 !px-5 font-bold text-[13px] bg-white border-2 border-[#003366] text-[#003366] placeholder-[#003366]/20"
            />
          </div>
      </div>

      <div className="space-y-2 lg:col-span-1">
        <label className="text-[11px] font-black text-[#003366] uppercase tracking-widest ml-1">Sorting</label>
        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#003366]" />
          <select
            onChange={(e) => onSortChange(e.target.value)}
            className="form-input !py-4 !pl-10 !px-5 font-bold text-[13px] bg-white border-2 border-[#003366] uppercase tracking-widest text-[#003366] appearance-none"
          >
            <option value="created_at-desc">Latest</option>
            <option value="created_at-asc">Oldest</option>
            <option value="full_name-asc">Name A-Z</option>
            <option value="full_name-desc">Name Z-A</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col justify-end lg:col-span-1">
        <button 
          onClick={resetFilters}
          className="h-[52px] px-6 rounded-xl border-2 border-red-200 text-red-600 font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  )
}
