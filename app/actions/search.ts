'use server'

import { createClient } from '../../lib/supabase/server'

export interface LocationSuggestion {
  id: string
  name: string
  type: 'city' | 'region'
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.length < 2) return []

  const supabase = createClient()
  
  // Query both cities and regions and unify them
  // In a real database, you might use a materialized view for search
  const [citiesRes, regionsRes] = await Promise.all([
    supabase.from('cities').select('id, name, type').ilike('name', `%${query}%`).limit(5),
    supabase.from('regions').select('id, name, type').ilike('name', `%${query}%`).limit(5)
  ])

  const suggestions: LocationSuggestion[] = []

  if (citiesRes.data) {
    suggestions.push(...citiesRes.data.map(c => ({ ...c, type: 'city' as const })))
  }
  
  if (regionsRes.data) {
    suggestions.push(...regionsRes.data.map(r => ({ ...r, type: 'region' as const })))
  }

  // Sort alphabetically and slice top 8
  return suggestions.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8)
}

export async function getGloballyBlockedDates(): Promise<string[]> {
  const supabase = createClient()
  
  // Aggregate calendar check: Find dates where ANY of these conditions apply
  // 1. is_blocked is true
  // 2. spots_remaining is 0 across all experiences for that date
  // Since querying across everything is heavy, we'll assume the db handles aggregation
  // For this architecture, we fetch dates from inventory_calendar where spots_remaining <= 0 or is_blocked = true
  
  const { data, error } = await supabase
    .from('inventory_calendar')
    .select('date')
    .or('is_blocked.eq.true,spots_remaining.lte.0')

  if (error || !data) {
    console.error('Failed to fetch blocked dates:', error)
    return []
  }

  return data.map(row => row.date)
}
