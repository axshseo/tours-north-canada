'use client'

import React, { useEffect, useState } from 'react'
import { useCheckoutStore } from '../../lib/store/checkoutStore'

export function SoftLockCountdown() {
  const { lockExpiresAt, clearStore } = useCheckoutStore()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!lockExpiresAt) {
      setTimeLeft(null)
      return
    }

    const intervalId = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((lockExpiresAt - now) / 1000))
      
      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(intervalId)
        setShowModal(true)
        // Optionally trigger the release RPC on the server
        clearStore()
      }
    }, 1000)

    // Run immediately once
    const now = Date.now()
    setTimeLeft(Math.max(0, Math.floor((lockExpiresAt - now) / 1000)))

    return () => clearInterval(intervalId)
  }, [lockExpiresAt, clearStore])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card text-card-foreground p-8 rounded-xl shadow-lg border max-w-sm w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Session Expired</h2>
          <p className="text-muted-foreground mb-6">Your time slot lock has expired to allow others to book. Please select a time slot again.</p>
          <button 
            onClick={() => setShowModal(false)}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Date Selection
          </button>
        </div>
      </div>
    )
  }

  if (timeLeft === null || timeLeft === 0) return null

  return (
    <div className="fixed top-4 right-4 z-40 bg-card text-card-foreground px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 font-medium">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <span className={`${timeLeft < 60 ? 'text-red-500 font-bold' : ''}`}>
        {formatTime(timeLeft)}
      </span>
      <span className="text-xs text-muted-foreground hidden sm:inline">to complete booking</span>
    </div>
  )
}
