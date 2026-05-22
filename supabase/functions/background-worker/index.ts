// background-worker/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from "npm:@supabase/supabase-js@2";

// --- Industrial Constants ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// CTO Best Practice: Initialize client outside the serve handler for better performance
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    // 2. ATOMIC LOCKING: Ensures absolute idempotency. 
    // This prevents two workers from colliding if a cron job and manual trigger overlap.
    const { data: locked, error: lockErr } = await supabase.rpc('acquire_worker_lock');
    if (lockErr) throw lockErr;
    if (!locked) {
      console.log("[HEARTBEAT] Cycle skipped: Worker already active.");
      return new Response('Locked', { status: 200, headers: CORS_HEADERS });
    }

    console.log("[TITAN HEARTBEAT] Operational cycle started.");
    const url = new URL(req.url);
    const task_type = url.searchParams.get('task_type') || 'ALL';
    const results: Record<string, any> = {};

    // ---------------------------------------------------------
    // TASK 1: THE INTELLIGENCE HUB (AI FACTORY)
    // ---------------------------------------------------------
    if (task_type === 'AI_FACTORY' || task_type === 'ALL') {
      try {
        const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-embeddings`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
        });
        results.ai_factory = aiResponse.ok ? "Success" : `Failed: ${aiResponse.status}`;
      } catch (e) {
        results.ai_factory = `Error: ${e.message}`;
      }
    }

    // ---------------------------------------------------------
    // TASK 2: TRANSACTIONAL COMMUNICATOR (EMAILS)
    // ---------------------------------------------------------
    if (task_type === 'SEND_EMAILS' || task_type === 'ALL') {
      const { data: emailRows } = await supabase.from('communications_log')
        .select('*').eq('status', 'pending').lte('scheduled_for', new Date().toISOString()).limit(10);

      if (emailRows?.length) {
        // We process emails in parallel to ensure we don't hit the 30s Edge timeout
        const emailTasks = emailRows.map(async (row) => {
          try {
            // Logic: Trigger your Email Provider API here (e.g., Resend)
            console.log(`[EMAIL] Triggering send to ${row.recipient_email}`);
            await supabase.from('communications_log').update({ status: 'sent' }).eq('id', row.id);
            return { id: row.id, status: 'sent' };
          } catch (e) {
            await supabase.from('communications_log').update({ status: 'failed' }).eq('id', row.id);
            return { id: row.id, status: 'failed' };
          }
        });
        results.emails = await Promise.all(emailTasks);
      } else {
        results.emails = "Queue empty";
      }
    }

    // ---------------------------------------------------------
    // TASK 3: THE JANITOR (INVENTORY) & THE OPTIMIZER (YIELD)
    // ---------------------------------------------------------
    // These run in parallel to maximize throughput
    const [invRes, yieldRes] = await Promise.all([
      supabase.rpc('cleanup_expired_locks'),
      supabase.rpc('fn_yield_management_logic')
    ]);
    
    results.inventory = invRes.error ? `Failed: ${invRes.error.message}` : "Success";
    results.yield = yieldRes.error ? `Failed: ${yieldRes.error.message}` : "Success";

    return new Response(JSON.stringify({ ok: true, results }), { 
      status: 200, 
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    const errorMsg = `[CRITICAL] Background Worker Crash: ${err.message}`;
    console.error(errorMsg);

    // FORENSIC HEALTH LOGGING: Write failure to system_health_logs
    await supabase.from('system_health_logs').insert({
      severity: 'CRITICAL',
      message: errorMsg,
      component: 'TITAN_WORKER'
    }).catch(e => console.error("Forensic Logger Failed", e));

    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: CORS_HEADERS 
    });
  }
});