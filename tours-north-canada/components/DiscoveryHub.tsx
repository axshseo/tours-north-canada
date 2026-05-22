'use client'

import React, { useState } from 'react'

type TabKey = 'attractions' | 'destinations' | 'themes' | 'essentials'

interface TabItem { label: string; count: string }

interface Props {
  tabs: Record<TabKey, TabItem[]>
}

const TAB_LABELS: Record<TabKey, string> = {
  attractions: 'TOP ATTRACTIONS',
  destinations: 'TOP DESTINATIONS',
  themes: 'EXPERIENCE THEMES',
  essentials: 'TRAVEL ESSENTIALS',
}

export default function DiscoveryHub({ tabs }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('attractions')

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-black text-[#064e3b] mb-12 font-syne text-center uppercase tracking-tighter">
          Explore Canada Your Way
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center border-b border-slate-200 mb-12">
          {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-8 py-4 border-b-2 font-bold text-sm transition-all font-syne ${
                activeTab === key
                  ? 'border-[#b91c1c] text-[#b91c1c]'
                  : 'border-transparent text-slate-500 hover:text-[#064e3b]'
              }`}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {tabs[activeTab].map((item) => (
            <a key={item.label} href="#" className="group">
              <p className="text-sm font-bold text-slate-800 group-hover:text-[#b91c1c] transition-colors">
                {item.label}
              </p>
              <p className="text-[10px] text-gray-500 uppercase font-black">{item.count}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
