import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Loader2, TrendingUp, Users, CheckCircle, Clock, Ban, LayoutDashboard } from 'lucide-react'
import { getAllApplications } from '../services/api'
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

export default function AdminAnalytics() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await getAllApplications()
      setApplications(res.data.applications || [])
    } catch {
      toast.error('Failed to load analytics data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <Loader2 className="animate-spin text-[#003366]" size={48} />
        <p className="text-[10px] font-black text-[#003366] uppercase tracking-[0.4em] animate-pulse">Aggregating Global Intelligence...</p>
      </div>
    )
  }

  const totalApplications = applications.length
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length
  const waitlisted = applications.filter(a => a.status === 'waitlisted').length
  const rejected = applications.filter(a => a.status === 'rejected').length
  const selected = applications.filter(a => a.status === 'selected').length
  const femaleCount = applications.filter(a => a.gender?.toLowerCase() === 'female').length
  const maleCount = totalApplications - femaleCount

  // Category Data for Pie Chart
  const categoryDist = {}
  applications.forEach(a => {
    const cat = a.category || 'General'
    categoryDist[cat] = (categoryDist[cat] || 0) + 1
  })
  const categoryData = Object.entries(categoryDist).map(([name, value]) => ({ name, value }))

  // Gender Data
  const genderData = [
    { name: 'Female', value: femaleCount },
    { name: 'Male', value: maleCount }
  ]

  // Status Data for Bar Chart
  const statusData = [
    { name: 'Selected', count: selected },
    { name: 'Shortlisted', count: shortlisted },
    { name: 'Waitlisted', count: waitlisted },
    { name: 'Rejected', count: rejected },
    { name: 'Pending', count: applications.filter(a => a.status === 'pending').length }
  ]

  const COLORS = ['#003366', '#4169E1', '#87CEEB', '#B0C4DE', '#F0F8FF']
  const GENDER_COLORS = ['#ec4899', '#3b82f6']

  const StatCard = ({ label, value, icon: Icon }) => (
    <div className="glass-card !p-6 animate-fade-up border-blue-50 shadow-md hover:shadow-xl transition-all duration-500 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-blue-50 text-[#003366] shadow-sm border border-blue-100">
          <Icon size={18} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#001122]">{value}</span>
      </div>
      <p className="text-[9px] font-black text-[#003366]/40 uppercase tracking-widest">{label}</p>
      <div className="w-full bg-blue-50 h-1 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-[#003366] opacity-30" style={{ width: '100%' }} />
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Applicants" value={totalApplications} icon={Users} />
        <StatCard label="Shortlisted" value={shortlisted} icon={CheckCircle} />
        <StatCard label="Waitlisted" value={waitlisted} icon={Clock} />
        <StatCard label="Rejected" value={rejected} icon={Ban} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Distribution Chart */}
        <div className="glass-card !p-8 border-blue-50 shadow-xl bg-white">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-[#003366] text-white shadow-lg">
                 <LayoutDashboard size={18} />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#001122]">Pipeline Progression</h3>
           </div>
           
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={statusData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                 <YAxis fontSize={10} axisLine={false} tickLine={false} />
                 <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                 />
                 <Bar dataKey="count" fill="#003366" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Demographics Analysis */}
        <div className="glass-card !p-8 border-blue-50 shadow-xl bg-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-blue-50 text-[#003366] border border-blue-100">
                 <TrendingUp size={18} />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#001122]">Gender Diversity</h3>
           </div>

           <div className="h-80 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={genderData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {genderData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend verticalAlign="bottom" height={36}/>
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Classification */}
        <div className="glass-card !p-8 border-blue-50 shadow-xl bg-white">
          <h3 className="text-xl font-bold font-heading text-[#001122] mb-6 underline decoration-blue-100 underline-offset-8">Classification Mix</h3>
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={categoryData}
                   cx="50%"
                   cy="50%"
                   outerRadius={100}
                   labelLine={false}
                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   dataKey="value"
                 >
                   {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Growth & Insights */}
        <div className="glass-card !p-8 border-blue-50 shadow-xl bg-white flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-bold font-heading text-[#001122] mb-6 underline decoration-blue-100 underline-offset-8">Application Insights</h3>
              <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div>
                    <p className="text-[9px] font-black text-[#003366]/30 uppercase tracking-widest">Acceptance Probability</p>
                    <p className="text-2xl font-bold text-[#001122] mt-1">{totalApplications > 0 ? ((selected / totalApplications) * 100).toFixed(1) : 0}%</p>
                  </div>
                  <CheckCircle className="text-green-500" size={32} />
                </div>
                
                <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div>
                    <p className="text-[9px] font-black text-[#003366]/30 uppercase tracking-widest">Competition Index</p>
                    <p className="text-2xl font-bold text-[#001122] mt-1">{(totalApplications / 10).toFixed(1)}x</p>
                  </div>
                  <Users className="text-blue-500" size={32} />
                </div>
              </div>
           </div>

           <div className="mt-10 p-6 rounded-2xl bg-[#003366] text-white flex items-center justify-between shadow-lg">
              <div>
                 <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">System Status</p>
                 <p className="text-lg font-bold mt-1">Optimal Performance</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
                 <CheckCircle size={20} />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
