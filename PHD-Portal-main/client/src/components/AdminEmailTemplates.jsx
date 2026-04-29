import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit3, Save, X, FileText, Loader2, Send, LayoutTemplate } from 'lucide-react'
import { getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '../services/api'

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', subject: '', body: '' })

  useEffect(() => { fetchTemplates() }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await getEmailTemplates()
      setTemplates(res.data.templates || [])
    } catch {
      toast.error('Template registry offline')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTemplate) {
        await updateEmailTemplate(editingTemplate.id, formData)
        toast.success('Template updated successfully')
      } else {
        await createEmailTemplate(formData)
        toast.success('New template created')
      }
      resetForm()
      fetchTemplates()
    } catch {
      toast.error('Failed to save template')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this email template?')) return
    try {
      await deleteEmailTemplate(id)
      toast.success('Template removed')
      fetchTemplates()
    } catch {
      toast.error('Delete error')
    }
  }

  const resetForm = () => {
    setEditingTemplate(null)
    setIsAdding(false)
    setFormData({ name: '', subject: '', body: '' })
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-8">
      <div className="spinner border-t-[#003366]" />
      <p className="text-[10px] font-black text-[#003366] uppercase tracking-[0.4em] animate-pulse">Syncing Template Hub...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header Utilities */}
      <div className="flex justify-end pr-4">
        <button
          onClick={() => setIsAdding(true)}
          className="btn-saffron !py-3 !px-8 flex items-center justify-center gap-3 shadow-xl active:scale-95"
        >
          <Plus size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Add Template</span>
        </button>
      </div>

      {(isAdding || editingTemplate) && (
        <div className="glass-card !p-8 border-blue-50 animate-fade-up shadow-2xl relative overflow-hidden bg-white">
          <div className="flex items-center justify-between mb-10 relative z-10">
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#003366] text-white shadow-lg">
                  <LayoutTemplate size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#001122]">{editingTemplate ? 'Edit Template' : 'New Template'}</h3>
             </div>
             <button onClick={resetForm} className="p-2 text-[#003366]/40 hover:text-red-500 transition-all">
               <X size={20} />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-[#003366] uppercase tracking-widest opacity-40 ml-1">Template Name</label>
                 <input 
                   required
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="form-input !py-4 bg-blue-50/30 font-bold text-[11px] !border-blue-100 text-[#001122]"
                   placeholder="e.g., Shortlist Notification"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-[#003366] uppercase tracking-widest opacity-40 ml-1">Email Subject</label>
                 <input 
                   required
                   value={formData.subject}
                   onChange={e => setFormData({...formData, subject: e.target.value})}
                   className="form-input !py-4 bg-blue-50/30 font-bold text-[11px] !border-blue-100 text-[#001122]"
                   placeholder="Application Status Update"
                 />
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-[#003366] uppercase tracking-widest opacity-40 ml-1">Email Body (Markdown/HTML)</label>
               <textarea 
                 required
                 value={formData.body}
                 onChange={e => setFormData({...formData, body: e.target.value})}
                 className="form-input !h-80 !py-6 bg-blue-50/30 font-medium text-[13px] leading-relaxed !border-blue-100 text-[#001122]"
                 placeholder="Enter your message template here..."
               />
             </div>
             <div className="flex justify-end gap-6 pt-4">
                <button type="button" onClick={resetForm} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#003366]/40 hover:text-[#003366]">Cancel</button>
                <button type="submit" className="btn-saffron !py-3 !px-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">
                  <Save size={16} /> Save Template
                </button>
             </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="glass-card !p-6 border-blue-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-white group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-xl bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-all shadow-sm border border-blue-100">
                  <Send size={18} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingTemplate(t); setFormData(t); }} className="p-2 text-[#003366]/40 hover:text-[#003366] hover:bg-blue-50 rounded-lg transition-all">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-[#003366]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 className="text-xl font-bold text-[#001122] tracking-tight">{t.name}</h4>
              <p className="text-[10px] font-bold text-[#4169E1] uppercase tracking-widest mt-2 opacity-60 truncate italic">{t.subject}</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-blue-50 flex items-center justify-between">
               <span className="text-[9px] font-black text-[#003366]/20 uppercase tracking-widest">ID: #{t.id}</span>
               <div className="text-[#003366]/20 group-hover:text-[#003366]/60 transition-colors">
                  <FileText size={16} />
               </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-20 text-center glass-card border-dashed border-2 border-blue-100 opacity-40">
             <p className="text-[11px] font-black text-[#003366] uppercase tracking-widest">No templates created</p>
          </div>
        )}
      </div>
    </div>
  )
}
