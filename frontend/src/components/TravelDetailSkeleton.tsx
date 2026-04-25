export function TravelDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Skeleton */}
      <div className="relative h-64 bg-gray-200 animate-pulse" />
      
      {/* Main Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>

            {/* Reviews Section Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="text-center mb-4">
                <div className="h-3 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
