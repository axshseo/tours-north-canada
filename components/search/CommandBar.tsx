'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Calendar as CalendarIcon, MapPin, Users, Search } from 'lucide-react'
import { cn } from '../../lib/utils'

export function CommandBar() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState<Date>()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Close date picker on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleScan = () => {
    const params = new URLSearchParams()
    if (destination) params.set('query', destination)
    if (date) params.set('date', format(date, 'yyyy-MM-dd'))
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-3xl p-3 shadow-2xl flex flex-col md:flex-row items-center gap-3 max-w-4xl group/bar transition-all hover:ring-8 hover:ring-white/10">
      {/* Destination Input */}
      <div className="flex-1 w-full px-8 py-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group relative">
        <label className="block text-[10px] font-black text-[#064e3b] uppercase tracking-[0.2em] mb-1 group-hover:text-red-600 transition-colors flex items-center gap-2 cursor-pointer">
          <MapPin className="w-3 h-3" />
          Where to?
        </label>
        <input 
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Search destinations..."
          className="w-full bg-transparent text-slate-800 font-bold text-lg placeholder:text-slate-300 focus:outline-none"
        />
      </div>
      
      <div className="w-px h-12 bg-slate-100 hidden md:block" />
      
      {/* Date Picker */}
      <div ref={datePickerRef} className="flex-1 w-full px-8 py-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group relative">
        <button 
          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          className="w-full text-left focus:outline-none"
        >
          <span className="block text-[10px] font-black text-[#064e3b] uppercase tracking-[0.2em] mb-1 group-hover:text-red-600 transition-colors flex items-center gap-2">
            <CalendarIcon className="w-3 h-3" />
            Dates
          </span>
          <span className={cn(
            "text-lg font-bold block transition-colors",
            date ? "text-slate-800" : "text-slate-300"
          )}>
            {date ? format(date, 'MMM d, yyyy') : 'Add dates'}
          </span>
        </button>

        {isDatePickerOpen && (
          <div className="absolute top-full left-0 z-50 mt-4 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 p-6 animate-in fade-in zoom-in duration-300 origin-top">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setIsDatePickerOpen(false)
              }}
              className="m-0 border-0"
              modifiersClassNames={{
                selected: 'bg-[#064e3b] text-white font-bold rounded-full',
                today: 'text-red-600 font-bold'
              }}
            />
          </div>
        )}
      </div>

      <div className="w-px h-12 bg-slate-100 hidden md:block" />

      {/* Guests (Placeholder) */}
      <div className="flex-1 w-full px-8 py-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-not-allowed opacity-60">
        <span className="block text-[10px] font-black text-[#064e3b] uppercase tracking-[0.2em] mb-1 group-hover:text-red-600 transition-colors flex items-center gap-2">
          <Users className="w-3 h-3" />
          Guests
        </span>
        <span className="text-slate-300 font-bold text-lg">Add guests</span>
      </div>

      {/* Scan Button */}
      <button 
        onClick={handleScan}
        className="bg-[#064e3b] text-white px-10 py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 group/btn"
      >
        <span className="flex items-center gap-2">
          Scan
          <Search className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </div>
  )
}
