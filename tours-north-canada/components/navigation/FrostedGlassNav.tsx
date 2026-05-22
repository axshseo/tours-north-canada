import Link from 'next/link'
import { Search } from 'lucide-react'

export default function FrostedGlassNav() {
  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
      <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-lg">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white">
          TOURS<span className="text-blue-400">NORTH</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-white/80">
          <Link href="/destinations" className="hover:text-white">
            Expeditions
          </Link>
          <Link href="/guides" className="hover:text-white">
            Travel Hacks
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 hover:bg-white/30 transition-all"
          >
            <Search size={16} />
            <span>Search Brain</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

