import iitLogo from '../assets/iit_ropar_logo.png'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center p-6 text-center">
      <div className="relative animate-fade-up flex flex-col items-center">
        <div className="relative w-40 h-40 mb-12">
          <div className="absolute -inset-10 bg-[#003366]/10 rounded-full blur-[60px] animate-pulse" />
          <img 
            src={iitLogo} 
            alt="IIT Ropar" 
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_25px_50px_rgba(0,31,63,0.15)]" 
          />
        </div>
        <div className="space-y-8">
          <p className="text-3xl font-bold text-[#001f3f] tracking-[0.5em] uppercase">IIT Ropar</p>
          <div className="flex items-center gap-4 justify-center">
            <div className="w-3 h-3 bg-[#003366] rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_12px_#003366]" />
            <div className="w-3 h-3 bg-[#4169E1] rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_12px_#4169E1]" />
            <div className="w-3 h-3 bg-[#0056b3] rounded-full animate-bounce shadow-[0_0_12px_#0056b3]" />
          </div>
          <p className="text-[11px] font-black text-[#003366] uppercase tracking-[0.6em] opacity-30 italic">Initializing Research Core Protocol</p>
        </div>
      </div>
    </div>
  )
}
