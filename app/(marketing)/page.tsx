import { createClient } from '../../lib/supabase/server'
import { TrendingCarousel } from '../../components/TrendingCarousel'
import { ExperienceFinder } from '../../components/search/ExperienceFinder'
import { cn } from '../../lib/utils'
import Image from 'next/image'
import { Suspense } from 'react'
import { Activity, Globe, Database, FileText, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()

  // Task 1: Fetch Trending Data
  let { data: tours, error } = await supabase
    .from('mv_trending_expeditions')
    .select('*')
    .limit(8)

  if (error || !tours || tours.length === 0) {
    const { data: fallbackTours } = await supabase
      .from('mv_experience_details')
      .select('*')
      .limit(8)
    tours = fallbackTours
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ══ 1. AUTHORITY HUB HERO ══════════════════════════════════ */}
      <section className="relative h-[95vh] min-h-[850px] flex flex-col justify-center bg-tn-navy text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80"
            alt="Authority Hub Background"
            fill
            priority
            className="object-cover opacity-20 mix-blend-overlay scale-110"
          />
        </div>

        {/* Tactical UI Elements */}
        <div className="absolute top-32 left-8 md:left-12 z-20 space-y-2 opacity-60 font-mono text-[10px] tracking-widest uppercase">
          <div className="flex gap-4">
            <span className="text-tn-glacier font-black">LAT</span>
            <span>72.6114° N</span>
          </div>
          <div className="flex gap-4">
            <span className="text-tn-glacier font-black">LNG</span>
            <span>105.2010° W</span>
          </div>
          <div className="flex gap-4">
            <span className="text-tn-glacier font-black">ALT</span>
            <span>88.12M ASL</span>
          </div>
        </div>

        <div className="absolute top-32 right-8 md:right-12 z-20 space-y-2 text-right">
          <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black tracking-widest text-tn-glacier">
            [ SYS: SECURE ]
          </div>
          <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black tracking-widest text-tn-glacier">
            [ NET: UPLINK ]
          </div>
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h1 className="text-6xl md:text-9xl font-black mb-4 tracking-tighter uppercase leading-[0.8] font-syne italic">
                Authority <span className="text-white/10">Hub</span>
              </h1>
              <h2 className="text-2xl md:text-4xl font-bold mb-8 text-tn-glacier uppercase tracking-tight">
                Precision Wilderness Access
              </h2>

              <p className="text-lg md:text-xl text-white/50 max-w-lg font-medium tracking-tight leading-relaxed">
                The global standard for high-performance wilderness logistics.
                Synthesizing elite Canadian expeditions with instrument-grade tactical planning
                and real-time inventory synchronization.
              </p>
            </div>

            <ExperienceFinder />
          </div>
        </div>

        {/* Hero Footer Decoration */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ══ 2. ACTIVE DEPLOYMENTS ══════════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <header className="mb-16 flex items-center justify-between border-b border-slate-100 pb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-tn-navy uppercase tracking-[0.4em] font-syne leading-none">
                Active Deployments
              </h2>
              <p className="text-[10px] font-bold text-tn-muted uppercase tracking-[0.2em]">In-Field Operations // 9-Layer CEXS™ Integration</p>
            </div>
            <div className="px-4 py-1.5 rounded-full border border-tn-glacier/30 text-[10px] font-black text-tn-glacier uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tn-glacier animate-ping" />
              Live Data Feed
            </div>
          </header>

          <Suspense fallback={<div className="h-[500px] w-full bg-slate-50 animate-pulse rounded-3xl" />}>
            <TrendingCarousel tours={tours || []} />
          </Suspense>
        </div>
      </section>

      {/* ══ 3. NETWORK TELEMETRY ══════════════════════════ */}
      <section className="py-24 bg-tn-slate border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-6">
                <Activity className="w-5 h-5 text-tn-navy" />
                <div className="space-y-1">
                  <h3 className="text-[11px] font-black text-tn-navy uppercase tracking-[0.4em] leading-none">Global Telemetry</h3>
                  <p className="text-[8px] font-bold text-tn-muted uppercase tracking-widest">Real-Time Infrastructure Monitoring</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { name: 'Sat-Comm Uplink Alpha', status: 'Stable', value: '99.8%', icon: Globe },
                  { name: 'Global Sensor Network', status: 'Nominal', value: 'Active', icon: Database },
                  { name: 'Encryption Protocol Sync', status: 'Verified', value: 'Secure', icon: FileText }
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-tn-slate flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-tn-navy/40" />
                      </div>
                      <span className="text-[11px] font-bold text-tn-navy uppercase tracking-widest">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-tn-glacier uppercase tracking-widest">{item.status}</span>
                      <div className="px-3 py-1 bg-tn-navy text-white text-[9px] font-black uppercase tracking-widest">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-tn-navy p-10 text-white flex flex-col justify-between h-[200px] group cursor-pointer hover:bg-black transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-tn-glacier uppercase tracking-[0.4em] mb-2">Protocol Status</p>
                    <h4 className="text-2xl font-black uppercase font-syne italic leading-none">OP: Silent Watch</h4>
                    <p className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest">Active Surveillance // Node 771-C</p>
                  </div>
                  <Activity className="w-6 h-6 text-tn-glacier animate-pulse" />
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Readiness: 94% // Pre-Deployment</span>
                  <ArrowRight className="w-5 h-5 text-tn-glacier group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              <div className="bg-white p-10 border border-slate-100 flex flex-col justify-between h-[200px] group cursor-pointer hover:border-tn-navy transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-tn-glacier uppercase tracking-[0.4em] mb-2">Core Inventory</p>
                    <h4 className="text-2xl font-black text-tn-navy uppercase font-syne italic leading-none">Node Optimization</h4>
                    <p className="text-[10px] text-tn-muted mt-2 font-bold uppercase tracking-widest">Global Synchronization Active</p>
                  </div>
                  <Database className="w-6 h-6 text-tn-navy" />
                </div>
                <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold text-tn-muted uppercase tracking-widest">1,403 Nodes Calibrated</span>
                    <span className="block text-[9px] font-black text-tn-navy uppercase tracking-widest">HNSW Vector Search: Optimal</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-tn-navy group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tactical Footer */}
      <footer className="bg-tn-slate border-t border-slate-200 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-bold text-tn-muted uppercase tracking-[0.3em]">
            © 2026 Tours North OS | Instrument-Grade Precision
          </div>
          <div className="flex gap-8">
            {['Encryption_Prot', 'Ledger_Sync', 'Node_Status'].map((link) => (
              <a key={link} href="#" className="text-[10px] font-black text-tn-navy uppercase tracking-widest hover:text-tn-glacier transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
