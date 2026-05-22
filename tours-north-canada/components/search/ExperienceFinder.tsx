'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { SearchAutocomplete } from './SearchAutocomplete'
import { AvailabilityDatePicker } from './AvailabilityDatePicker'
import { LocationSuggestion } from '../../app/actions/search'

export function ExperienceFinder() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Construct the query params
    const params = new URLSearchParams()
    
    if (selectedLocation) {
      params.set('locationId', selectedLocation.id)
      params.set('locationName', selectedLocation.name)
      // Map it to our existing `q` or `location` query params used in /search
      // If the earlier page.tsx uses 'location', we can map it here. Let's use 'q' for general query and 'location' for specificity.
      params.set('location', selectedLocation.name)
    }
    
    if (selectedDate) {
      params.set('date', format(selectedDate, 'yyyy-MM-dd'))
    }

    // Redirect to the SEO-First search page
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto w-full p-2 bg-white/10 backdrop-blur-md rounded-2xl md:rounded-full shadow-2xl items-center relative z-20 mt-8">
      
      {/* Autocomplete Input */}
      <div className="w-full md:w-2/5 md:border-r border-white/20 px-2 relative z-30">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <SearchAutocomplete 
          onSelect={(location) => setSelectedLocation(location)}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Date Picker */}
      <div className="w-full md:w-2/5 px-2 relative z-20">
        <AvailabilityDatePicker 
          onSelect={(date) => setSelectedDate(date)}
          selectedDate={selectedDate}
        />
      </div>

      {/* Submit Button */}
      <div className="w-full md:w-1/5 px-2">
        <button 
          type="submit" 
          className="w-full bg-[#b91c1c] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#064e3b] transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <span>Find Adventure</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

    </form>
  )
}
