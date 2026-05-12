import React from 'react'
import { ExperienceCard } from './ExperienceCard'
import { Database } from '../types/database.types'

type Tour = Database['public']['Views']['mv_experience_details']['Row']

interface HubPageProps {
  hubContent?: {
    title: string
    description: string
  }
  seoMeta: {
    title: string
    description: string
  }
  tours: Tour[]
}

export function HubPage({ hubContent, seoMeta, tours }: HubPageProps) {
  const displayTitle = hubContent?.title || seoMeta.title
  const displayDesc = hubContent?.description || seoMeta.description

  return (
    <div className="w-full">
      {/* Hub Hero */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
            {displayTitle}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </section>

      {/* Dynamic Carousel / Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Top Experiences</h2>
          <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full">{tours?.length || 0} Tours</span>
        </div>
        
        {tours && tours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {tours.map((tour) => (
              <ExperienceCard 
                key={tour.experience_id} 
                experience={tour} 
                title={tour.title || 'Experience'} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
            <h3 className="text-xl font-semibold mb-2">No experiences available</h3>
            <p className="text-muted-foreground">Check back soon for new tours in this region.</p>
          </div>
        )}
      </section>
    </div>
  )
}
