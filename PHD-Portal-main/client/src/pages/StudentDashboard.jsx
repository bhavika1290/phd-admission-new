import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FileText, Clock, CheckCircle, XCircle, AlertCircle,
  Bell, Calendar, ChevronRight, Loader2, RefreshCw,
  GraduationCap, User, Mail, Phone, MessageSquare, Send, UserCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { 
  getMyApplication, 
  getNotifications, 
  markNotificationRead,
  markAllNotificationsRead,
  getAnnouncements,
  getCalendarEvents,
  sendMessage,
  getMessages
} from '../services/api'
import LoadingScreen from '../components/LoadingScreen'

const STATUS_STEPS = [
  { id: 'submitted', label: 'Submitted', description: 'Application received' },
  { id: 'under_review', label: 'Under Review', description: 'Faculty assessment' },
  { id: 'shortlisted', label: 'Shortlisted', description: 'Eligible for interview' },
  { id: 'interview', label: 'Interview', description: 'Oral examination' },
  { id: 'selected', label: 'Selected', description: 'Admission offered' },
]

const STATUS_MAP = {
  'draft': 0,
  'submitted': 1,
  'under_review': 2,
  'shortlisted': 3,
  'waitlisted': 3, // Waitlisted is still considered shortlisted in the timeline
  'selected': 5,
  'rejected': -1
}

export default function StudentDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [appRes, notifRes, annRes] = await Promise.all([
        getMyApplication(),
        getNotifications(),
        getAnnouncements()
      ])

      setApplication(appRes.data.application)
      setNotifications(notifRes.data.notifications || [])
      setAnnouncements(annRes.data.announcements || [])

      if (appRes.data.application?.id) {
        const msgRes = await getMessages(appRes.data.application.id)
        setMessages(msgRes.data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !application?.id) return

    setSendingMessage(true)
    try {
      const res = await sendMessage(application.id, newMessage.trim())
      setMessages([...messages, res.data.message])
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) return <LoadingScreen />

  const currentStep = STATUS_MAP[application?.status] || 0
  const isRejected = application?.status === 'rejected'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Candidate Hub</p>
              <p className="text-[10px] opacity-60 uppercase font-black">IIT Ropar Admissions</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-70">
              <UserCircle size={14} />
              {user?.name}
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-widest transition-all border border-white/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Progress Timeline */}
          <section className="glass-card !p-10 border-blue-100 shadow-xl bg-white">
            <h2 className="text-xl font-bold font-heading text-[#003366] mb-10 flex items-center gap-3">
              <Clock className="text-blue-500" />
              Admission Lifecycle
            </h2>
            
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-blue-50" />
              <div className="space-y-12">
                {STATUS_STEPS.map((step, idx) => {
                  const isActive = currentStep >= idx + 1
                  const isCompleted = currentStep > idx + 1
                  
                  return (
                    <div key={step.id} className="relative pl-16">
                      <div className={`absolute left-4 -translate-x-1/2 w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-500 ${
                        isCompleted ? 'bg-green-500 border-green-100 scale-125' : 
                        isActive ? 'bg-[#003366] border-blue-100 scale-110 shadow-lg' : 
                        'bg-white border-blue-50'
                      }`}>
                        {isCompleted && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <div>
                        <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-[#003366]' : 'text-slate-300'}`}>
                          {step.label}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium italic">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
                {isRejected && (
                  <div className="relative pl-16">
                    <div className="absolute left-4 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 border-4 border-red-100 flex items-center justify-center z-10">
                      <XCircle size={12} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Rejected</h3>
                      <p className="text-xs text-slate-400 mt-1">Application not successful this session</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Quick Actions & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card !p-8 bg-white border-blue-50 shadow-lg">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#003366] mb-6 border-b border-blue-50 pb-4">Application Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-300 uppercase tracking-widest">Reference ID</span>
                  <span className="font-bold text-[#003366]">#{application?.id?.slice(-8) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-300 uppercase tracking-widest">Research Area</span>
                  <span className="font-bold text-[#003366]">{application?.research_area || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-300 uppercase tracking-widest">Study Mode</span>
                  <span className="font-bold text-[#003366] uppercase">{application?.study_mode || 'Full Time'}</span>
                </div>
                <button 
                  onClick={() => navigate('/application')}
                  className="w-full mt-6 py-4 bg-blue-50 text-[#003366] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                >
                  View Full Profile
                </button>
              </div>
            </div>

            <div className="glass-card !p-8 bg-gradient-to-br from-[#003366] to-[#001122] text-white shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-6 border-b border-white/10 pb-4">Upcoming Schedule</h3>
              {application?.interview_slot ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Calendar size={32} className="text-blue-400" />
                    <div>
                      <p className="text-lg font-bold">Interview Session</p>
                      <p className="text-xs opacity-60">Confirmed Appointment</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-black uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-sm font-bold">{new Date(application.interview_slot.date).toLocaleDateString()} at {application.interview_slot.time}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                  <Clock size={32} className="opacity-20" />
                  <p className="text-xs font-medium opacity-60 italic">Interview schedule pending administrative review</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Inbox & Sidebar */}
        <div className="space-y-10">
          {/* Inbox Component */}
          <section className="glass-card flex flex-col h-[600px] !p-0 border-blue-100 shadow-2xl bg-white overflow-hidden">
            <div className="p-6 bg-[#003366] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Admissions Inbox</h2>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 px-10">
                  <Mail size={40} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No communication threads found. Start a conversation with the admission committee.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user.id
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium shadow-sm ${
                        isMe ? 'bg-[#003366] text-white rounded-tr-none' : 'bg-white border border-blue-50 text-[#001122] rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mt-1">
                        {isMe ? 'You' : 'Admin'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-blue-50 flex gap-2">
              <input 
                type="text"
                placeholder="Type your query..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-[#003366] transition-all"
              />
              <button 
                disabled={sendingMessage || !newMessage.trim()}
                className="w-12 h-12 bg-[#003366] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
              >
                {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </section>

          {/* Announcements */}
          <div className="glass-card !p-8 bg-white border-blue-50 shadow-lg">
             <h3 className="text-sm font-black uppercase tracking-widest text-[#003366] mb-6 border-b border-blue-50 pb-4">Global Alerts</h3>
             <div className="space-y-4">
                {announcements.length > 0 ? announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} className="p-4 bg-blue-50/50 rounded-xl border-l-4 border-[#003366]">
                    <p className="text-[10px] font-bold text-[#003366] uppercase">{ann.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{ann.content}</p>
                  </div>
                )) : (
                  <p className="text-[10px] text-slate-300 italic font-black uppercase tracking-widest">No active system alerts</p>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}