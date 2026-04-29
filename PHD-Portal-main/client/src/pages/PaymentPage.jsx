import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  CreditCard, FileText, ArrowRight, CheckCircle, 
  ExternalLink, Calendar, Hash, ChevronLeft, Loader2
} from 'lucide-react'
import { finalizeApplication } from '../services/api'

export default function PaymentPage() {
  const navigate = useNavigate()
  const [transactionId, setTransactionId] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!transactionId || !paymentDate) {
      toast.error('Fill required verification fields.')
      return
    }
    setSubmitting(true)
    try {
      await finalizeApplication({ transaction_id: transactionId, payment_date: paymentDate })
      toast.success('Strategy Finalized')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failure')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] py-24 px-6 text-[#001f3f]">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#003366] rounded-full blur-[140px] opacity-[0.05] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4169E1] rounded-full blur-[120px] opacity-[0.05] -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 animate-fade-up">
        <button
          onClick={() => navigate('/apply')}
          className="flex items-center gap-5 text-[#003366] font-black uppercase tracking-[0.4em] text-[10px] mb-20 hover:tracking-[0.5em] transition-all group"
        >
          <div className="p-4 rounded-2xl border border-blue-100 bg-white group-hover:bg-[#003366] group-hover:text-[#F0F9FF] transition-all shadow-xl">
            <ChevronLeft size={20} />
          </div>
          Return to Registry
        </button>

        <div className="text-center mb-24">
          <h1 className="text-6xl font-bold mb-6 tracking-tight text-[#001f3f]">Verification Protocol</h1>
          <p className="text-[#003366] max-w-lg mx-auto font-black uppercase tracking-[0.5em] text-[11px] opacity-40 italic">
            Binding documentation for official doctoral admission
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div className="glass-card !p-12 border-blue-50 shadow-2xl">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-[24px] bg-[#003366] flex items-center justify-center text-[#F0F9FF] shadow-2xl">
                  <FileText size={30} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-[#001f3f]">Registry Portal</h2>
              </div>
              <p className="text-[#003366] mb-12 text-sm leading-relaxed font-bold opacity-70">
                Execute formal scholarship transaction via the consolidated SBI system. Archive your reference identifier for final locking.
              </p>
              <div className="space-y-6">
                <a href="https://www.onlinesbi.sbi/sbicollect/" target="_blank" rel="noopener noreferrer" className="btn-saffron w-full py-5 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em]">
                  SBI Collect Gateway <ExternalLink size={20} />
                </a>
                <a href="/brochure.pdf" target="_blank" className="btn-secondary w-full py-5 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em]">
                  Download Guidelines
                </a>
              </div>
            </div>

            <div className="glass-card !p-10 bg-[#003366]/5 border-blue-100 shadow-inner">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-2.5 h-2.5 bg-[#4169E1] rounded-full animate-pulse" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#003366] opacity-60">Compliance Checklist:</h3>
               </div>
              <ul className="text-[11px] text-[#003366] space-y-5 font-black uppercase tracking-widest opacity-80 pl-2">
                <li className="flex gap-5"><span>01.</span> Global Scholarship Node</li>
                <li className="flex gap-5"><span>02.</span> Search Key: 'IIT ROPAR'</li>
                <li className="flex gap-5"><span>03.</span> Secure Ref Number Archive</li>
              </ul>
            </div>
          </div>

          <div className="glass-card !p-12 border-blue-50 shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#003366]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-30" />
            
            <div className="flex items-center gap-6 mb-12 relative z-10">
              <div className="w-16 h-16 rounded-[24px] bg-blue-50/50 flex items-center justify-center text-[#003366] border border-blue-100 shadow-inner">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold font-heading text-[#001f3f]">Strategy Lock</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="form-label !ml-2">Registry Collection ID</label>
                  <div className="relative group">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-[#003366]/30 group-focus-within:text-[#003366] transition-colors" size={22} />
                    <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="form-input !pl-16 !py-5" placeholder="DU00123456" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="form-label !ml-2">Cycle Chronology</label>
                  <div className="relative group">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#003366]/30 group-focus-within:text-[#003366] transition-colors" size={22} />
                    <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="form-input !pl-16 !py-5" />
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <button type="submit" disabled={submitting} className="btn-saffron w-full py-6 flex items-center justify-center gap-5 text-xs font-black uppercase tracking-[0.5em] shadow-2xl scale-105 active:scale-95 disabled:opacity-30">
                  {submitting ? <Loader2 size={24} className="animate-spin" /> : <>Archive Final Protocol <ArrowRight size={22} /></>}
                </button>
                <p className="text-[9px] text-[#003366] uppercase font-black tracking-[0.6em] opacity-30 mt-10 text-center leading-relaxed">
                  Encryption Layer 03-Active · SB-Collect Verified
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
