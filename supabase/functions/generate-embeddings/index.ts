import { createClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.22.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY")!;
const AI_TIMEOUT_MS = 15_000;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error("AI_GATEWAY_TIMEOUT")), ms)
  );
  return await Promise.race([p, timeout]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  let expId: string | null = null;

  try {
    // 1. Lock
    const { data: locked, error: lockErr } = await supabase.rpc("acquire_embedding_lock");
    if (lockErr) throw new Error(`Lock error: ${lockErr.message}`);
    if (!locked) return new Response(JSON.stringify({ status: "busy" }), { headers: CORS_HEADERS });

    // 2. Fetch
    const { data: exp, error: fetchErr } = await supabase
      .from("experiences")
      .select("id, title, description")
      .is("embedding", null)
      .is("error_log", null)
      .limit(1)
      .maybeSingle();

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
    if (!exp) return new Response(JSON.stringify({ status: "idle" }), { headers: CORS_HEADERS });

    expId = exp.id;
    console.log(`Processing Tour: ${exp.title} (${expId})`);

    // 3. AI
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const payload = `Experience Title: ${exp.title}. \nContent: ${exp.description}`;
    
    const result = await withTimeout(model.embedContent(payload), AI_TIMEOUT_MS);
    const embedding = result.embedding.values;

    // 4. Update
    const { error: updateError } = await supabase
      .from("experiences")
      .update({ embedding, processed_at: new Date().toISOString(), error_log: null })
      .eq("id", expId);

    if (updateError) throw new Error(`Update error: ${updateError.message}`);

    return new Response(JSON.stringify({ success: true, id: expId }), { headers: CORS_HEADERS });

  } catch (err: any) {
    const errorMsg = String(err.message || err);
    console.error(`Factory Error: ${errorMsg}`);
    
    // Proper error logging without .catch() chains
    if (expId) {
      try {
        await supabase.from("experiences").update({ error_log: errorMsg }).eq("id", expId);
      } catch (e) {
        console.error("Could not write error_log");
      }
    }
    
    try {
      await supabase.from("system_health_logs").insert({
          severity: 'ERROR', message: errorMsg, component: 'GENERATE_EMBEDDINGS_V2'
      });
    } catch (e) {
      console.error("Could not write health log");
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status: 500, headers: CORS_HEADERS });
  }
});