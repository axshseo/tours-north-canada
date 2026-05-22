import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '../lib/supabase/server'
import { Database } from '../types/database.types'

type ExperienceRow = Database['public']['Views']['mv_experience_details']['Row']

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function TopToursSkeleton() {
  return (
    <div className="flex space-x-6 overflow-x-auto pb-12 scrollbar-hide">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="h-48 bg-slate-200 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-slate-200 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

import { cn } from '../lib/utils'

// ─── Individual Card ──────────────────────────────────────────────────────────

async function TopTourCard({
  experience,
  priority,
}: {
  experience: ExperienceRow
  priority: boolean
}) {
  const supabase = createClient()
  let displayPrice = experience.starting_price

  const { data: priceData } = await supabase.rpc('get_dynamic_price', {
    p_experience_id: experience.experience_id,
  })
  if (priceData?.price) displayPrice = priceData.price

  const imageUrl = experience.media_url || '/assets/images/placeholder-tour.jpg'
  const title = experience.title || 'Canadian Experience'

  return (
    <article
      className={cn(
        "flex-none w-80 snap-start bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden",
        "group hover:shadow-2xl transition-all duration-300"
      )}
    >
      <Link href={`/tours/${experience.experience_id}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority={priority}
            sizes="320px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
          <div className="absolute top-4 left-4">
            <span className="bg-[#a3e635] text-[#064e3b] text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm">
              Verified
            </span>
          </div>
          {experience.category_name && (
            <div className="absolute bottom-4 left-4">
              <span className="bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md">
                {experience.category_name}
              </span>
            </div>
          )}
          {experience.spots_remaining !== null &&
            experience.spots_remaining > 0 &&
            experience.spots_remaining <= 5 && (
              <div className="absolute top-4 right-4 bg-[#b91c1c] text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                Only {experience.spots_remaining} left!
              </div>
            )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className={cn(
                  "w-3 h-3",
                  i <= Math.floor(experience.rating_avg ?? 0) ? 'text-yellow-400' : 'text-gray-300'
                )}
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[10px] font-bold text-gray-500 ml-1">
              {experience.rating_avg ? experience.rating_avg.toFixed(1) : 'New'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#064e3b] mb-1 leading-tight h-12 overflow-hidden line-clamp-2">
            {title}
          </h3>

          {experience.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {experience.description.slice(0, 160)}{experience.description.length > 160 ? '...' : ''}
            </p>
          )}

          <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{experience.city_name ?? 'Canada'}</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black">Starting from</p>
              <data className="text-xl font-black text-[#064e3b]" value={displayPrice ?? 0}>
                ${displayPrice ? displayPrice.toFixed(0) : '—'} CAD
              </data>
            </div>
            <span className="bg-[#b91c1c] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#064e3b] transition-colors shadow-lg">
              Book Now
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export async function TopToursGrid() {
  const supabase = createClient()

  const { data: experiences, error } = await supabase
    .from('mv_experience_details')
    .select('*')
    .order('rating_avg', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(8)

  if (error) {
    console.error('[TopToursGrid] fetch error:', error)
    return (
      <p className="text-center text-gray-500 py-8">
        Unable to load top tours right now.
      </p>
    )
  }

  if (!experiences || experiences.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
        <p className="text-gray-500">No featured experiences yet — check back soon.</p>
      </div>
    )
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-12 scrollbar-hide snap-x">
      {experiences.map((exp, idx) => (
        <TopTourCard key={exp.experience_id} experience={exp} priority={idx < 2} />
      ))}
    </div>
  )
}
