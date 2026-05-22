'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../lib/supabase/server'

// ─── Return Types ──────────────────────────────────────────────────────────

type AcquireLockResult =
  | { success: true; lock_id: string; expires_at: string }
  | { success: false; error: string; code: 'SLOT_FULL' | 'UNAUTHORIZED' | 'UNKNOWN' }

type ConfirmBookingResult =
  | { success: true }
  | { success: false; error: string }

// ─── Task 1A: Acquire Slot Lock ────────────────────────────────────────────

export async function acquireLockAction(
  experienceId: string,
  slotId: string
): Promise<AcquireLockResult> {
  const supabase = createClient()

  // Server-side auth check — merchant_id comes from session, not the client
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'You must be logged in to book.', code: 'UNAUTHORIZED' }
  }

  const { data, error } = await supabase.rpc('acquire_slot_lock', {
    p_experience_id: experienceId,
    p_slot_id: slotId,
  })

  if (error) {
    console.error('[acquireLockAction] RPC error:', error)
    // Detect inventory exhaustion from the Postgres error message
    const isSlotFull =
      error.message?.toLowerCase().includes('insufficient') ||
      error.message?.toLowerCase().includes('slot') ||
      error.code === 'P0001' // Postgres RAISE EXCEPTION

    return {
      success: false,
      error: isSlotFull
        ? 'Slot Full'
        : error.message,
      code: isSlotFull ? 'SLOT_FULL' : 'UNKNOWN',
    }
  }

  if (!data?.lock_id) {
    return { success: false, error: 'No lock returned from server.', code: 'UNKNOWN' }
  }

  return { success: true, lock_id: data.lock_id, expires_at: data.expires_at }
}

// ─── Task 1B: Confirm Booking After Payment ───────────────────────────────

export async function confirmBookingAction(
  lockId: string,
  paymentIntentId: string
): Promise<ConfirmBookingResult> {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase.rpc('confirm_booking_payment', {
    p_lock_id: lockId,
    p_payment_intent_id: paymentIntentId,
  })

  if (error || !data?.success) {
    console.error('[confirmBookingAction] RPC error:', error)
    return {
      success: false,
      error: data?.message || error?.message || 'Booking confirmation failed.',
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
