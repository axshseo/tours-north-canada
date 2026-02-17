// Tours North Central Data Brain
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://uxjjptuhnquobjohunqs.supabase.co'
const supabaseKey = 'sb_publishable_bYFzdR3U4rHiEgA28jkUPA_cFvs-J-W'
export const supabase = createClient(supabaseUrl, supabaseKey)

console.log("🚀 Tours North: Data Engine Connected Successfully.");
