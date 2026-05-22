import type { ReactNode } from 'react'
import FrostedGlassNav from '@/components/navigation/FrostedGlassNav'

export default function DiscoveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <FrostedGlassNav />
      <main id="main-content" className="pt-6">{children}</main>
    </div>
  )
}

