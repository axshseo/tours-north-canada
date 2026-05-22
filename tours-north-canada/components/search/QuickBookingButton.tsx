'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCheckoutStore } from '../../lib/store/checkoutStore'

interface QuickBookingButtonProps {
  experienceId: string
  startingPrice: number | null
}

export function QuickBookingButton({ experienceId, startingPrice }: QuickBookingButtonProps) {
  const router = useRouter()
  const setExperienceId = useCheckoutStore(state => state.setExperienceId)

  const handleQuickBook = (e: React.MouseEvent) => {
    e.preventDefault()
    // Save to Zustand
    setExperienceId(experienceId)
    // Navigate to the checkout/book route
    router.push(`/book/${experienceId}`)
  }

  return (
    <button 
      onClick={handleQuickBook}
      className="inline-flex w-full sm:w-auto items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
    >
      Book Now {startingPrice ? `from $${startingPrice.toFixed(2)}` : ''}
    </button>
  )
}
