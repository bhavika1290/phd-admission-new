import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Send, Loader2, Mail, Users, CheckCircle, Search, Rocket, Zap, SlidersHorizontal, LayoutTemplate } from 'lucide-react'
import { getEmailTemplates, getAllApplications, sendBulkEmail } from '../services/api'

export default function AdminEmailBulkSender() {
  const [templates, setTemplates] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedApplicants, setSelectedApplicants] = useState([])
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchInitialData() }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [tRes, aRes] = await Promise.all([getEmailTemplates(), getAllApplications()])
      setTemplates(tRes.data.templates || [])
      setApplications(aRes.data.applications || [])
    } catch {
      toast.error('Strategic initialization failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (filtered) => {
    const ids = filtered.map(a => a.id)
    setSelectedApplicants(ids)
  }

  const toggleSelect = (id) => {
    setSelectedApplicants(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSend = async () => {
    if (!selectedTemplate || !selectedApplicants.length) return toast.error('Query parameters incomplete')
    if (!window.confirm(`Initiate broadcast to ${selectedApplicants.length} candidates?`)) return
    
    setSending(true)
    try {
      await sendBulkEmail({ templateId: selectedTemplate, applicationIds: selectedApplicants })
      toast.success('High-volume broadcast complete')
      setSelectedApplicants([])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Broadcast failure')
    } finally {
      setSending(false)
    }
  }

  const filteredApps = applications.filter(a => {
    const matchesSearch = a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-8">
      <div className="spinner border-t-[#003366]" />
      <p className="text-[10px] font-black text-[#003366] uppercase tracking-[0.4em] animate-pulse">Initializing Broadcast Hub...</p>
    </div>
  )

  const statusOptions = [
    { id: 'all', label: 'All Candidates' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'selected', label: 'Selected' },
    { id: 'waitlisted', label: 'Waitlisted' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'pending', label: 'Pending' },
  ]

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Template Selection */}
        <div className="glass-card !p-8 border-blue-50 shadow-xl bg-white">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-[#003366] text-white shadow-lg">
                 <LayoutTemplate size={18} />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#001122]">Select Template</h3>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black text-[#003366] uppercase tracking-widest opacity-40 ml-1">Logic Blueprint</label>
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
                className="form-input !py-4 !px-6 font-bold text-[11px] bg-blue-50/30 border-blue-50 uppercase tracking-widest text-[#003366] appearance-none"
              >
                <option value="">Choose Registry Template...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
           </div>
        </div>

        {/* Right: Status Targeting */}
        <div className="glass-card !p-8 border-blue-50 shadow-xl bg-white">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-blue-50 text-[#003366] border border-blue-100 shadow-sm">
                 <SlidersHorizontal size={18} />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#001122]">Target Audience</h3>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black text-[#003366] uppercase tracking-widest opacity-40 ml-1">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                 {statusOptions.map(opt => (
                   <button
                     key={opt.id}
                     onClick={() => setSelectedStatus(opt.id)}
                     className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                       selectedStatus === opt.id 
                        ? 'bg-[#003366] text-white border-[#003366] shadow-lg scale-105' 
                        : 'bg-white border-blue-50 text-[#003366]/40 hover:border-blue-100'
                     }`}
                   >
                     {opt.label}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Main Broadcast Control */}
      <div className="glass-card !p-8 border-blue-50 shadow-2xl bg-white space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-blue-50">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-blue-50 text-[#003366] border border-blue-100 italic">
                  <Users size={18} />
               </div>
               <div className="flex flex-col">
                  <h3 className="text-xl font-bold font-heading text-[#001122]">Recipient Registry</h3>
                  <p className="text-[9px] font-black text-[#003366]/30 uppercase tracking-[0.2em] mt-1 italic italic">Active Targets: {selectedApplicants.length} / {filteredApps.length}</p>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#003366]/30" size={16} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search Nodes..." 
                    className="h-10 pl-12 pr-6 bg-[#003366]/5 border border-blue-50 rounded-full font-bold text-[10px] uppercase tracking-widest text-[#001122] outline-none focus:ring-2 focus:ring-[#003366]/5 w-64 transition-all"
                  />
               </div>
               <button 
                 onClick={() => handleSelectAll(filteredApps)}
                 className="h-10 px-6 rounded-full border border-blue-50 text-[#003366]/40 text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-[#003366] transition-all"
               >
                 Select Visible
               </button>
               <button
                 disabled={sending || !selectedTemplate || !selectedApplicants.length}
                 onClick={handleSend}
                 className="btn-saffron h-10 !px-8 flex items-center justify-center gap-3 shadow-xl active:scale-95"
               >
                 {sending ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                 <span className="text-[10px] font-black uppercase tracking-widest">{sending ? 'Sending...' : 'Send Broadcast'}</span>
               </button>
            </div>
         </div>

         <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[#003366]/20 border-b border-blue-50">
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest w-16">Select</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Candidate</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-blue-50/50">
                  {filteredApps.map(app => (
                    <tr key={app.id} className={`group cursor-pointer transition-all ${selectedApplicants.includes(app.id) ? 'bg-[#003366]/5' : ''}`} onClick={() => toggleSelect(app.id)}>
                      <td className="px-6 py-5 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedApplicants.includes(app.id)}
                          readOnly
                          className="w-4 h-4 rounded border-blue-100 text-[#003366] focus:ring-[#003366]/10"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-[#001122] tracking-tight">{app.full_name || app.name}</p>
                        <p className="text-[10px] font-medium text-[#4169E1] lowercase italic">{app.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 text-[#003366]">
                          {app.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
