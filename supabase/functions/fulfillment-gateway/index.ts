import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@16.2.0'
import { createServerClient } from 'npm:@supabase/ssr'

// =============== Global Config ===============
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

// Webhook signature verification (REQUIRED)
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Optional but recommended: protect webhook route with x-api-key
const GATEWAY_WEBHOOK_API_KEY = Deno.env.get('GATEWAY_WEBHOOK_API_KEY')

const RPC_TIMEOUT_MS = 10_000

// =============== Clients ===============
// Service-role client for *RPC execution* only
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// @supabase/ssr server-side auth client for *verifying merchant identity*
function makeAuthClient(req: Request) {
  // createServerClient expects cookie plumbing; for token->user verification
  // we pass the token via Authorization header and rely on auth.getUser(token).
  // The client itself does not need cookie state to call getUser(token).
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get() {
        return undefined
      },
      set() {
        // no-op
      },
      remove() {
        // no-op
      },
    },
    // Keep request context available if your runtime uses it
    headers: {
      authorization: req.headers.get('authorization') ?? '',
    },
  })
}

// =============== Helpers ===============
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
  const url = new URL(req.url)
  return url.pathname.replace(/\/+$/, '') || '/'
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-api-key, content-type',
  }
}

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  const m = auth.match(/^Bearer\s+(.+)$/i)
  return m ? m[1] : null
}

// Timeout wrapper to prevent hung RPCs
async function rpcWithTimeout<T>(
  fnName: string,
  params: Record<string, unknown>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController()

  const rpcPromise = supabaseAdmin
    .rpc(fnName, params, { signal: controller.signal } as any)
    .then((res: any) => res?.data as T)

  // Enforce timeout
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      controller.abort()
      reject(new Error(`RPC timeout after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return await Promise.race([rpcPromise, timeoutPromise])
}

// Stripe webhook JSON parser (signature verification MUST use raw body)
async function readRawBody(req: Request): Promise<string> {
  return await req.text()
}

// =============== HTTP Server ===============
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('OK', { status: 204, headers: corsHeaders() })
  }

  // Basic routing
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders() })
  }

  try {
    const pathname = getPathname(req)

    // ---------------- /stripe-webhook ----------------
    if (pathname === '/stripe-webhook') {
      // Optional protection with x-api-key
      if (GATEWAY_WEBHOOK_API_KEY) {
        const apiKey = req.headers.get('x-api-key')
        if (!apiKey || apiKey !== GATEWAY_WEBHOOK_API_KEY) {
          return json({ error: 'Unauthorized (x-api-key)' }, { status: 401, headers: corsHeaders() })
        }
      }

      const signature = req.headers.get('stripe-signature')
      if (!signature) {
        return json({ error: 'Missing stripe-signature header' }, { status: 400, headers: corsHeaders() })
      }

      // Verify using STRIPE_WEBHOOK_SECRET
      const rawBody = await readRawBody(req)
      const stripe = new Stripe(STRIPE_WEBHOOK_SECRET, { apiVersion: '2024-06-20' })

      let event: Stripe.Event
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
      } catch {
        return json({ error: 'Invalid Stripe signature' }, { status: 400, headers: corsHeaders() })
      }

      // Only handle payment_intent.succeeded
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const booking_id = paymentIntent?.metadata?.booking_id

        if (!booking_id || typeof booking_id !== 'string') {
          // Professional error payload; Stripe will retry on non-2xx
          return json(
            { error: 'Missing booking_id in payment_intent.metadata' },
            { status: 400, headers: corsHeaders() }
          )
        }

        // Execute: public.confirm_booking_payment(p_booking_id uuid)
        await rpcWithTimeout<void>(
          'confirm_booking_payment',
          { p_booking_id: booking_id },
          RPC_TIMEOUT_MS
        )
      }

      // Stripe expects fast 2xx
      return json({ ok: true }, { status: 200, headers: corsHeaders() })
    }

    // ---------------- /redeem ----------------
    if (pathname === '/redeem') {
      // CORS + strict security: verify merchant using Authorization Bearer token
      const token = getBearerToken(req)
      if (!token) {
        return json({ error: 'merchant_mismatch' }, { status: 401, headers: corsHeaders() })
      }

      // Use @supabase/ssr for server-side auth verification
      const authClient = makeAuthClient(req)

      const { data: userData, error: userError } = await authClient.auth.getUser(token)

      if (userError || !userData?.user) {
        return json({ error: 'merchant_mismatch' }, { status: 401, headers: corsHeaders() })
      }

      const user = userData.user

      // Parse request body: only secret code is accepted from frontend
      const payload = await req.json().catch(() => null)
      const p_secret_code = payload?.p_secret_code

      if (!p_secret_code || typeof p_secret_code !== 'string') {
        return json({ error: 'invalid_voucher' }, { status: 400, headers: corsHeaders() })
      }

      // Zero-trust enforcement:
      // DO NOT accept p_merchant_user_id from body.
      // Use verified user.id
      const p_merchant_user_id = user.id

      // Execute: public.redeem_voucher(p_secret_code text, p_merchant_user_id uuid)
      try {
        const redeemResult = await rpcWithTimeout<unknown>(
          'redeem_voucher',
          { p_secret_code, p_merchant_user_id },
          RPC_TIMEOUT_MS
        )

        return json({ result: redeemResult }, { status: 200, headers: corsHeaders() })
      } catch (err: any) {
        // Map DB / business errors to your required professional JSON errors
        const msg = String(err?.message ?? err ?? '')

        // Heuristic mapping based on common Postgres error patterns / messages.
        // If you have exact error messages/codes from redeem_voucher, paste them and I’ll make this exact.
        if (/frozen|payout|locked/i.test(msg)) {
          return json({ error: 'payout_frozen' }, { status: 409, headers: corsHeaders() })
        }

        if (/voucher|secret|code|invalid/i.test(msg)) {
          return json({ error: 'invalid_voucher' }, { status: 400, headers: corsHeaders() })
        }

        // Any identityAction: Scan code for security risks and vulnerabilities (see below for action prompt) mismatch should remain ambiguous externally
        if (/merchant|unauth|forbid/i.test(msg)) {
          return json({ error: 'merchant_mismatch' }, { status: 403, headers: corsHeaders() })
        }

        // Default professional fallback
        return json(
          { error: 'invalid_voucher' },
          { status: 400, headers: corsHeaders() }
        )
      }
    }

    return json({ error: 'Not found' }, { status: 404, headers: corsHeaders() })
  } catch (e: any) {
    return json(
      { error: 'Unknown error', details: String(e?.message ?? e ?? '') },
      { status: 500, headers: corsHeaders() }
    )
  }
})

