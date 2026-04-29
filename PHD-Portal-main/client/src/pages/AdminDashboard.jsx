import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  GraduationCap, LogOut, Users, Loader2,
  Calendar, Mail, Shield, LayoutDashboard,
  RefreshCw, MessageSquare, Trophy, ChevronUp, ChevronDown,
  LayoutTemplate
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { calculateMeritList, getAllApplications } from '../services/api'
import AdminAnalytics from '../components/AdminAnalytics'
import AdminApplicants from './AdminApplicants'
import AdminInbox from '../components/AdminInbox'
import AdminStatusManagement from '../components/AdminStatusManagement'
import AdminEmailTemplates from '../components/AdminEmailTemplates'
import AdminEmailBulkSender from '../components/AdminEmailBulkSender'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [loadingMerit, setLoadingMerit] = useState(false)
  const [meritList, setMeritList] = useState([])
  const [loadingMeritList, setLoadingMeritList] = useState(false)

  const tabs = [
    { id: 'overview',   label: 'Intelligence',  icon: LayoutDashboard },
    { id: 'applicants', label: 'Registry',       icon: Users },
    { id: 'status',     label: 'Status',         icon: Shield },
    { id: 'merit',      label: 'Merit List',     icon: Trophy },
    { id: 'inbox',      label: 'Inbox',          icon: MessageSquare },
    { id: 'templates',  label: 'Templates',      icon: LayoutTemplate },
    { id: 'broadcast',  label: 'Broadcast',      icon: Mail },
    { id: 'interviews', label: 'Scheduling',     icon: Calendar },
  ]

  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      toast.error('Sign out failed')
    }
  }

  const handleGenerateMeritList = async () => {
    setLoadingMerit(true)
    try {
      await calculateMeritList()
      toast.success('Merit list compiled successfully')
      if (activeTab === 'merit') fetchMeritList()
    } catch {
      toast.error('Failed to compile merit list')
    } finally {
      setLoadingMerit(false)
    }
  }

  const fetchMeritList = async () => {
    setLoadingMeritList(true)
    try {
      const res = await getAllApplications({ sortBy: 'rank', order: 'asc', limit: 200 })
      const apps = (res.data.applications || []).filter(a => a.rank)
      setMeritList(apps)
    } catch {
      toast.error('Failed to load merit list')
    } finally {
      setLoadingMeritList(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'merit') fetchMeritList()
  }, [activeTab])

  const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#003366] text-white shadow-lg">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em]">Command Center</p>
              <p className="text-[10px] opacity-60 uppercase font-black tracking-widest">IIT Ropar Admissions Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateMeritList}
              disabled={loadingMerit}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
            >
              {loadingMerit ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Re-Rank Merit List
            </button>
            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-blue-50 sticky top-[72px] z-40 shadow-sm overflow-x-auto">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-8 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    isActive ? 'text-[#003366]' : 'text-slate-400 hover:text-[#003366]'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003366] rounded-t-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-10">

        {/* Intelligence / Analytics */}
        {activeTab === 'overview' && (
          <div>
            <div className="mb-10 pb-8 border-b border-blue-50 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#001122]">
                  Strategic Intelligence
                </h1>
                <p className="text-[10px] font-black text-[#003366]/30 uppercase tracking-widest mt-2">
                  Real-time analytics for the current admission cycle
                </p>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-blue-50 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#003366]">Live Feed</span>
              </div>
            </div>
            <AdminAnalytics />
          </div>
        )}

        {/* Registry / Applicants */}
        {activeTab === 'applicants' && (
          <div>
            <div className="mb-8 pb-6 border-b border-blue-50">
              <h1 className="text-4xl font-bold text-[#001122]">
                Applicant Registry
              </h1>
              <p className="text-[10px] font-black text-[#003366]/30 uppercase tracking-widest mt-2">
                Browse, filter, sort and export applicant data
              </p>
            </div>
            <AdminApplicants />
          </div>
        )}

        {/* Status Management */}
        {activeTab === 'status' && (
          <div>
            <div className="mb-8 pb-6 border-b border-blue-50">
              <h1 className="text-4xl font-bold text-[#001122]">
                Status & Payment Control
              </h1>
              <p className="text-[10px] font-black text-[#003366]/30 uppercase tracking-widest mt-2">
                Update application statuses and verify payment transactions
              </p>
            </div>
            <AdminStatusManagement />
          </div>
        )}

        {/* Merit List */}
        {activeTab === 'merit' && (
          <div>
            <div className="mb-8 pb-6 border-b border-blue-50 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#001122]">
                  Merit Ranking
                </h1>
                <p className="text-[10px] font-black text-[#003366]/30 uppercase tracking-widest mt-2">
                  Auto-ranked by: 50% GATE · 20% PG · 20% Graduation · 10% 12th
                </p>
              </div>
              <button
                onClick={handleGenerateMeritList}
                disabled={loadingMerit}
                className="flex items-center gap-2 px-6 py-3 bg-[#003366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#002244] transition-all shadow-lg disabled:opacity-50"
              >
                {loadingMerit ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Re-Calculate Rankings
              </button>
            </div>

            {loadingMeritList ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#003366]/30" size={40} />
              </div>
            ) : meritList.length === 0 ? (
              <div className="text-center py-24 glass-card border-dashed border-2 border-blue-100 bg-white rounded-3xl">
                <Trophy size={48} className="mx-auto text-blue-100 mb-6" />
                <p className="font-bold text-[#003366]/30 text-sm uppercase tracking-widest">No ranked applicants yet</p>
                <p className="text-xs text-slate-300 mt-2">Click "Re-Calculate Rankings" to generate the merit list</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Total Ranked', value: meritList.length, color: 'text-[#003366]' },
                    { label: 'Top Score', value: meritList[0]?.merit_score?.toFixed(1) || '—', color: 'text-green-600' },
                    { label: 'Avg Score', value: meritList.length ? (meritList.reduce((s, a) => s + (a.merit_score || 0), 0) / meritList.length).toFixed(1) : '—', color: 'text-blue-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-blue-50 p-5 text-center shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                      <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-50">
                        <th className="py-4 px-5 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                        <th className="py-4 px-5 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">Candidate</th>
                        <th className="py-4 px-5 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Category</th>
                        <th className="py-4 px-5 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Research</th>
                        <th className="py-4 px-5 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meritList.map((app, i) => (
                        <tr key={app.id} className="border-b border-blue-50/50 hover:bg-blue-50/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              {i < 3 ? (
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-md"
                                  style={{ background: MEDAL_COLORS[i] }}
                                >
                                  {app.rank}
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-slate-400 w-8 text-center">{app.rank}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <p className="font-bold text-[#001122] text-sm">{app.full_name || app.name}</p>
                            <p className="text-[10px] text-slate-400">{app.email}</p>
                          </td>
                          <td className="py-4 px-5 hidden md:table-cell">
                            <span className="text-xs font-medium text-slate-500">{app.category || '—'}</span>
                          </td>
                          <td className="py-4 px-5 hidden lg:table-cell">
                            <span className="text-xs text-slate-400 truncate max-w-[200px] block">{app.research_pref_1 || '—'}</span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <span className="text-sm font-black text-[#003366]">
                              {app.merit_score?.toFixed(2) || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Inbox */}
        {activeTab === 'inbox' && (
          <div>
            <div className="mb-8 pb-6 border-b border-blue-50">
              <h1 className="text-4xl font-bold text-[#001122]">
                Applicant Inbox
              </h1>
              <p className="text-[10px] font-black text-[#003366]/30 uppercase tracking-widest mt-2">
                Read and respond to applicant messages
              </p>
            </div>
            <AdminInbox />
          </div>
        )}

        {/* Interview Scheduling */}
        {activeTab === 'interviews' && (
          <div>
            <div className="mb-8 pb-6 border-b border-blue-50">
              <h1 className="text-4xl font-bold text-[#001122]">
                Interview Scheduling
              </h1>
              <p className="text-[10px] font-black text-[#003366]/30 uppercase tracking-widest mt-2">
                Manage interview slots and assign candidates
              </p>
            </div>
            <div className="text-center py-24 glass-card border-dashed border-2 border-blue-100 bg-white rounded-3xl">
              <Calendar size={48} className="mx-auto text-blue-100 mb-6" />
              <p className="font-bold text-[#003366]/30 text-sm uppercase tracking-widest">Scheduling module coming soon</p>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                Auto-scheduling algorithms are processing candidate eligibility. Verified slots will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Broadcast */}
        {activeTab === 'broadcast' && (
          <div>
            <div className="mb-8 pb-6 border-b border-blue-50">
              <h1 className="text-4xl font-bold text-[#001122]">
                Broadcast Hub
              </h1>
              <p className="text-[10px] font-black text-[#003366]/30 uppercase tracking-widest mt-2">
                Send targeted high-volume communications
              </p>
            </div>
            <AdminEmailBulkSender />
          </div>
        )}

        {/* Templates */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-8 pb-6 border-b border-blue-50">
              <h1 className="text-4xl font-bold text-[#001122]">
                Communication Blueprints
              </h1>
              <p className="text-[10px] font-black text-[#003366]/30 uppercase tracking-widest mt-2">
                Manage reusable email templates for the admission cycle
              </p>
            </div>
            <AdminEmailTemplates />
          </div>
        )}

      </main>
    </div>
  )
}
