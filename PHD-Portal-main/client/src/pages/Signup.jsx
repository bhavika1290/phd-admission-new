import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, ArrowRight, User, Lock, Loader2, KeyRound } from 'lucide-react'
import { registerUser as apiRegisterUser, verifySignupOtp as apiVerifySignupOtp } from '../services/api'
import { useAuth } from '../context/AuthContext'
import iitLogo from '../assets/iit_ropar_logo.png'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('register') // 'register' | 'otp'
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return toast.error('Fill all fields.')
    setLoading(true)
    try {
      const res = await apiRegisterUser(name.trim(), email.trim(), password.trim())
      toast.success(res.data?.demoOtp ? `Code: ${res.data.demoOtp}` : 'Code sent!')
      setStep('otp')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!otp.trim()) return toast.error('Enter code.')
    setLoading(true)
    try {
      const res = await apiVerifySignupOtp(email.trim(), otp.trim())
      login(res.data.token, res.data.user)
      toast.success('Account verified!')
      navigate('/apply')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF6FF] flex items-center justify-center p-6 text-[#2D2340]">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#B8ECD8] rounded-full blur-[100px] opacity-20 -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#C9B8F8] rounded-full blur-[100px] opacity-20 translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative w-full max-w-md space-y-10 animate-fade-up">
        <div className="text-center space-y-4">
          <img src={iitLogo} alt="IIT Ropar" className="h-20 mx-auto drop-shadow-xl" />
          <h1 className="text-4xl font-bold tracking-tight">Create Account</h1>
          <p className="text-[#7B6E8E] text-[10px] uppercase font-black tracking-[0.3em]">Join our research excellence</p>
        </div>

        <div className="glass-card !p-8 border-white/60">
          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="form-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9B8F8]" size={18} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input !pl-12" placeholder="John Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9B8F8]" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input !pl-12" placeholder="name@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="form-label">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9B8F8]" size={18} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input !pl-12" placeholder="••••••••" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-saffron w-full py-4 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <>Send Verification Code <ArrowRight size={18} /></>}
              </button>
              <p className="text-center text-xs text-[#7B6E8E]">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-[#C9B8F8] font-bold hover:underline">Sign In</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#C9B8F8]/5 border border-[#C9B8F8]/20 text-[11px] text-[#7B6E8E] font-medium">
                Check your email <span className="text-[#2D2340] font-bold">{email}</span> for the code.
              </div>
              <div className="space-y-2">
                <label className="form-label">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9B8F8]" size={18} />
                  <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className="form-input !pl-12 tracking-[1em] text-center text-lg font-bold" placeholder="000000" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-saffron w-full py-4 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <>Verify & Continue <ArrowRight size={18} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}