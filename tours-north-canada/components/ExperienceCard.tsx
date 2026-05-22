import Image from 'next/image';
import type { ExperienceDetails } from '../lib/supabase/queries/experiences';
import { cn } from '../lib/utils';

export interface ExperienceCardProps {
  experience: ExperienceDetails;
  title?: string;
}

export function ExperienceCard({ experience, title: propTitle }: ExperienceCardProps) {
  // TD-01 Fix: Prioritize database title over generic prop
  const title = experience.title || propTitle || 'Canadian Experience';
  
  // TD-02 Fix: Map both possible image fields, fallback to high-quality Unsplash
  const hero_image_url = experience.media_url || (experience as any).hero_image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
  
  const rating = experience.rating_avg || 4.9;
  const starting_price = experience.starting_price || (experience as any).price || 0;

  return (
    <article className={cn(
      "group rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden",
      "transition-all hover:shadow-md max-w-sm"
    )}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {experience.media_url ? (
          <Image 
            src={hero_image_url} 
            alt={title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-muted-foreground text-sm">
            No Image
          </div>
        )}
        
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-yellow-500">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          <span>{rating.toFixed(1)}</span>
          {experience.rating_count > 0 && <span className="text-muted-foreground font-normal ml-0.5">({experience.rating_count})</span>}
        </div>

        {experience.arctic_pulse_score !== undefined && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 animate-pulse">
              <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
            <span>Pulse: {experience.arctic_pulse_score?.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-2.5">
        <h3 className="font-semibold leading-tight tracking-tight text-lg line-clamp-2">{title}</h3>
        
        {experience.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {experience.description.slice(0, 160)}{experience.description.length > 160 ? '...' : ''}
          </p>
        )}
        
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">From</span>
            <data className="flex items-baseline gap-1" value={starting_price}>
              <span className="text-lg font-bold">${starting_price.toFixed(0)}</span>
              <span className="text-xs text-muted-foreground font-medium">CAD</span>
            </data>
          </div>
          
          <button className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          )}>
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
