'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { SearchAutocomplete } from './SearchAutocomplete'
import { AvailabilityDatePicker } from './AvailabilityDatePicker'
import { LocationSuggestion } from '../../app/actions/search'
import { MapPin, Calendar as CalendarIcon, Search, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

export function ExperienceFinder() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (selectedLocation) {
      params.set('location_id', selectedLocation.id)
      params.set('q', selectedLocation.name)
    }
    if (selectedDate) {
      params.set('date', format(selectedDate, 'yyyy-MM-dd'))
    }

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-sm ml-auto bg-white p-8 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
        <Sparkles className="w-4 h-4 text-tn-navy animate-pulse" />
        <h2 className="text-[10px] font-black text-tn-navy uppercase tracking-[0.4em]">Initialize Mission</h2>
      </div>

      <form onSubmit={handleSearch} className="space-y-6">
        {/* Target Region */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-tn-muted uppercase tracking-[0.3em] flex items-center gap-2">
            Target Region
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-tn-navy z-10 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <SearchAutocomplete 
              onSelect={(loc) => setSelectedLocation(loc)}
              selectedLocation={selectedLocation}
            />
          </div>
        </div>

        {/* Deployment Window */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-tn-muted uppercase tracking-[0.3em] flex items-center gap-2">
            Deployment Window
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-tn-navy z-10 pointer-events-none">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <AvailabilityDatePicker 
              onSelect={(date) => setSelectedDate(date)}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        {/* Execute Button */}
        <button 
          type="submit"
          className="w-full bg-tn-navy text-white px-8 py-4 font-black uppercase tracking-[0.3em] text-[11px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] mt-8"
        >
          <Search className="w-4 h-4" />
          <span>Execute Query</span>
        </button>
      </form>
    </div>
  )
}
