import React from 'react'
import Image from 'next/image'
import { ExperienceCard } from './ExperienceCard'
import { Database } from '../types/database.types'

type Tour = Database['public']['Views']['mv_experience_details']['Row']

interface TourPageProps {
  seoMeta: {
    title: string
    description: string
  }
  tours: Tour[] // "Related tours" if this is a single tour page, or a specific tour data
}

export function TourPage({ seoMeta, tours }: TourPageProps) {
  // Assuming the primary tour is the first in the list or passed separately. 
  // We'll use the SEO meta for the main title, and the rest as related.
  const mainTour = tours && tours.length > 0 ? tours[0] : null
  const relatedTours = tours && tours.length > 1 ? tours.slice(1, 4) : []

  return (
    <div className="w-full">
      {/* Tour Header */}
      <section className="bg-primary/5 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            {seoMeta.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            {seoMeta.description}
          </p>
        </div>
      </section>

      {/* Tour Main Content Area */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-8">
            {/* Main Image */}
            {mainTour?.media_url && (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                <Image 
                  src={mainTour.media_url} 
                  alt={seoMeta.title} 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                />
              </div>
            )}
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2>About this Experience</h2>
              <p>
                This perfectly optimized landing page showcases the details of your selected tour. 
                With instantaneous load speeds driven by ISR and Next.js, your customers get the 
                best booking experience possible.
              </p>
              
              {mainTour && (
                <div className="flex items-center gap-4 mt-6 p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    ${mainTour.starting_price?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Starting price per person
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Booking Widget Placeholder */}
          <div className="md:col-span-1">
            <div className="sticky top-8 bg-card text-card-foreground border rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Book Your Spot</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Live availability powered by Supabase.
              </p>
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:bg-primary/90 transition-colors">
                Select Dates
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Tours */}
      {relatedTours.length > 0 && (
        <section className="container mx-auto px-4 py-16 max-w-5xl border-t mt-8">
          <h2 className="text-2xl font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedTours.map((tour) => (
              <ExperienceCard 
                key={tour.experience_id} 
                experience={tour} 
                title={tour.title || 'Experience'} 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
