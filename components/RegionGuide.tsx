import React from 'react'
import { createClient } from '../lib/supabase/server'

interface RegionGuideProps {
  regionName: string
}

export async function RegionGuide({ regionName }: RegionGuideProps) {
  const supabase = createClient()

  // Fetch the region description. 
  // We match on name or ID depending on how the slug maps.
  // For this implementation, we'll try to match the name (case-insensitive) or slug.
  const { data: region, error } = await supabase
    .from('regions')
    .select('name, description')
    .or(`name.ilike.%${regionName}%,id.eq.${regionName.toLowerCase()}`)
    .single()

  if (error || !region || !region.description) {
    return null // Don't render anything if no authority text exists
  }

  return (
    <section className="bg-slate-50 border-t py-16 mt-16 overflow-hidden" aria-labelledby="region-guide-title">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8">
          <h2 id="region-guide-title" className="text-2xl font-bold text-[#064e3b] uppercase tracking-wider mb-2">
            Local Authority Guide: {region.name}
          </h2>
          <div className="w-12 h-1 bg-[#b91c1c]" />
        </header>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-line">
            {region.description}
          </p>
        </div>
        
        <footer className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 font-medium italic">
            This guide is part of our commitment to providing authoritative, local insights into Canada&apos;s premier destinations.
          </p>
        </footer>
      </div>
    </section>
  )
}
