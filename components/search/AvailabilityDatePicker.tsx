'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, parseISO } from 'date-fns'
import { getGloballyBlockedDates } from '../../app/actions/search'

interface AvailabilityDatePickerProps {
  onSelect: (date: Date | undefined) => void
  selectedDate: Date | undefined
}

export function AvailabilityDatePicker({ onSelect, selectedDate }: AvailabilityDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch blocked dates on mount
  useEffect(() => {
    async function fetchBlockedDates() {
      try {
        const dateStrings = await getGloballyBlockedDates()
        // Convert '2026-05-15' strings to Date objects
        const dates = dateStrings.map(ds => parseISO(ds))
        setBlockedDates(dates)
      } catch (err) {
        console.error('Error fetching globally blocked dates:', err)
      }
    }
    fetchBlockedDates()
  }, [])

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

  const handleDaySelect = (day: Date | undefined) => {
    onSelect(day)
    setIsOpen(false)
  }

  // We also want to disable dates in the past
  const disabledDays = [
    { before: new Date() },
    ...blockedDates
  ]

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div 
        className="w-full pl-12 pr-4 py-4 rounded-xl border border-input bg-background cursor-pointer hover:border-primary transition-colors flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className={`${selectedDate ? 'text-foreground' : 'text-muted-foreground'} text-base`}>
          {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select dates'}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-card text-card-foreground border rounded-xl shadow-lg p-3">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            disabled={disabledDays}
            className="border-0"
            modifiersClassNames={{
              selected: 'bg-primary text-primary-foreground font-bold hover:bg-primary/90',
              today: 'text-primary font-bold'
            }}
          />
        </div>
      )}
    </div>
  )
}
