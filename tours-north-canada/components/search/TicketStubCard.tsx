import Link from 'next/link';

export function TicketStubCard({ tour }: { tour: any }) {
  const { title, price, image_url, live_scarcity, social_proof_count, slug } = tour;

  return (
    <div className="group relative bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-blue-500/40 hover:bg-slate-900/80">
      
      {/* 10X SOCIAL PROOF: Dynamic Badge */}
      {social_proof_count > 0 && (
        <div className="absolute top-4 left-4 z-20 rounded-full bg-orange-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-black text-white shadow-lg">
          🔥 {social_proof_count} BOOKED RECENTLY
        </div>
      )}

      {/* Hero Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={image_url || 'https://images.unsplash.com/photo-1531366930463-d096f30693e2?auto=format&fit=crop&q=80'} 
          className="h-full w-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          alt={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        
        {/* 10X SCARCITY: Animated Badge */}
        {live_scarcity > 0 && live_scarcity < 10 && (
          <div className="absolute bottom-4 left-4 rounded-md bg-red-600 px-2 py-1 text-[9px] font-bold text-white uppercase animate-pulse">
            Only {live_scarcity} spots left
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white leading-tight mb-4 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-end justify-between mt-auto">
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Price per guest</span>
            <span className="text-2xl font-black text-white">${price}</span>
          </div>
          
          <Link href={`/tours/${slug}`} className="rounded-full bg-white text-black px-6 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-300 active:scale-95 shadow-xl shadow-white/5">
            Secure Spot
          </Link>
        </div>
      </div>
    </div>
  );
}