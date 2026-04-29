import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, Award, Users, Globe, ArrowRight, 
  GraduationCap, Building2, Zap, ShieldCheck 
} from 'lucide-react'
import iitLogo from '../assets/iit_ropar_logo.png'
import heroImg from '../assets/iit_ropar_image.png'

export default function Landing() {
  const navigate = useNavigate()

  const programs = [
    { title: 'Regular Ph.D', desc: 'Full-time research scholars supported by Institute Assistantship or external fellowships.', color: 'bg-blue-50/50' },
    { title: 'Direct Ph.D', desc: 'Accelerated path for exceptionally brilliant B.Tech students from premier institutes.', color: 'bg-blue-100/30' },
    { title: 'Part-Time Ph.D', desc: 'Designed for working professionals from R&D organizations and industries.', color: 'bg-blue-100/50' },
    { title: 'External Ph.D', desc: 'For candidates from recognized R&D labs with minimum two years of experience.', color: 'bg-blue-200/20' },
  ]

  const stats = [
    { label: 'NIRF Ranking', value: '22', icon: Award },
    { label: 'Research Areas', value: '15+', icon: BookOpen },
    { label: 'Faculty Members', value: '200+', icon: Users },
    { label: 'Global Partners', value: '50+', icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#001122] overflow-x-hidden selection:bg-[#003366]/20">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#003366] rounded-full blur-[140px] opacity-[0.05] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4169E1] rounded-full blur-[120px] opacity-[0.05] translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F0F9FF]/80 backdrop-blur-[40px] border-b border-[#003366]/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <img src={iitLogo} alt="IIT Ropar" className="h-12 w-auto drop-shadow-sm" />
            <div>
              <p className="font-bold text-xl leading-tight tracking-tight text-[#001f3f]">IIT ROPAR</p>
              <p className="text-[#003366] text-[9px] uppercase tracking-[0.3em] font-black opacity-50">Admissions 2026</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black text-[#003366] uppercase tracking-[0.3em] opacity-70">
            <a href="#about" className="hover:text-[#4169E1] transition-all">About</a>
            <a href="#programs" className="hover:text-[#4169E1] transition-all">Programs</a>
            <a href="#timeline" className="hover:text-[#4169E1] transition-all">Timeline</a>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="text-[11px] font-black text-[#003366] hover:text-[#4169E1] tracking-widest uppercase transition-all">Sign In</button>
            <button 
              onClick={() => navigate('/signup')} 
              className="px-9 py-3 text-xs font-black text-[#F0F9FF] rounded-[50px] shadow-lg hover:-translate-y-0.5 transition-all bg-[#003366] uppercase tracking-widest"
            >
              Apply Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[180px] pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <div className="flex-1 text-center lg:text-left space-y-10">
            <div className="badge-magic animate-fade-up">
              <div className="w-2.5 h-2.5 rounded-full bg-[#003366] animate-pulse-dot" />
              Doctoral Admissions Open 2026
            </div>
            
            <h1 className="leading-[1] tracking-tight animate-fade-up">
              <span className="block text-[72px] lg:text-[84px] font-bold text-[#001f3f]">Research That</span>
              <span className="block text-[72px] lg:text-[84px] font-bold text-[#4169E1]">Empowers.</span>
            </h1>

            <p className="font-sans animate-fade-up text-lg text-[#003366] opacity-70 max-w-[560px] leading-relaxed mx-auto lg:mx-0 font-medium">
              Join a distinguished community of scholars pushing the boundaries of engineering and scientific discovery at the Indian Institute of Technology Ropar.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4 animate-fade-up">
              <button onClick={() => navigate('/signup')} className="btn-saffron flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] group h-[60px] px-10">
                Begin Application <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary h-[60px] px-10 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] font-black">
                Review Status
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative animate-fade-up">
             <div className="relative glass-card !p-0 !rounded-[40px] overflow-hidden shadow-2xl border-white/50">
               <img src={heroImg} alt="Campus" className="w-full h-auto object-cover hover:scale-110 transition-transform duration-[2000ms]" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/10 to-transparent pointer-events-none" />
             </div>
             
             {/* Floating Info card */}
             <div className="absolute -bottom-10 -right-10 glass-card !p-10 backdrop-blur-[30px] border-white/80 shadow-2xl hidden xl:block group/card">
               <div className="flex gap-8 items-center">
                 <div className="w-20 h-20 rounded-[28px] bg-[#003366] flex items-center justify-center text-[#F0F9FF] group-hover/card:scale-110 transition-transform shadow-xl">
                   <GraduationCap size={44} />
                 </div>
                 <div>
                   <p className="font-bold leading-none mb-1 text-[44px] text-[#001f3f]">200+</p>
                   <p className="font-black tracking-[0.3em] uppercase text-[10px] text-[#003366] opacity-60">Success Stories</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Program Categories */}
      <section id="programs" className="py-40 px-6 relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-6xl font-bold text-[#001f3f] mb-6">Academic Excellence</h2>
          <p className="text-[#003366] font-black uppercase tracking-[0.5em] text-[11px] opacity-40">Choose your research pathway</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {programs.map((p, i) => (
            <div key={i} className={`glass-card !p-12 hover:translate-y-[-10px] transition-all duration-500 group ${p.color} border-white/20`}>
              <h4 className="text-2xl font-bold mb-6 text-[#001f3f] font-heading">{p.title}</h4>
              <p className="text-sm text-[#003366] font-bold leading-relaxed opacity-70">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-40 px-6 max-w-7xl mx-auto relative border-t border-blue-100/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-24">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="w-24 h-24 rounded-[32px] bg-[#003366]/5 flex items-center justify-center mx-auto mb-10 text-[#003366] group-hover:scale-110 transition-all duration-500 shadow-sm border border-blue-100">
                <stat.icon size={44} />
              </div>
              <p className="text-6xl font-bold mb-3 font-heading text-[#001f3f]">{stat.value}</p>
              <p className="text-[#003366] text-[12px] uppercase tracking-[0.3em] font-black opacity-40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-blue-100/50 bg-[#F0F9FF]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-24">
          <div className="space-y-12">
            <div className="flex items-center gap-6">
              <img src={iitLogo} alt="Logo" className="h-16" />
              <p className="text-3xl font-bold text-[#001f3f]">IIT ROPAR</p>
            </div>
            <p className="text-[#003366] text-sm font-bold leading-relaxed max-w-xs opacity-70 italic">
              Indian Institute of Technology Ropar, Punjab, India.<br />
              Excellence in Research and Multidisciplinary Innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-10">
              <h5 className="font-black text-[11px] uppercase tracking-[0.4em] text-[#003366]">Information</h5>
              <ul className="space-y-5 text-xs text-[#003366] font-black uppercase tracking-widest opacity-60">
                <li><a href="/login" className="hover:text-[#4169E1] transition-all">Sign In</a></li>
                <li><a href="/signup" className="hover:text-[#4169E1] transition-all">Official Portal</a></li>
              </ul>
            </div>
            <div className="space-y-10">
              <h5 className="font-black text-[11px] uppercase tracking-[0.4em] text-[#003366]">Campus</h5>
              <ul className="space-y-5 text-xs text-[#003366] font-black uppercase tracking-widest opacity-60">
                <li>Research Units</li>
                <li>Digital Library</li>
              </ul>
            </div>
          </div>

          <div className="space-y-10">
            <h5 className="font-black text-[11px] uppercase tracking-[0.4em] text-[#003366]">Connectivity</h5>
            <p className="text-sm text-[#001f3f] font-black tracking-tight">admissions@iitrpr.ac.in</p>
            <div className="flex gap-6 mt-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-[#003366] shadow-sm hover:shadow-md transition-all cursor-pointer">
                <Globe size={22} />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-32 pt-12 border-t border-blue-100/30 text-center">
          <p className="text-[11px] text-[#003366] uppercase font-black tracking-[0.6em] opacity-30">
            © 2026 Indian Institute of Technology Ropar.
          </p>
        </div>
      </footer>
    </div>
  )
}
