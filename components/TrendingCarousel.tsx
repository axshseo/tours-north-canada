'use client'

import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ExperienceCard } from './ExperienceCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function TrendingCarousel({ tours }: { tours: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="relative group px-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 py-4 min-h-[500px]">
          {tours?.map((tour) => (
            <div 
              key={tour.id} 
              className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(25%-18px)]"
            >
              <ExperienceCard 
                experience={{
                  experience_id: tour.id,
                  media_url: tour.hero_image_url || tour.image_url,
                  rating_avg: tour.rating_avg || 4.9,
                  rating_count: tour.rating_count || 12,
                  starting_price: tour.starting_price || tour.price || 0,
                  title: tour.title,
                  description: tour.description,
                  arctic_pulse_score: tour.arctic_pulse_score || 0
                }} 
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#064e3b] transition-all z-30 hover:bg-slate-50 border border-slate-100 hover:scale-110 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute -right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#064e3b] transition-all z-30 hover:bg-slate-50 border border-slate-100 hover:scale-110 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  )
}
