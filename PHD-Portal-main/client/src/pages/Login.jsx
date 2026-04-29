import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, KeyRound, ArrowRight, GraduationCap, Loader2, ShieldCheck, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp, loginWithPassword as apiLoginWithPassword, registerUser as apiRegisterUser, verifySignupOtp as apiVerifySignupOtp } from '../services/api'
import iitLogo from '../assets/iit_ropar_logo.png'

const STEP = { EMAIL: 'email', OTP: 'otp', PASSWORD: 'password', SIGNUP: 'signup' }
const TAB = { STUDENT: 'student', admin: 'admin' }

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [tab, setTab]       = useState(TAB.STUDENT)
  const [subTab, setSubTab] = useState('login')
  const [email, setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp]       = useState('')
  const [step, setStep]     = useState(STEP.PASSWORD)
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    const targetEmail = email.trim()

    if (tab === TAB.admin) {
      if (!targetEmail) return toast.error('Please enter your email.')
      setLoading(true)
      try {
        const res = await apiSendOtp(targetEmail)
        toast.success(res.data?.demoOtp ? `Demo login code: ${res.data.demoOtp}` : 'Code sent!')
        setStep(STEP.OTP)
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to send code.')
      } finally {
        setLoading(false)
      }
    } else if (subTab === 'login') {
      const targetPassword = password.trim()
      if (!targetEmail || !targetPassword) return toast.error('Check fields.')
      setLoading(true)
      try {
        const res = await apiLoginWithPassword(targetEmail, targetPassword)
        login(res.data.token, res.data.user)
        toast.success('Welcome back!')
        navigate('/apply')
      } catch (err) {
        toast.error(err.response?.data?.error || 'Invalid credentials.')
      } finally {
        setLoading(false)
      }
    } else {
      if (!name.trim() || !targetEmail || !password.trim()) return toast.error('Fill all fields.')
      setLoading(true)
      try {
        const res = await apiRegisterUser(name.trim(), targetEmail, password.trim())
        toast.success(res.data?.demoOtp ? `Code: ${res.data.demoOtp}` : 'Code sent!')
        setStep(STEP.OTP)
      } catch (err) {
        toast.error(err.response?.data?.error || 'Signup failed.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim()) return toast.error('Enter code.')
    setLoading(true)
    try {
      const apiCall = (tab === TAB.admin) ? apiVerifyOtp : apiVerifySignupOtp
      const res = await apiCall(email.trim(), otp.trim())
      login(res.data.token, res.data.user)
      toast.success('Verified!')
      navigate(res.data.user.isAdmin ? '/admin' : '/apply')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-[#001122]">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#003366] rounded-full blur-[140px] opacity-[0.04] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4169E1] rounded-full blur-[120px] opacity-[0.03] -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative w-full max-w-md space-y-12 animate-fade-up">
        <div className="text-center space-y-4">
          <img 
            src={iitLogo} 
            alt="IIT Ropar" 
            className="h-20 mx-auto drop-shadow-xl hover:scale-110 transition-all duration-700 cursor-pointer" 
            onClick={() => navigate('/')} 
          />
          <h1 className="text-5xl font-bold tracking-tight text-[#001122]">
            {subTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[#003366] text-[10px] uppercase font-black tracking-[0.5em] opacity-40">Join Our Research Excellence</p>
        </div>

        <div className="glass-card !p-12 border-blue-50 shadow-2xl bg-white/95">
          <div className="flex p-1 bg-blue-50/50 rounded-full mb-10 border border-blue-100/50">
            {[
              { key: TAB.STUDENT, label: 'Candidate', icon: GraduationCap },
              { key: TAB.admin, label: 'Official', icon: ShieldCheck },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key)
                  setStep(t.key === TAB.admin ? STEP.EMAIL : (subTab === 'login' ? STEP.PASSWORD : STEP.SIGNUP))
                }}
                className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                  tab === t.key ? 'bg-[#003366] text-white shadow-lg scale-105' : 'text-[#001122]/40 hover:text-[#001122]'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {tab === TAB.STUDENT && step !== STEP.OTP && (
            <div className="flex gap-10 border-b border-blue-50 mb-10 px-4 justify-center">
              {[
                { key: 'login', label: 'Access' },
                { key: 'signup', label: 'Enroll' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => {
                    setSubTab(t.key)
                    setStep(t.key === 'login' ? STEP.PASSWORD : STEP.SIGNUP)
                  }}
                  className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                    subTab === t.key ? 'text-[#003366]' : 'text-[#001122]/30'
                  }`}
                >
                  {t.label}
                  {subTab === t.key && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366] rounded-full shadow-lg" />}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-8">
            {step === STEP.OTP ? (
              <form onSubmit={handleVerifyOtp} className="space-y-10">
                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                  <p className="text-[10px] text-[#003366] font-black uppercase tracking-widest leading-relaxed opacity-40">Verification sent to</p>
                  <p className="text-[#001122] font-black tracking-tight mt-1">{email}</p>
                </div>
                <div className="space-y-4">
                  <label className="form-label text-center block">Authentication Key</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    autoFocus
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="form-input text-center text-4xl font-black tracking-[0.6em] !py-6 bg-blue-50/20 shadow-inner" 
                    placeholder="000000"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-saffron w-full py-5 flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="animate-spin" /> : <>Finalize Access <ArrowRight size={20} /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuth} className="space-y-8">
                {step === STEP.SIGNUP && (
                  <div className="space-y-3">
                    <label className="form-label !text-[#001122]">Full Identity Name</label>
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#003366]/30 group-focus-within:text-[#003366] transition-colors" size={20} />
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="form-input !pl-16 !py-5" 
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <label className="form-label !text-[#001122]">Registry Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[#003366]/30 group-focus-within:text-[#003366] transition-colors" size={20} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="form-input !pl-16 !py-5" 
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                {step !== STEP.EMAIL && (
                  <div className="space-y-3">
                    <label className="form-label !text-[#001122]">Secure Credential</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#003366]/30 group-focus-within:text-[#003366] transition-colors" size={20} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="form-input !pl-16 !py-5" 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
                <button type="submit" disabled={loading} className="btn-saffron w-full py-5 flex items-center justify-center gap-5">
                  {loading ? <Loader2 className="animate-spin" /> : <>{tab === TAB.admin ? 'Authenticate' : (subTab === 'login' ? 'Proceed To Portal' : 'Send Verification Code')} <ArrowRight size={20} /></>}
                </button>
              </form>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-[#001122]/40 uppercase tracking-widest">
              Already have an account? <span onClick={() => { setSubTab('login'); setStep(STEP.PASSWORD); }} className="text-[#003366] hover:underline cursor-pointer">Sign In</span>
            </p>
          </div>
        </div>
        <p className="text-center text-[9px] text-[#001122]/20 font-black uppercase tracking-[0.8em]">Strategic Research Hub Access</p>
      </div>
    </div>
  )
}
