import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export function TaxonomyBreadcrumb({ data }: { data: any }) {
  const { city, province } = data;
  
  // 10X JSON-LD for Google Search Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Canada", "item": "https://toursnorth.com" },
      province?.name && { "@type": "ListItem", "position": 2, "name": province.name, "item": `https://toursnorth.com/provinces/${province.slug}` },
      city?.name && { "@type": "ListItem", "position": 3, "name": city.name }
    ].filter(Boolean)
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
        <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-1">
          <Home size={10} /> HOME
        </Link>
        
        {province?.name && (
          <>
            <ChevronRight size={10} className="text-slate-800" />
            <Link href={`/provinces/${province.slug}`} className="hover:text-blue-400 transition-colors">
              {province.name}
            </Link>
          </>
        )}

        {city?.name && (
          <>
            <ChevronRight size={10} className="text-slate-800" />
            <span className="text-slate-300 cursor-default">{city.name}</span>
          </>
        )}
      </nav>
    </>
  );
}