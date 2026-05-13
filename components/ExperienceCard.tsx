import Image from 'next/image';
import type { ExperienceDetails } from '../lib/supabase/queries/experiences';
import { cn } from '../lib/utils';
import { Ticket, Star, Zap, ArrowRight } from 'lucide-react';

export interface ExperienceCardProps {
  experience: ExperienceDetails;
  title?: string;
}

export function ExperienceCard({ experience, title: propTitle }: ExperienceCardProps) {
  const title = experience.title || propTitle || 'Canadian Experience';
  const hero_image_url = experience.media_url || (experience as any).hero_image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
  const rating = experience.rating_avg || 4.9;
  const starting_price = experience.starting_price || (experience as any).price || 0;

  return (
    <article className="group relative bg-white border border-slate-100 rounded-[2rem] overflow-hidden transition-all hover:shadow-[0_40px_80px_-16px_rgba(6,78,59,0.15)] hover:-translate-y-2 flex flex-col h-full">
      {/* Media Section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image 
          src={hero_image_url} 
          alt={title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tn-forest/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-white/20">
          <Star className="w-3 h-3 fill-tn-safety text-tn-safety" />
          <span className="text-[10px] font-black text-tn-forest tracking-tighter">{rating.toFixed(1)}</span>
        </div>

        {/* Pulse Score */}
        <div className="absolute top-4 left-4 bg-tn-forest/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
          <Zap className="w-3 h-3 text-tn-glacier animate-pulse" />
          <span className="text-[10px] font-black text-tn-glacier uppercase tracking-[0.2em]">PULSE: {experience.arctic_pulse_score?.toFixed(1) || '0.0'}</span>
        </div>
      </div>

      {/* Ticket Body (Tactical Report) */}
      <div className="p-8 flex-1 flex flex-col relative">
        {/* Ticket Perforation Decoration */}
        <div className="absolute -top-3 left-0 right-0 flex justify-between px-6 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1 h-6 bg-white rounded-full border border-slate-50" />
          ))}
        </div>

        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-xl font-black text-tn-navy uppercase tracking-tighter leading-none font-syne group-hover:text-tn-glacier transition-colors">
            OP: {title}
          </h3>
          <span className="text-[9px] font-mono font-bold text-tn-muted bg-tn-slate px-2 py-0.5 rounded">ID: {experience.id?.slice(0, 5).toUpperCase() || '884-A'}</span>
        </div>
        <p className="text-[10px] font-bold text-tn-muted uppercase tracking-widest mb-8">{experience.region_name || 'Arctic High Altitude'}</p>

        {/* Tactical Data Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10 border-t border-slate-50 pt-8">
          <div>
            <p className="text-[8px] font-black text-tn-muted uppercase tracking-[0.2em] mb-1">Status</p>
            <p className="text-[10px] font-mono font-black text-tn-navy uppercase">In Progress</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-tn-muted uppercase tracking-[0.2em] mb-1">Temp</p>
            <p className="text-[10px] font-mono font-black text-tn-navy uppercase">-32°C</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-tn-muted uppercase tracking-[0.2em] mb-1">Crew</p>
            <p className="text-[10px] font-mono font-black text-tn-navy uppercase">04 PAX</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-tn-muted uppercase tracking-[0.2em] mb-1">ETA RTB</p>
            <p className="text-[10px] font-mono font-black text-tn-navy uppercase">72 HRS</p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-end justify-between border-t border-dashed border-slate-200 pt-8">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-tn-muted uppercase tracking-widest">Op Cost</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-tn-navy tracking-tighter leading-none font-syne italic">
                ${starting_price.toFixed(0)}
              </span>
              <span className="text-[9px] font-bold text-tn-muted uppercase">CAD</span>
            </div>
          </div>

          <div className="bg-tn-navy text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:bg-black group-hover:scale-110 shadow-lg cursor-pointer">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </article>
  );
}

