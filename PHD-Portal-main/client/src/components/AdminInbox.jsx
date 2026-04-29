import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  MessageSquare, Send, Loader2, User, Shield, ChevronLeft,
  Search, RefreshCw, Clock
} from 'lucide-react'
import api from '../services/api'

export default function AdminInbox() {
  const [threads, setThreads] = useState([])       // list of applications with messages
  const [selectedApp, setSelectedApp] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { fetchThreads() }, [])
  useEffect(() => { if (selectedApp) fetchMessages(selectedApp.id) }, [selectedApp])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchThreads = async () => {
    setLoadingThreads(true)
    try {
      const res = await api.get('/admin/applications?limit=200')
      const apps = res.data.applications || []
      // Only show apps that have sent at least one message
      // We'll show all submitted apps since we don't have a "has messages" filter
      setThreads(apps.filter(a => a.is_submitted !== false))
    } catch {
      toast.error('Failed to load inbox threads')
    } finally {
      setLoadingThreads(false)
    }
  }

  const fetchMessages = async (applicationId) => {
    setLoadingMessages(true)
    try {
      const res = await api.get(`/admin/messages/${applicationId}`)
      setMessages(res.data.messages || [])
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSend = async () => {
    if (!reply.trim() || !selectedApp) return
    setSending(true)
    try {
      const res = await api.post('/admin/messages', {
        applicationId: selectedApp.id,
        content: reply.trim(),
      })
      setMessages(prev => [...prev, res.data.message])
      setReply('')
    } catch {
      toast.error('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const filteredThreads = threads.filter(a => {
    const term = search.toLowerCase()
    return (
      a.full_name?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term)
    )
  })

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] bg-white rounded-3xl border border-blue-50 shadow-lg overflow-hidden">

      {/* Left Panel — Thread List */}
      <div className={`flex flex-col border-r border-blue-50 ${selectedApp ? 'hidden lg:flex w-80 xl:w-96' : 'flex flex-1 lg:w-80 xl:w-96 lg:flex-none'}`}>
        {/* Header */}
        <div className="p-6 border-b border-blue-50">
          <p className="text-[10px] font-black text-[#003366]/40 uppercase tracking-widest mb-3">Applicant Inbox</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search applicants..."
              className="w-full h-10 pl-10 pr-4 bg-slate-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#003366]/10 border border-transparent focus:border-blue-100"
            />
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-[#003366]/30" size={24} />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-xs text-slate-300 font-black uppercase tracking-widest">No threads</p>
            </div>
          ) : (
            filteredThreads.map(app => {
              const isSelected = selectedApp?.id === app.id
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full text-left p-5 border-b border-blue-50 transition-all hover:bg-blue-50/50 ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-[#003366]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isSelected ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {(app.full_name || app.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#001122] truncate">{app.full_name || app.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{app.email}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      app.status === 'shortlisted' ? 'bg-green-400' :
                      app.status === 'rejected' ? 'bg-red-400' :
                      app.status === 'selected' ? 'bg-blue-500' : 'bg-slate-300'
                    }`} />
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right Panel — Conversation */}
      {selectedApp ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Conversation header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-blue-50 bg-white shrink-0">
            <button
              onClick={() => setSelectedApp(null)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black">
              {(selectedApp.full_name || selectedApp.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#001122] text-sm">{selectedApp.full_name || selectedApp.name}</p>
              <p className="text-[10px] text-slate-400">{selectedApp.email}</p>
            </div>
            <button
              onClick={() => fetchMessages(selectedApp.id)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#F8FAFC]">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin text-[#003366]/30" size={24} />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-xs text-slate-300 font-black uppercase tracking-widest">No messages yet</p>
                <p className="text-xs text-slate-300 mt-2">Send a message to start the conversation</p>
              </div>
            ) : (
              messages.map(msg => {
                const isAdmin = msg.sender?.role !== 'APPLICANT'
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {/* Sender label */}
                      <div className={`flex items-center gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          isAdmin ? 'bg-[#003366] text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isAdmin ? <Shield size={10} /> : <User size={10} />}
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {isAdmin ? 'Admin' : (msg.sender?.name || 'Applicant')}
                        </span>
                      </div>
                      {/* Bubble */}
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-[#003366] text-white rounded-tr-sm'
                          : 'bg-white border border-blue-100 text-[#001122] rounded-tl-sm shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                      {/* Timestamp */}
                      <div className={`flex items-center gap-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <Clock size={9} className="text-slate-300" />
                        <span className="text-[9px] text-slate-300">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Reply Box */}
          <div className="px-6 py-4 border-t border-blue-50 bg-white shrink-0">
            <div className="flex gap-3 items-end">
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Type a reply… (Enter to send, Shift+Enter for newline)"
                rows={2}
                className="flex-1 resize-none bg-slate-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all"
              />
              <button
                onClick={handleSend}
                disabled={sending || !reply.trim()}
                className="w-12 h-12 rounded-2xl bg-[#003366] text-white flex items-center justify-center shrink-0 hover:bg-[#002244] transition-all disabled:opacity-40 shadow-lg"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-[#F8FAFC]">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto text-blue-100 mb-6" />
            <p className="font-bold text-[#003366]/30 text-sm uppercase tracking-widest">Select an applicant</p>
            <p className="text-xs text-slate-300 mt-2">to view and reply to messages</p>
          </div>
        </div>
      )}
    </div>
  )
}
