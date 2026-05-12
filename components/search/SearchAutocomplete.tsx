'use client'

import React, { useState, useEffect, useRef } from 'react'
import { searchLocations, LocationSuggestion } from '../../app/actions/search'

interface SearchAutocompleteProps {
  onSelect: (location: LocationSuggestion) => void
  selectedLocation: LocationSuggestion | null
}

export function SearchAutocomplete({ onSelect, selectedLocation }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Sync external selection to local query string
  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.name)
    }
  }, [selectedLocation])

  // Debounced Search Effect
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    // Don't search if the query perfectly matches the current selection (prevents re-fetching on select)
    if (selectedLocation && query === selectedLocation.name) {
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await searchLocations(query)
        setSuggestions(results)
        setIsOpen(true)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [query, selectedLocation])

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  const handleSelect = (suggestion: LocationSuggestion) => {
    setQuery(suggestion.name)
    setIsOpen(false)
    onSelect(suggestion)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base"
          placeholder="Where do you want to go?"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card text-card-foreground border rounded-xl shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.id}`}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex flex-col items-start border-b last:border-b-0"
            >
              <span className="font-medium text-foreground">{suggestion.name}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{suggestion.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
