import React from 'react'

export default function FormSection({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="glass-card !p-8 animate-fade-up group transition-all duration-700 border-blue-50 bg-white hover:shadow-xl">
      <div className="section-header !gap-4 mb-10">
        {Icon && (
          <div className="!w-12 !h-12 !rounded-xl bg-[#003366] text-white shadow-lg flex items-center justify-center group-hover:scale-105 transition-all flex-shrink-0">
            <Icon size={20} />
          </div>
        )}
        <div className="flex flex-col justify-center">
          <h3 className="text-2xl font-bold tracking-tight text-[#001122]">{title}</h3>
          {subtitle && <p className="text-[9px] text-[#001122]/40 mt-1 uppercase font-black tracking-[0.2em] italic">{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {children}
      </div>
    </div>
  )
}

export function FieldWrapper({ label, required, error, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-[9px] font-black text-[#001122] uppercase tracking-widest ml-1 flex items-center gap-2 opacity-60">
        {label}
        {required && <span className="text-[#003366] font-bold text-sm leading-none">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest ml-1 mt-1 animate-fade-in flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> {error}
        </p>
      )}
    </div>
  )
}
