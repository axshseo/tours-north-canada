import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '../../../lib/supabase/server'
import { HubPage } from '../../../components/HubPage'
import { TourPage as TourPageComponent } from '../../../components/TourPage'
import { RegionGuide } from '../../../components/RegionGuide'

interface PageProps {
  params: {
    slug: string[]
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient()
  const pathSlug = params.slug.join('/')

  const { data, error } = await supabase.rpc('get_seo_landing_page', {
    p_slug: pathSlug
  })

  if (error || !data) {
    return {
      title: 'Not Found | Tours North',
      description: 'The requested page could not be found.'
    }
  }

  return {
    title: data.seo_meta.title,
    description: data.seo_meta.description,
    alternates: {
      canonical: data.seo_meta.canonical
    }
  }
}

// Optional: Pre-render top hubs
export async function generateStaticParams() {
  // Hardcoded for demonstration. To pre-render your top 50 regions,
  // query your database here and return an array of slug objects.
  return [
    { slug: ['canadian-rockies'] },
    { slug: ['banff'] },
    { slug: ['toronto'] },
    { slug: ['vancouver'] },
    { slug: ['niagara-falls'] }
  ]
}

// Revalidate page data every 60 seconds (ISR)
export const revalidate = 60;

export default async function ToursPage({ params }: PageProps) {
  const supabase = createClient()
  const pathSlug = params.slug.join('/')

  const { data, error } = await supabase.rpc('get_seo_landing_page', {
    p_slug: pathSlug
  })

  if (error || !data) {
    console.error('Failed to load SEO landing page:', error)
    notFound()
  }

  const { page_type, seo_meta, tours, hub_content } = data

  // ─────────────────────────────────────────────────────────────────────────────
  // PAYLOAD OPTIMIZATION (TD-09): Prune large JSON objects to keep __NEXT_DATA__ small.
  // We only keep the 6 fields used by ExperienceCard and HubPage.
  // ─────────────────────────────────────────────────────────────────────────────
  const optimizedTours = (tours || []).map((t: any) => ({
    experience_id: t.experience_id,
    title: t.title,
    media_url: t.media_url,
    starting_price: t.starting_price,
    rating_avg: t.rating_avg,
    description: t.description ? t.description.slice(0, 160) + '...' : null
  }))

  return (
    <main className="min-h-screen bg-background">
      {page_type === 'hub' ? (
        <HubPage 
          hubContent={hub_content} 
          seoMeta={seo_meta} 
          tours={optimizedTours as any[]} 
        />
      ) : (
        <TourPageComponent 
          seoMeta={seo_meta} 
          tours={optimizedTours as any[]} 
        />
      )}

      {/* Authority Block: Region Guide for SEO Density */}
      <RegionGuide regionName={params.slug[0]} />
    </main>
  )
}
