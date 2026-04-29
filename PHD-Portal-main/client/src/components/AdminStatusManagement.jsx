import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  CheckCircle, Clock, Ban, Loader2, UserCheck,
  Circle, Check, Search, CreditCard, AlertCircle, ExternalLink
} from 'lucide-react'
import { getAllApplications, updateApplicationStatus, updatePaymentStatus } from '../services/api'

const STATUSES = [
  { id: 'pending',     label: 'Pending',     color: 'text-slate-400' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'text-blue-500' },
  { id: 'waitlisted',  label: 'Waitlisted',  color: 'text-orange-500' },
  { id: 'rejected',    label: 'Rejected',    color: 'text-red-500' },
  { id: 'selected',    label: 'Selected',    color: 'text-green-600' },
]

const PAYMENT_STATUSES = {
  pending:   { label: 'Pending',   bg: 'bg-slate-100 text-slate-500 border-slate-200' },
  initiated: { label: 'Initiated', bg: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  completed: { label: 'Verified',  bg: 'bg-green-50  text-green-600  border-green-200' },
  failed:    { label: 'Failed',    bg: 'bg-red-50    text-red-600    border-red-200' },
}

export default function AdminStatusManagement() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [paymentUpdatingId, setPaymentUpdatingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPayment, setFilterPayment] = useState('all')

  useEffect(() => { fetchApplications() }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await getAllApplications({ limit: 200 })
      setApplications(res.data.applications || [])
    } catch {
      toast.error('Scholastic records inaccessible')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      await updateApplicationStatus(id, newStatus)
      toast.success(`Status → ${newStatus}`)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    } catch {
      toast.error('Status update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePaymentVerify = async (id, newPaymentStatus) => {
    setPaymentUpdatingId(id)
    try {
      await updatePaymentStatus(id, newPaymentStatus)
      toast.success(`Payment marked as ${newPaymentStatus}`)
      setApplications(prev =>
        prev.map(a => a.id === id ? { ...a, payment_status: newPaymentStatus } : a)
      )
    } catch {
      toast.error('Payment update failed')
    } finally {
      setPaymentUpdatingId(null)
    }
  }

  const filtered = applications.filter(a => {
    const term = searchTerm.toLowerCase()
    const matchSearch = (
      a.full_name?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      a.transaction_id?.toLowerCase().includes(term)
    )
    const matchPayment = filterPayment === 'all' || a.payment_status === filterPayment
    return matchSearch && matchPayment
  })

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-8">
      <Loader2 className="animate-spin text-[#003366]" size={40} />
      <p className="text-[10px] font-black text-[#003366]/40 uppercase tracking-[0.4em] animate-pulse">
        Synchronizing Registry Core...
      </p>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative group flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search name, email, or transaction ID..."
            className="w-full h-12 pl-12 pr-4 bg-white border border-blue-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all"
          />
        </div>

        <select
          value={filterPayment}
          onChange={e => setFilterPayment(e.target.value)}
          className="h-12 px-4 bg-white border border-blue-100 rounded-xl text-xs font-bold text-[#003366] uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#003366]/10"
        >
          <option value="all">All Payments</option>
          <option value="pending">Pending</option>
          <option value="initiated">Initiated</option>
          <option value="completed">Verified</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',    count: applications.length,                                            color: 'bg-slate-50  text-slate-600  border-slate-200' },
          { label: 'Pending',  count: applications.filter(a => !a.payment_status || a.payment_status === 'pending').length, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
          { label: 'Verified', count: applications.filter(a => a.payment_status === 'completed').length, color: 'bg-green-50  text-green-600  border-green-200' },
          { label: 'Failed',   count: applications.filter(a => a.payment_status === 'failed').length,    color: 'bg-red-50    text-red-500    border-red-200' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.color} flex items-center justify-between`}>
            <p className="text-[10px] font-black uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-bold">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Applicant Cards */}
      <div className="space-y-4">
        {filtered.map((app) => {
          const pStatus = app.payment_status || 'pending'
          const pInfo = PAYMENT_STATUSES[pStatus] || PAYMENT_STATUSES.pending
          const isUpdating = updatingId === app.id
          const isPaymentUpdating = paymentUpdatingId === app.id

          return (
            <div key={app.id} className="glass-card !p-6 border-blue-50 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                {/* Identity */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center border border-blue-100 shrink-0">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#001122] text-base leading-tight">
                      {app.full_name || app.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{app.email}</p>
                    <p className="text-[10px] text-slate-300 font-mono mt-1">#{app.id?.slice(-8)}</p>
                  </div>
                </div>

                {/* Payment Block */}
                <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${pInfo.bg}`}>
                      {pInfo.label}
                    </span>
                  </div>

                  {app.transaction_id ? (
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Transaction ID</p>
                      <p className="font-mono text-xs text-[#003366] font-bold mt-0.5">{app.transaction_id}</p>
                      {app.payment_date && (
                        <p className="text-[9px] text-slate-400 mt-1">
                          Date: {new Date(app.payment_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-300 italic">No payment submitted</p>
                  )}

                  {/* Payment action buttons */}
                  {app.transaction_id && pStatus !== 'completed' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handlePaymentVerify(app.id, 'completed')}
                        disabled={isPaymentUpdating}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all disabled:opacity-50"
                      >
                        {isPaymentUpdating ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />}
                        Verify
                      </button>
                      <button
                        onClick={() => handlePaymentVerify(app.id, 'failed')}
                        disabled={isPaymentUpdating}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        <Ban size={10} /> Reject
                      </button>
                    </div>
                  )}
                  {pStatus === 'completed' && (
                    <p className="text-[9px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle size={10} /> Payment Verified
                    </p>
                  )}
                </div>

                {/* Status Buttons */}
                <div className="flex flex-wrap items-center gap-2 lg:ml-4">
                  {STATUSES.map(s => {
                    const isActive = (app.status || 'pending') === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleStatusChange(app.id, s.id)}
                        disabled={isUpdating}
                        className={`px-4 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border transition-all duration-200 flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#003366] border-[#003366] text-white shadow-lg scale-105'
                            : 'bg-white border-blue-100 text-slate-400 hover:border-[#003366]/30 hover:text-slate-600'
                        }`}
                      >
                        {isActive ? <Check size={9} strokeWidth={3} /> : <Circle size={4} className="fill-current opacity-30" />}
                        {s.label}
                      </button>
                    )
                  })}
                  {isUpdating && <Loader2 size={14} className="animate-spin text-[#003366]" />}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-24 text-center glass-card border-dashed border-2 border-blue-100 bg-white">
            <AlertCircle size={32} className="mx-auto text-blue-200 mb-4" />
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
              No candidates match the current filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
