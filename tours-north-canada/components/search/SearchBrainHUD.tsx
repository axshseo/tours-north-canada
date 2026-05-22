'use client';

import { useState } from 'react';
import { Crosshair, MapPin, Calendar, Search, Activity } from 'lucide-react';

export function SearchBrainHUD() {
  const [target, setTarget] = useState('');
  const [region, setRegion] = useState('');

  return (
    <div className="w-full max-w-5xl mx-auto relative z-10">
      {/* HUD Header Telemetry */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2 text-signal-arctic font-mono text-[10px] tracking-widest uppercase">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>Live Inventory Sync: Active</span>
        </div>
        <div className="text-gray-500 font-mono text-[10px] tracking-widest uppercase">
          Target Lock: {target ? 'Acquired' : 'Pending'}
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="bg-northern-800/90 backdrop-blur-md border border-white/10 p-2 sm:p-3 flex flex-col sm:flex-row gap-2 shadow-2xl relative overflow-hidden">
        {/* Input 1: The Target (Taxonomy/Activity) */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Crosshair className="h-4 w-4 text-gray-500 group-focus-within:text-signal-amber transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-northern-900/50 border border-transparent focus:border-signal-amber/50 focus:ring-1 focus:ring-signal-amber text-white placeholder-gray-500 text-sm font-sans pl-10 pr-4 py-3 sm:py-4 transition-all outline-none"
            placeholder="Target Mission (e.g., Heli-Skiing, Wildlife)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <span className="absolute top-1 left-10 text-[9px] font-mono text-gray-500 uppercase">Parameter 01</span>
        </div>

        {/* Input 2: The Region (Geo) */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-4 w-4 text-gray-500 group-focus-within:text-signal-amber transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-northern-900/50 border border-transparent focus:border-signal-amber/50 focus:ring-1 focus:ring-signal-amber text-white placeholder-gray-500 text-sm font-sans pl-10 pr-4 py-3 sm:py-4 transition-all outline-none"
            placeholder="Coordinates (Region/City)"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
          <span className="absolute top-1 left-10 text-[9px] font-mono text-gray-500 uppercase">Parameter 02</span>
        </div>

        {/* Input 3: The Window (Date/Time) */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-500 group-focus-within:text-signal-amber transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-northern-900/50 border border-transparent focus:border-signal-amber/50 focus:ring-1 focus:ring-signal-amber text-white placeholder-gray-500 text-sm font-sans pl-10 pr-4 py-3 sm:py-4 transition-all outline-none cursor-pointer"
            placeholder="Extraction Window"
            readOnly
          />
          <span className="absolute top-1 left-10 text-[9px] font-mono text-gray-500 uppercase">Parameter 03</span>
        </div>

        {/* Action Button */}
        <button className="bg-signal-amber hover:bg-signal-amber/90 text-northern-900 font-mono font-bold text-sm uppercase tracking-wider px-8 py-3 sm:py-4 flex items-center justify-center gap-2 transition-all group">
          <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Execute</span>
        </button>
      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-signal-amber"></div>
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-signal-amber"></div>
    </div>
  );
}

