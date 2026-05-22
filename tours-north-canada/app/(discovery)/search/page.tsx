import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import FrostedGlassNav from '@/components/navigation/FrostedGlassNav';
import { TaxonomyBreadcrumb } from '@/components/navigation/TaxonomyBreadcrumb';
import { TicketStubCard } from '@/components/search/TicketStubCard';

// 10X SEO: Statically generate pages but update them every hour
export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

// 1. DYNAMIC SEO METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: p } = await supabase.rpc('get_titan_hub_full_package', { p_slug: params.slug });

  if (!p || !p.metadata) return { title: 'Tours North Canada' };

  return {
    title: p.metadata.meta_title,
    description: p.metadata.meta_description,
    alternates: { canonical: `https://toursnorth.com/${params.slug}` },
    openGraph: {
      title: p.metadata.h1,
      description: p.metadata.meta_description,
      type: 'website',
    }
  };
}

// 2. MAIN HUB PAGE ENGINE
export default async function HubPage({ params }: PageProps) {
  const supabase = createClient();
  
  // Call the Master RPC
  const { data: p, error } = await supabase.rpc('get_titan_hub_full_package', { 
    p_slug: params.slug 
  });

  if (error || !p || !p.metadata?.h1) {
    console.error("Titan Hub Error:", error || "No data");
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Global Navigation */}
      <FrostedGlassNav />
      
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-24">
        {/* Component #15: Taxonomy Breadcrumbs */}
        <TaxonomyBreadcrumb data={p.breadcrumbs} />

        {/* 10X Hero Section */}
        <header className="mt-12 max-w-4xl">
          <div className="flex items-center gap-3 mb-6 text-blue-400">
            <div className="h-[1px] w-12 bg-blue-500/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
              Verified Authority Hub
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85]">
            {p.metadata.h1}
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl border-l border-white/10 pl-8">
            {p.metadata.meta_description}
          </p>
        </header>

        {/* Component #3: Discovery Grid with Live Scarcity/Social Proof */}
        <section className="mt-24">
          <div className="mb-12 flex items-baseline justify-between border-b border-white/5 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 font-mono">
              Top Ranked Expeditions
            </h2>
            <div className="flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                 Live in {p.breadcrumbs.city?.name || 'Canada'}
               </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {p.experiences.map((tour: any) => (
              <TicketStubCard key={tour.id} tour={tour} />
            ))}
          </div>
          
          {/* Zero State Fallback */}
          {p.experiences.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-slate-500 italic">No expeditions currently active in this hub.</p>
            </div>
          )}
        </section>

        {/* Component #8: Semantic Tag Cloud (Moat #4) */}
        <footer className="mt-40 pt-16 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-10 text-center font-mono">
            Semantic Discovery Context
          </h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {p.tags.map((t: any) => (
              <button 
                key={t.tag} 
                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium hover:border-blue-500/50 hover:text-blue-400 transition-all duration-500 group"
              >
                {t.tag} 
                <span className="ml-1.5 opacity-30 font-mono text-[9px] group-hover:opacity-100 transition-opacity">
                  {t.frequency}
                </span>
              </button>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}