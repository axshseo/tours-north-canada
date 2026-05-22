import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  // Bridge to your Supabase Edge Function (search-gateway)
  // This assumes you call a path like: /functions/v1/search-gateway/search
  const res = await fetch(`${supabaseUrl}/functions/v1/search-gateway/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Some edge function setups rely on apikey + auth headers.
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })

}

