export function TravelCardSkeleton() {
  return (
    <div className="block overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-8 bg-gray-200 rounded w-16 mb-1 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
