import React from 'react'
import Image from 'next/image'
import { Database } from '../../types/database.types'
import { QuickBookingButton } from './QuickBookingButton'

type ExperienceDetails = Database['public']['Views']['mv_experience_details']['Row']

interface ExperienceCardProps {
  experience: ExperienceDetails;
  priorityImage?: boolean; // Set to true for the first few items to optimize LCP
}

export function ExperienceCard({ experience, priorityImage = false }: ExperienceCardProps) {
  const { 
    experience_id, 
    title, 
    media_url, 
    rating_avg, 
    rating_count, 
    starting_price, 
    spots_remaining,
    description
  } = experience

  // Fallback values
  const hero_image_url = media_url || '/assets/images/placeholder.jpg'
  const displayTitle = title || 'Canadian Experience'
  const displayDescription = description || 'A spectacular journey perfectly curated for an unforgettable experience in the heart of Canada.'
  
  // Scarcity Logic
  const showScarcityBadge = spots_remaining !== null && spots_remaining > 0 && spots_remaining <= 5;

  return (
    <article className="group relative flex flex-col sm:flex-row overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      
      {/* Image Container */}
      <div className="relative w-full sm:w-1/3 aspect-[4/3] sm:aspect-auto overflow-hidden bg-muted">
        <Image
          src={hero_image_url}
          alt={displayTitle}
          fill
          priority={priorityImage}
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Scarcity Badge */}
        {showScarcityBadge && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Only {spots_remaining} spots left!
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight line-clamp-2 mb-2">
            {displayTitle}
          </h2>
          
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-sm mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-yellow-500"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">{rating_avg ? rating_avg.toFixed(1) : 'New'}</span>
            {rating_count !== null && rating_count > 0 && (
              <span className="text-muted-foreground">({rating_count} reviews)</span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {displayDescription.slice(0, 160)}{displayDescription.length > 160 ? '...' : ''}
          </p>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between border-t pt-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Starting at</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-foreground">
                ${starting_price ? starting_price.toFixed(2) : '0.00'}
              </span>
              <span className="text-sm font-medium text-muted-foreground">CAD</span>
            </div>
          </div>
          
          {/* Client-side Interactivity */}
          <QuickBookingButton experienceId={experience_id} startingPrice={starting_price} />
        </div>
      </div>
    </article>
  )
}
