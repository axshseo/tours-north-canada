import { supabase } from '../client';

export interface ExperienceDetails {
  experience_id: string;
  media_url: string | null;
  rating_avg: number;
  rating_count: number;
  starting_price: number;
  next_available_date: string | null;
  title?: string | null;
  description?: string | null;
  arctic_pulse_score?: number;
}

/**
 * Fetches all experience details from the materialized view.
 * This performs a single SELECT * from public.mv_experience_details.
 */
export async function getExperiences(): Promise<ExperienceDetails[]> {
  const { data, error } = await supabase
    .from('mv_experience_details')
    .select('*');

  if (error) {
    console.error('Error fetching experiences:', error);
    throw new Error('Failed to fetch experiences from Supabase');
  }

  return data as ExperienceDetails[];
}
