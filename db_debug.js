import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabaseUrl = 'https://uxjjptuhnquobjohunqs.supabase.co'
const supabaseKey = 'sb_publishable_bYFzdR3U4rHiEgA28jkUPA_cFvs-J-W'
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { data, error } = await supabase.from('experiences').select('city_id').limit(10);
    console.log("Error:", error);
    console.log("Data:", data);
}
check();
