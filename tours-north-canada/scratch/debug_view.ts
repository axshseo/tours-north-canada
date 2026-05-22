import { createClient } from './lib/supabase/server'

async function debugView() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mv_experience_details')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching view:', error)
  } else {
    console.log('View Schema (First Row):', data[0])
  }
}

debugView()
