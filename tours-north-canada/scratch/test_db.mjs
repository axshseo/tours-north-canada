import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testFetch() {
  const { data: trending, error: trendingError } = await supabase
    .from('mv_trending_expeditions')
    .select('*')
    .limit(5)
  
  console.log('Trending:', trending)
  if (trendingError) console.error('Trending Error:', trendingError)

  const { data: all, error: allError } = await supabase
    .from('mv_experience_details')
    .select('*')
    .limit(5)
  
  console.log('All:', all)
  if (allError) console.error('All Error:', allError)
}

testFetch()
