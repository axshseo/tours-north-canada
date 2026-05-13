'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '../lib/utils'
import { Bell, Settings, User, Activity, Database, FileText, Globe } from 'lucide-react'

export default function MainNav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Utility Bar (Tactical) */}
      <nav className="bg-[#050B14] text-tn-glacier text-[9px] py-2 px-6 w-full border-b border-white/5" aria-label="System Status">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center font-mono tracking-[0.2em]">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tn-glacier animate-pulse" />
              NODE_ALPHA: ACTIVE
            </span>
            <span>UPLINK_STABLE: 99.8%</span>
          </div>
          <div className="flex gap-6 uppercase">
            <span>Auth: Verified</span>
            <span>Time: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>
        </div>
      </nav>

      {/* Main Bar */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100 h-24 w-full flex items-center">
        <div className="max-w-[1800px] mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="group flex items-center gap-4">
              <div className="w-14 h-14 bg-tn-navy rounded-xl flex items-center justify-center text-white transition-all group-hover:bg-black group-hover:-rotate-3 shadow-[0_20px_40px_-10px_rgba(11,33,63,0.3)] relative overflow-hidden">
                {/* Polar Bear + Mountain Silhouette SVG */}
                <svg viewBox="0 0 100 100" className="w-10 h-10 relative z-10 fill-white" xmlns="http://www.w3.org/2000/svg">
                  {/* Mountain Peaks */}
                  <path d="M15 75 L35 35 L55 60 L75 25 L95 75 Z" opacity="0.3" />
                  {/* Bear Silhouette */}
                  <path d="M20 75 L20 65 Q20 45 45 45 L55 45 Q80 45 80 65 L80 75 L70 75 L70 65 Q70 55 55 55 L45 55 Q30 55 30 65 L30 75 Z" />
                  {/* Bear Head */}
                  <circle cx="82" cy="62" r="6" />
                  <path d="M85 62 L92 65 L88 68 Z" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-br from-tn-glacier/20 to-transparent" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-tn-navy tracking-tighter uppercase font-syne leading-none">
                  Tours North
                </span>
                <span className="text-[9px] font-black text-tn-glacier uppercase tracking-[0.4em] mt-1">
                  Love of Canada
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-10">
              {[
                { name: 'Missions', href: '/missions', icon: Globe },
                { name: 'Inventory', href: '/inventory', icon: Database },
                { name: 'Telemetry', href: '/telemetry', icon: Activity },
                { name: 'Logs', href: '/logs', icon: FileText }
              ].map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="text-[10px] font-black text-tn-navy/60 uppercase tracking-[0.3em] hover:text-tn-navy transition-all flex items-center gap-2 group/nav relative"
                >
                  <item.icon className="w-3.5 h-3.5 text-tn-glacier transition-transform group-hover/nav:-translate-y-0.5" />
                  {item.name}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-tn-navy transition-all group-hover/nav:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center text-tn-navy/40 hover:text-tn-navy transition-colors relative group">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-tn-red rounded-full border-2 border-white" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center text-tn-navy/40 hover:text-tn-navy transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-100 mx-2" />

            <button className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-tn-navy uppercase tracking-widest leading-none">Operator</p>
                <p className="text-[9px] font-bold text-tn-glacier uppercase tracking-widest mt-1">Level 4 Clearance</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-tn-slate border border-slate-100 flex items-center justify-center text-tn-navy transition-all group-hover:bg-tn-navy group-hover:text-white shadow-sm overflow-hidden">
                <User className="w-6 h-6" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
