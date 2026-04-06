import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Calendar,
  Hash,
  ChevronLeft
} from 'lucide-react'
import { finalizeApplication } from '../services/api'
import FormSection, { FieldWrapper } from '../components/FormSection'

export default function PaymentPage() {
  const navigate = useNavigate()
  const [transactionId, setTransactionId] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!transactionId || !paymentDate) {
      toast.error('Please fill in both Transaction ID and Date.')
      return
    }

    setSubmitting(true)
    try {
      await finalizeApplication({
        transaction_id: transactionId,
        payment_date: paymentDate
      })
      toast.success('Application finalized successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to finalise application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/apply')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to Application</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 font-heading">Finalize Your Application</h1>
          <p className="text-white/60 max-w-lg mx-auto">
            Please complete the payment process via SB Collect and provide the transaction details below to submit your application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Payment Instructions & Brochure */}
          <div className="space-y-6">
            <div className="bg-dark-900/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Payment Instructions</h2>
              </div>
              
              <p className="text-white/70 mb-6 text-sm leading-relaxed">
                For payment and other important details, please review the admission brochure. 
                Use the SB Collect link below to pay the application fee.
              </p>

              <div className="space-y-4">
                <a
                  href="/brochure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all group"
                >
                  <span className="text-sm font-medium">View Admission Brochure</span>
                  <ExternalLink size={16} className="text-white/40 group-hover:text-white" />
                </a>

                <a
                  href="https://www.onlinesbi.sbi/sbicollect/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-primary-gradient text-white hover:opacity-90 transition-all shadow-lg shadow-primary-500/20"
                >
                  <span className="text-sm font-bold">Click here for Payment (SB Collect)</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="bg-dark-900/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <h3 className="text-white font-bold mb-4">Note for SB Collect:</h3>
              <ul className="text-sm text-white/50 space-y-2 list-disc list-inside">
                <li>Select 'Educational Institutions'</li>
                <li>Search for 'IIT Ropar'</li>
                <li>Select the appropriate payment category</li>
                <li>Save the transaction ID and receipt for your records</li>
              </ul>
            </div>
          </div>

          {/* Submission Form */}
          <div className="bg-dark-900/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-success-500/20 flex items-center justify-center border border-success-500/30">
                <CheckCircle className="text-success-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Transaction Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Hash size={14} className="text-primary-400" />
                    Transaction ID / Reference Number
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. DUXXXXXXXX"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Calendar size={14} className="text-primary-400" />
                    Date of Transaction
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Final Application</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-white/30 mt-4 uppercase tracking-widest font-bold">
                  This action is final and cannot be undone
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
