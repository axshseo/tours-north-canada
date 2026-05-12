import React from 'react'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-10 w-3/4 max-w-md bg-muted animate-pulse rounded-md"></div>
        <div className="h-5 w-1/2 max-w-sm bg-muted animate-pulse rounded-md"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="mb-8 flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-full"></div>
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row overflow-hidden rounded-xl border bg-card shadow-sm h-auto sm:h-56">
            {/* Image Skeleton */}
            <div className="w-full sm:w-1/3 aspect-[4/3] sm:aspect-auto bg-muted animate-pulse"></div>
            
            {/* Content Skeleton */}
            <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-4">
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md"></div>
                <div className="h-4 w-1/3 bg-muted animate-pulse rounded-md"></div>
                <div className="h-4 w-full bg-muted animate-pulse rounded-md mt-4"></div>
                <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md"></div>
              </div>
              
              <div className="flex justify-between items-end border-t pt-4 mt-auto">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted animate-pulse rounded-md"></div>
                  <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
                </div>
                <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
