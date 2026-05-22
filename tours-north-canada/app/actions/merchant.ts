'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../lib/supabase/server'

export async function checkInGuest(bookingId: string) {
  const supabase = createClient()

  // Verify authentication before performing action
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Call the secure RPC to update attendance
  // The backend RLS/RPC logic will ensure that the authenticated merchant actually owns this booking
  const { data, error } = await supabase.rpc('check_in_guest', {
    p_booking_id: bookingId
  })

  if (error) {
    console.error('Failed to check in guest:', error)
    throw new Error('Failed to update attendance')
  }

  // Revalidate the dashboard page so the ManifestTable reflects the updated check-in status
  revalidatePath('/(merchant)/dashboard', 'page')

  return { success: true }
}
