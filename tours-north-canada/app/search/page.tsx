import { Metadata } from 'next'
import { createClient } from '../../lib/supabase/server'
import { ExperienceCard } from '../../components/search/ExperienceCard'
import { Suspense } from 'react'
import Loading from './loading'

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

// SEO Optimization: Dynamic Metadata based on Search Params
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = typeof searchParams.q === 'string' ? searchParams.q : ''
  const location = typeof searchParams.location === 'string' ? searchParams.location : ''

  let title = 'Explore Premium Tours | Tours North'
  let description = 'Discover and book the finest curated experiences across Canada.'

  if (query && location) {
    title = `${query} Tours in ${location} | Tours North`
    description = `Find the best ${query} experiences in ${location}. Book instantly with live availability.`
  } else if (query) {
    title = `${query} Tours & Experiences | Tours North`
  } else if (location) {
    title = `Top Tours in ${location} | Tours North`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    }
  }
}

// Fetch Data directly from the Typed View
async function SearchResults({ searchParams }: SearchPageProps) {
  const supabase = createClient()
  
  // Construct query based on params
  let query = supabase
    .from('mv_experience_details')
    .select('*')

  // Example Filters (assuming these columns exist or doing basic text search)
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  // Execute
  const { data: experiences, error } = await query

  if (error) {
    console.error('Error fetching search results:', error)
    return (
      <div className="text-center py-12 text-destructive">
        <h2 className="text-2xl font-bold">Failed to load experiences</h2>
        <p>Please try again later.</p>
      </div>
    )
  }

  if (!experiences || experiences.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">No experiences found</h2>
        <p className="text-muted-foreground">Try adjusting your filters or searching for something else.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {experiences.map((experience, index) => (
        <ExperienceCard 
          key={experience.experience_id} 
          experience={experience} 
          // Prioritize the first two images for LCP optimization
          priorityImage={index < 2} 
        />
      ))}
    </div>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : ''

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        
        {/* Page Header */}
        <header className="mb-8 border-b pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            {query ? `Search results for "${query}"` : 'All Experiences'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Book instantly with live inventory and competitive pricing.
          </p>
        </header>

        {/* Suspense Boundary for Data Fetching */}
        <Suspense fallback={<Loading />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>

      </div>
    </main>
  )
}
