'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../lib/utils'

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <nav className="space-y-3" aria-labelledby={`footer-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full md:cursor-default group"
      >
        <h3 id={`footer-${title.toLowerCase().replace(/\s+/g, '-')}`} className="font-syne font-bold text-lg uppercase tracking-wide text-left">{title}</h3>
        <svg
          className={cn("w-4 h-4 md:hidden transition-transform", open && "rotate-180")}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul className={cn("space-y-2 text-sm text-white/80 md:block", open ? "block" : "hidden")}>
        {children}
      </ul>
    </nav>
  )
}

function FooterDropdown({ label, icon, options }: { label: string; icon: string; options: string[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-between w-40 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-all border border-white/10"
        )}
      >
        <span className="flex items-center gap-2 text-xs font-semibold">
          <span>{icon}</span> {label}
        </span>
        <svg className={cn("w-3 h-3 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-40 bg-white text-slate-800 rounded-lg shadow-xl overflow-hidden py-1 z-50">
          {options.map((o) => (
            <a key={o} href="#" className="block px-3 py-2 text-xs hover:bg-slate-100 font-medium">{o}</a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SiteFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-[#064e3b] to-[#022c22] text-white pt-16 pb-8 overflow-hidden font-inter">
      <div className="absolute bottom-0 right-0 w-full h-[250px] pointer-events-none opacity-40">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"
          alt="Banff Snowy Peaks"
          className="w-full h-full object-cover object-bottom mask-image-t-gradient"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <FooterSection title="Get Help 24/7">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Chat with us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Call us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Safety Protocols</a></li>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 max-w-[150px] mt-4">
              <p className="text-[10px] font-bold mb-2 leading-tight">Scan to download App</p>
              <div className="bg-white p-2 rounded-lg aspect-square flex items-center justify-center">
                <span className="text-[#064e3b] text-3xl">⬛</span>
              </div>
            </div>
          </FooterSection>

          <FooterSection title="Explore Cities">
            {['Toronto','Vancouver','Banff','Montreal','Quebec City','Calgary','Halifax','Jasper'].map((city) => (
              <li key={city}><a href="#" className="hover:text-white transition-colors">{city}</a></li>
            ))}
          </FooterSection>

          <FooterSection title="Regional Hubs">
            {['Ontario','British Columbia','Alberta','Quebec','Nova Scotia','Yukon / Arctic'].map((p) => (
              <li key={p}><a href="#" className="hover:text-white transition-colors">{p}</a></li>
            ))}
          </FooterSection>

          <FooterSection title="Work With Us">
            {['Merchant Portal','Affiliate Program','Media Kit','Careers'].map((i) => (
              <li key={i}><a href="#" className="hover:text-white transition-colors">{i}</a></li>
            ))}
          </FooterSection>

          <FooterSection title="Tours North">
            {['Our Story','Sustainability','Press Room','Travel Blog','Sitemap'].map((i) => (
              <li key={i}><a href="#" className="hover:text-white transition-colors">{i}</a></li>
            ))}
          </FooterSection>
        </div>

        <div className="border-t border-white/10 pt-8 pb-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <FooterDropdown label="English (CAD)" icon="🌐" options={['English (US)','Français (CA)','Deutsch']} />
            <FooterDropdown label="CAD ($)" icon="🪙" options={['USD ($)','EUR (€)','GBP (£)']} />
          </div>

          <div className="flex flex-wrap justify-center gap-4 opacity-70 hover:opacity-100 transition-all duration-300">
            {['VISA','MC','AMEX','APPLE PAY','GOOGLE PAY','STRIPE'].map((p) => (
              <span key={p} className="border border-white/40 px-2 py-0.5 rounded text-[9px] font-black tracking-tight">{p}</span>
            ))}
            <div className="flex items-center border border-white px-2 rounded font-bold text-[10px] tracking-tighter h-[24px]">TICO CERTIFIED</div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 gap-4">
          <p>© 2026 Tours North. 24 St Mavis, Toronto, ON.</p>
          <nav className="flex gap-4" aria-label="Legal">
            <a href="/privacy-policy.html" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Legal Notice</a>
          </nav>
          <div className="flex gap-2">
            {[
              { label: 'Instagram', icon: '📸' },
              { label: 'TikTok',    icon: '🎵' },
              { label: 'LinkedIn',  icon: '💼' },
              { label: 'YouTube',   icon: '▶️' },
              { label: 'X',        icon: '✕' },
            ].map(({ label, icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#064e3b] transition-all text-sm"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
