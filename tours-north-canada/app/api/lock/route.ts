import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
  }

  const edgeBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`

  // Bridge to your fulfillment-gateway
  const res = await fetch(`${edgeBase}/fulfillment-gateway/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SUPABASE_SERVICE_ROLE_KEY
        ? { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
        : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

