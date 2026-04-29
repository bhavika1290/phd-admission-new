import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { 
  Users, BarChart3, LogOut, Menu, X, Bell, Search,
  Mail, UserCheck, FileText, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import iitLogo from '../assets/iit_ropar_logo.png'

const menuItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { id: 'applicants', label: 'Filter and Sort', icon: Users, path: '/admin/applicants' },
  { id: 'status', label: 'Status Management', icon: UserCheck, path: '/admin/status' },
  { id: 'bulk-email', label: 'Bulk Email', icon: Mail, path: '/admin/bulk-email' },
  { id: 'templates', label: 'Templates', icon: FileText, path: '/admin/templates' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#000000] overflow-hidden font-sans">
      {/* Sidebar - Royal Blue background with White text */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-[#003366] transition-all duration-500 relative z-20 flex flex-col shadow-2xl`}>
        <div className="p-8 pb-12 flex items-center justify-between border-b border-white/10">
          {isSidebarOpen ? (
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-md">
                <img src={iitLogo} alt="Logo" className="h-10" />
              </div>
              <div className="text-white">
                <p className="font-bold text-lg leading-tight tracking-tight">IIT ROPAR</p>
                <p className="text-blue-200 text-[10px] uppercase tracking-[0.3em] font-black">Management</p>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-white/20 rounded-xl shadow-lg mx-auto cursor-pointer" onClick={() => navigate('/')}>
              <img src={iitLogo} alt="Logo" className="h-8" />
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-white hover:text-white/80 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-4 pt-12">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center group relative p-4 rounded-2xl transition-all duration-500 ${
                location.pathname === item.path 
                  ? 'bg-white text-[#003366] shadow-2xl scale-105' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <item.icon size={22} className="scale-110" />
              </div>
              <span className={`ml-5 font-black tracking-widest text-[12px] uppercase ${isSidebarOpen ? 'opacity-100' : 'hidden'} transition-all`}>
                {item.label}
              </span>
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-4 py-2 bg-[#003366] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase font-black tracking-[0.2em] z-50 shadow-2xl border border-white/20">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-4 rounded-2xl text-white hover:bg-red-600 transition-all group lg:justify-start justify-center"
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            <span className={`ml-4 font-black text-[12px] uppercase tracking-widest ${isSidebarOpen ? 'block' : 'hidden'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar bg-[#F8FAFC]">
        <div className="p-12 max-w-[1750px] mx-auto animate-fade-up">
           <div className="mb-10 flex items-center justify-between border-b border-blue-100 pb-8">
              <div className="flex flex-col">
                 <h2 className="text-[12px] font-black text-black tracking-[0.4em] uppercase mb-2 leading-none">Management Core</h2>
                 <span className="text-4xl font-bold text-black">
                    {menuItems.find(i => i.path === location.pathname)?.label || 'Console'}
                 </span>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-black leading-tight uppercase tracking-tight">{user?.name || 'Authorized Administrator'}</p>
                 </div>
                 <div className="w-12 h-12 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black shadow-lg">
                    {user?.name?.charAt(0) || 'A'}
                 </div>
              </div>
           </div>

           <Outlet />
        </div>
      </main>
    </div>
  )
}
