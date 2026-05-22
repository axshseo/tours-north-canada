'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '../lib/utils'

const CITIES = [
  { name: 'Toronto',      href: '/destinations/toronto.html' },
  { name: 'Vancouver',    href: '/destinations/vancouver.html' },
  { name: 'Banff',        href: '/destinations/banff.html' },
  { name: 'Montreal',     href: '/destinations/montreal.html' },
  { name: 'Halifax',      href: '/destinations/halifax.html' },
  { name: 'Jasper',       href: '/destinations/jasper.html' },
  { name: 'Whistler',     href: '/destinations/whistler.html' },
  { name: 'Yukon Arctic', href: '/destinations/yukon-arctic.html' },
  { name: 'Quebec City',  href: '#' },
  { name: 'Calgary',      href: '#' },
]

const PROVINCES = [
  { name: 'Alberta',          href: '#' },
  { name: 'British Columbia', href: '#' },
  { name: 'Ontario',          href: '#' },
  { name: 'Quebec',           href: '#' },
  { name: 'Nova Scotia',      href: '#' },
]

const JOURNAL = [
  { name: 'Hacks',       href: '#' },
  { name: 'Photography', href: '#' },
  { name: 'Gear',        href: '#' },
  { name: 'Adventure',   href: '#' },
]

function NavDropdown({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="hover:text-[#b91c1c] flex items-center gap-1 transition-colors font-semibold"
      >
        {label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 bg-white rounded-md shadow-xl z-50 border border-slate-100">
          {children}
        </div>
      )}
    </div>
  )
}

function CurrencyDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "bg-[#b91c1c] hover:bg-[#991b1b] text-white px-4 py-2 rounded-lg text-sm font-bold",
          "flex items-center gap-2 transition-colors shadow-lg"
        )}
      >
        <span>Currency</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1">
          {['USD', 'CAD', 'EUR', 'GBP'].map((c) => (
            <a key={c} href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">{c}</a>
          ))}
        </div>
      )}
    </div>
  )
}

function LanguageDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "bg-[#b91c1c] hover:bg-[#991b1b] text-white px-4 py-2 rounded-lg text-sm font-bold",
          "flex items-center gap-2 transition-colors shadow-lg"
        )}
      >
        <span>Language</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1">
          {['English', 'French', 'Spanish'].map((l) => (
            <a key={l} href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">{l}</a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MainNav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Utility Bar */}
      <nav className="bg-[#0f172a] text-white text-[11px] py-2 px-4 w-full" aria-label="Utility">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <a href="#" className="hover:text-[#a3e635] transition-colors">Track Booking</a>
            <a href="#" className="hover:text-[#a3e635] transition-colors">Safe-Travel Status</a>
            <a href="#" className="hover:text-[#a3e635] transition-colors">Group Booking</a>
          </div>
        </div>
      </nav>

      {/* Main Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-20 w-full">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-14 h-14 bg-[#064e3b] rounded-2xl flex items-center justify-center text-white transition-all group-hover:bg-black group-hover:-rotate-3 shadow-[0_10px_20px_rgba(6,78,59,0.2)]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                  <path d="M12 2c-1.5 0-2.8 1-3.5 2.3C7.8 3 6.5 2 5 2 2.8 2 1 3.8 1 6c0 1.2.5 2.3 1.4 3.1-.4 1.1-.6 2.2-.6 3.4 0 5.2 4.3 9.5 9.5 9.5s9.5-4.3 9.5-9.5c0-1.2-.2-2.3-.6-3.4.9-.8 1.4-1.9 1.4-3.1 0-2.2-1.8-4-4-4-1.5 0-2.8 1-3.5 2.3-.7-1.3-2-2.3-3.5-2.3zM8 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM12 16c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#064e3b] tracking-tighter uppercase font-syne leading-none">
                  Tours North
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest leading-none">
                    Est. 2026
                  </span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Grizzly Concept
                  </span>
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex space-x-6 text-sm font-semibold text-slate-600" aria-label="Main Navigation">
              <NavDropdown label="Cities">
                <div className="w-96 grid grid-cols-2 gap-4 p-6">
                  <div>
                    <h4 className="font-bold text-[#064e3b] mb-2 text-xs uppercase tracking-wider">Cities</h4>
                    {CITIES.map((c) => (
                      <a key={c.name} href={c.href} className="block py-1 text-sm text-gray-600 hover:text-[#b91c1c] transition-colors">{c.name}</a>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#064e3b] mb-2 text-xs uppercase tracking-wider">Provinces</h4>
                    {PROVINCES.map((p) => (
                      <a key={p.name} href={p.href} className="block py-1 text-sm text-gray-600 hover:text-[#b91c1c] transition-colors">{p.name}</a>
                    ))}
                  </div>
                </div>
              </NavDropdown>

              <a href="/search" className="hover:text-[#b91c1c] transition-colors">Tours</a>
              <a href="/guides" className="hover:text-[#b91c1c] transition-colors">Guides</a>

              <NavDropdown label="Journal">
                <div className="w-48 p-4">
                  {JOURNAL.map((j) => (
                    <a key={j.name} href={j.href} className="block py-1 text-sm text-gray-600 hover:text-[#b91c1c] transition-colors">{j.name}</a>
                  ))}
                </div>
              </NavDropdown>
            </nav>
          </div>

          <div className="flex space-x-3 items-center">
            <CurrencyDropdown />
            <LanguageDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}
