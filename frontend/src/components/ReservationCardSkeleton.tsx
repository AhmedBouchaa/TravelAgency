export function ReservationCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex">
        {/* Image Skeleton */}
        <div className="relative w-24 flex-shrink-0 bg-gray-200 animate-pulse" />
        
        {/* Content Skeleton */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>
            
            {/* Actions Skeleton */}
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
