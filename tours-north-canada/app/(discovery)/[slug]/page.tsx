import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import FrostedGlassNav from '@/components/navigation/FrostedGlassNav';
import { TicketStubCard } from '@/components/search/TicketStubCard';
import { TaxonomyBreadcrumb } from '@/components/navigation/TaxonomyBreadcrumb';

export const revalidate = 3600; // Static generation, updates every hour

export default async function HubPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // Call the Mega-RPC
  const { data: p, error } = await supabase.rpc('get_titan_hub_full_package', { 
    p_slug: params.slug 
  });

  if (error || !p || !p.metadata.h1) {
    console.error("RPC Error:", error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      <FrostedGlassNav />
      
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-24">
        {/* Component #15: Uses breadcrumbs.city and breadcrumbs.province */}
        <TaxonomyBreadcrumb data={p.breadcrumbs} />

        {/* Component #8: Dynamic Hero */}
        <header className="mt-12 max-w-4xl">
          <div className="flex items-center gap-3 mb-6 text-blue-400">
            <div className="h-[1px] w-12 bg-blue-500/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Verified Authority Hub</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85]">
            {p.metadata.h1}
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl border-l border-white/10 pl-8">
            {p.metadata.meta_description}
          </p>
        </header>

        {/* Component #3: Discovery Grid */}
        <section className="mt-24">
          <div className="mb-12 flex items-baseline justify-between border-b border-white/5 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 font-mono">Ranked Expeditions</h2>
            <div className="flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] text-slate-400 uppercase font-bold">Live Availability</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {p.experiences.map((tour: any) => (
              <TicketStubCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>

        {/* Component #8: Semantic Tag Cloud */}
        <footer className="mt-40 pt-16 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-10 text-center font-mono">
            Semantic Discovery Context
          </h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {p.tags.map((t: any) => (
              <button key={t.tag} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium hover:border-blue-500/50 hover:text-blue-400 transition-all duration-500">
                {t.tag} <span className="ml-1.5 opacity-30 font-mono text-[9px]">{t.frequency}</span>
              </button>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}