import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { experienceId, slotId } = body

    if (!experienceId || !slotId) {
      return NextResponse.json({ error: 'Missing experienceId or slotId' }, { status: 400 })
    }

    const supabase = createClient()

    // Call the RPC defined in the architecture
    const { data, error } = await supabase.rpc('acquire_slot_lock', {
      p_experience_id: experienceId,
      p_slot_id: slotId
    })

    if (error) {
      console.error('Failed to acquire slot lock:', error)
      return NextResponse.json({ error: 'Insufficient inventory or invalid slot.' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Server error acquiring lock:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
