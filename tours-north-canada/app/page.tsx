import { createClient } from '../lib/supabase/server'
import { TrendingCarousel } from '../components/TrendingCarousel'
import { CommandBar } from '../components/search/CommandBar'
import { cn } from '../lib/utils'
import Image from 'next/image'

export default async function HomePage() {
  const supabase = createClient()
  
  // Task 1: Fetch Trending Data
  let { data: tours, error } = await supabase
    .from('mv_trending_expeditions')
    .select('*')
    .limit(8)

  if (error || !tours || tours.length === 0) {
    console.warn('Trending view empty, falling back to experience details')
    const { data: fallbackTours } = await supabase
      .from('mv_experience_details')
      .select('*')
      .limit(8)
    tours = fallbackTours
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ══ 1. EPIC CANADIAN ADVENTURES HERO ══════════════════════════════════ */}
      <section className="relative h-[90vh] min-h-[750px] flex flex-col justify-center bg-[#064e3b] text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1920&q=80"
            alt="Canadian Wilderness"
            fill
            priority
            className="object-cover opacity-40 mix-blend-overlay scale-110 animate-pulse-slow"
          />
        </div>

        {/* Abstract Arctic Background Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#ffffff_1px,transparent_1px)] bg-[length:60px_60px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#064e3b] via-transparent to-black/40" />
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">System Status: Global Inventory Live</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter uppercase leading-[0.85] font-syne">
              Epic <span className="text-white/20">Canadian</span><br/>
              Adventures
            </h1>
            
            <p className="text-xl md:text-3xl mb-16 text-white/70 max-w-3xl font-medium tracking-tight leading-relaxed">
              Experience the True North through the lens of performance and precision. 
              Live database synchronization active across all 9 taxonomy layers.
            </p>

            {/* Task 3: Interactive Search Brain Command Bar */}
            <CommandBar />
          </div>
        </div>

        {/* Hero Footer Decoration */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ══ 2. LIVE TELEMETRY: TRENDING EXPEDITIONS ══════════════════════════ */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-4">
          <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-8 border-[#064e3b] pl-10">
            <div>
              <span className="text-[#064e3b]/40 font-mono text-sm uppercase tracking-[0.4em] block mb-4 font-bold">
                // SYSTEM_PROTOCOL: 08-XP-A
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-[#064e3b] uppercase tracking-tighter leading-none font-syne">
                Trending<br/>
                <span className="text-slate-200">Expeditions</span>
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-4">Live Telemetry Feed</p>
              <div className="flex items-center gap-4">
                <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-[#064e3b] animate-pulse" />
                </div>
                <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest">Active Data Stream</span>
              </div>
            </div>
          </header>

          {/* Task 2: Carousel Implementation */}
          <TrendingCarousel tours={tours || []} />

          <div className="mt-32 h-px w-full bg-slate-100" />
        </div>
      </section>

      {/* Legacy Support Section - Re-integrating necessary content if needed */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#064e3b] font-black text-xs uppercase tracking-[0.5em] mb-4">Tours North Protocol</p>
          <h3 className="text-2xl font-bold text-slate-800 mb-8">Accessing all 9 layers of the True North taxonomy.</h3>
          <div className="flex justify-center gap-4">
            <div className="w-12 h-1 bg-[#064e3b]" />
            <div className="w-12 h-1 bg-[#b91c1c]" />
            <div className="w-12 h-1 bg-slate-200" />
          </div>
        </div>
      </section>
    </div>
  )
}
