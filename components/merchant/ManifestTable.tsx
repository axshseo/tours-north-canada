'use client'

import React, { useState, useTransition } from 'react'
import { Database } from '../../types/database.types'
import { checkInGuest } from '../../app/actions/merchant'

type RecentBooking = Database['public']['Views']['merchant_dashboard_recent_bookings']['Row']

interface ManifestTableProps {
  bookings: RecentBooking[]
}

export function ManifestTable({ bookings }: ManifestTableProps) {
  const [isPending, startTransition] = useTransition()
  // Local optimistic state for immediate UI feedback
  const [optimisticBookings, setOptimisticBookings] = useState<RecentBooking[]>(bookings)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Sync prop updates (e.g., from Server Action revalidation)
  React.useEffect(() => {
    setOptimisticBookings(bookings)
  }, [bookings])

  const handleCheckIn = (bookingId: string) => {
    setErrorMsg(null)
    
    // Optimistic UI update
    setOptimisticBookings(current => 
      current.map(b => b.booking_id === bookingId ? { ...b, checked_in: true } : b)
    )

    startTransition(async () => {
      try {
        await checkInGuest(bookingId)
      } catch (err: any) {
        console.error(err)
        setErrorMsg('Failed to check in guest. Please try again.')
        // Revert optimistic update on failure
        setOptimisticBookings(bookings)
      }
    })
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Daily Manifest</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage today's attendees and check-ins.</p>
        </div>
        {errorMsg && <p className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-md">{errorMsg}</p>}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Guest Name</th>
              <th scope="col" className="px-6 py-4 font-medium">Experience</th>
              <th scope="col" className="px-6 py-4 font-medium">Date & Time</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {optimisticBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No bookings found for today.
                </td>
              </tr>
            ) : (
              optimisticBookings.map((booking) => (
                <tr key={booking.booking_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {booking.guest_name}
                  </td>
                  <td className="px-6 py-4">
                    {booking.experience_title}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(booking.date).toLocaleString('en-US', { 
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.checked_in 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'confirmed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.checked_in ? 'Checked In' : booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!booking.checked_in ? (
                      <button
                        onClick={() => handleCheckIn(booking.booking_id)}
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 disabled:opacity-50"
                      >
                        {isPending ? 'Updating...' : 'Check-in'}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground px-4">Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
