'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCheckoutStore } from '../lib/store/checkoutStore'
import { SoftLockCountdown } from './checkout/SoftLockCountdown'
import { GuestManifestForm } from './checkout/GuestManifestForm'
import { acquireLockAction } from '../app/actions/booking'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReservationWizardProps {
  experienceId: string
  availableDates: string[]
  availableSlots: Array<{ slotId: string; time: string; remaining: number }>
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReservationWizard({
  experienceId,
  availableDates,
  availableSlots,
}: ReservationWizardProps) {
  const {
    step,
    lockId,
    selectedDate,
    setStep,
    setSelectedDate,
    setExperienceId,
    updateCheckoutState,
    clearStore,
  } = useCheckoutStore()

  const [loadingSlot, setLoadingSlot] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Bind the experienceId to the store on mount
  useEffect(() => {
    setExperienceId(experienceId)
  }, [experienceId, setExperienceId])

  // ── Step 1: Date Handler ────────────────────────────────────────────────
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setStep(2)
  }

  // ── Step 2: Slot Handler (calls Server Action, not /api/lock) ──────────
  const handleSlotSelect = async (slotId: string) => {
    setLoadingSlot(slotId)

    const result = await acquireLockAction(experienceId, slotId)

    setLoadingSlot(null)

    if (!result.success) {
      if (result.code === 'SLOT_FULL') {
        // High-demand toast
        toast.error('🚨 High Demand! That slot was just grabbed. Please select the next available time.', {
          duration: 6000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
          },
        })
        // Invalidate the slot visually by resetting to step 1 if no other slots
        return
      }
      toast.error(result.error || 'Failed to lock slot. Please try again.')
      return
    }

    // SUCCESS — push lock data directly into the Zustand store
    useCheckoutStore.setState({
      lockId: result.lock_id,
      lockExpiresAt: new Date(result.expires_at).getTime(),
      slotId,
      step: 3, // Advance to Guest Manifest
    })
  }

  // ── Step 4: Fetch Payment Intent when entering payment step ─────────────
  useEffect(() => {
    if (step === 4 && lockId && !clientSecret) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockId, amount: 150 }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch(console.error)
    }
  }, [step, lockId, clientSecret])

  // ── Payment Confirmation (calls Server Action) ───────────────────────────
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { confirmBookingAction } = await import('../app/actions/booking')
    const result = await confirmBookingAction(lockId!, 'pi_mock_123')

    if (!result.success) {
      toast.error("Someone just booked the last spot! Your payment has been voided. Redirecting you to find another time...", {
        duration: 8000,
      })
      clearStore()
      return
    }

    toast.success('🎉 Booking Confirmed! Check your email for details.')
    clearStore()
    // TODO: redirect('/confirmation')
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl mx-auto bg-card text-card-foreground rounded-xl border shadow-sm relative overflow-hidden">
      {/* Soft-Lock Countdown — guards the session timer */}
      <SoftLockCountdown />

      {/* Progress Bar */}
      <div className="flex bg-muted h-1.5">
        <div
          className="bg-primary h-full transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8 pb-4 border-b">
          <h2 className="text-3xl font-extrabold tracking-tight">Complete Your Booking</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {step === 1 && 'Step 1 of 4 — Select a Date'}
            {step === 2 && 'Step 2 of 4 — Select a Time Slot'}
            {step === 3 && 'Step 3 of 4 — Guest Details'}
            {step === 4 && 'Step 4 of 4 — Secure Payment'}
          </p>
        </div>

        {/* ── Step 1: Date Selection ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className="py-4 px-6 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <span className="block font-bold text-lg group-hover:text-primary transition-colors">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </button>
              ))}
            </div>
            {availableDates.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No dates currently available.</p>
            )}
          </div>
        )}

        {/* ── Step 2: Slot Selection ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Available times on {selectedDate}</p>
              <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline font-medium">
                ← Change Date
              </button>
            </div>
            <div className="grid gap-4">
              {availableSlots.map((slot) => (
                <button
                  key={slot.slotId}
                  onClick={() => handleSlotSelect(slot.slotId)}
                  disabled={!!loadingSlot || slot.remaining <= 0}
                  className="flex items-center justify-between py-4 px-6 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="font-bold text-xl group-hover:text-primary transition-colors">{slot.time}</span>
                  <div className="flex items-center gap-4">
                    {slot.remaining <= 5 && slot.remaining > 0 && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
                        Only {slot.remaining} left!
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">{slot.remaining} spots</span>
                    {loadingSlot === slot.slotId ? (
                      <span className="text-sm font-bold text-primary animate-pulse">Locking...</span>
                    ) : (
                      <span className="text-sm font-bold text-primary">Select →</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Guest Manifest (react-hook-form + zod) ────────── */}
        {step === 3 && (
          <GuestManifestForm onComplete={() => setStep(4)} />
        )}

        {/* ── Step 4: Payment ────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-xl border border-dashed text-sm text-muted-foreground">
              Stripe Elements will render here once you supply your{' '}
              <code className="bg-muted px-1 rounded text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <button type="button" onClick={() => setStep(3)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                ← Back
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-zinc-800 transition-colors"
              >
                Pay & Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
