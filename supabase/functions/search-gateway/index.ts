import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const RPC_TIMEOUT_MS = 4_000

// Reuse client across invocations (lower overhead)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  // Preflight caching
  'Access-Control-Max-Age': '86400',
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
  })
}

function getPathname(req: Request) {
  return new URL(req.url).pathname.replace(/\/+$/, '') || '/'
}

function getQuery(req: Request) {
  return new URL(req.url).searchParams
}

function toNumber(v: string | null, fallback: number) {
  if (v == null) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

// Hard cap to prevent hangs
async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: number | undefined
  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(new Error('Gateway timeout')), ms) as unknown as number
  })
  try {
    return await Promise.race([p, timeout])
  } finally {
    if (t) clearTimeout(t)
  }
}

// SEO Edge caching headers for /seo
function seoCacheHeaders() {
  return {
    // Required strategy
    'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
  }
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('OK', { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: CORS_HEADERS })
  }

  try {
    const pathname = getPathname(req)
    const q = getQuery(req)

    // --------------------
    // GET /vector
    // params: vector, threshold, count
    // RPC: public.match_experiences (via exact RPC name match_experiences)
    // --------------------
    if (pathname.endsWith('/vector'))
 {
      const vector = q.get('vector')
      if (!vector) {
        return json({ error: 'Missing required query param: vector' }, { status: 400, headers: CORS_HEADERS })
      }

      const threshold = toNumber(q.get('threshold'), 0.7)
      const count = Math.max(1, Math.floor(toNumber(q.get('count'), 10)))

      const result = await withTimeout(
        supabase.rpc('match_experiences', {
          query_embedding: vector,
          match_threshold: threshold,
          match_count: count,
        }),
        RPC_TIMEOUT_MS
      )

      return json(result?.data ?? result, { status: 200, headers: CORS_HEADERS })
    }

    // --------------------
    // GET /seo
    // param: slug
    // RPC: public.get_seo_landing_page (via exact RPC name get_seo_landing_page)
    // --------------------
    if (pathname.endsWith('/seo'))
 {
      const slug = q.get('slug')
      if (!slug) {
        return json({ error: 'Missing required query param: slug' }, { status: 400, headers: CORS_HEADERS })
      }

      const result = await withTimeout(
        supabase.rpc('get_seo_landing_page', {
          p_slug: slug,
        }),
        RPC_TIMEOUT_MS
      )

      return json(
        result?.data ?? result,
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            ...seoCacheHeaders(),
          },
        }
      )
    }

    return json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS })
  } catch (e: any) {
    return json(
      { error: 'Gateway error', details: String(e?.message ?? e) },
      { status: 500, headers: CORS_HEADERS }
    )
  }
})

