import Link from 'next/link';
import type { Travel } from '@/lib/types';

export function TravelCard({ travel }: { travel: Travel }) {
  const start = new Date(travel.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const end = new Date(travel.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const reviews = travel.feedbacks ?? [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <Link
      href={`/travels/${travel.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {travel.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={travel.imageUrl}
            alt={travel.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {avgRating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l2.8-2.034a1 1 0 011.118 0l2.8 2.034c.783.57 1.838-.197 1.538-1.81l-1.07-3.292a1 1 0 00-.364-1.118L16.863 6.82c.783-.57.384-1.81-.588-1.81h-3.462a1 1 0 01-.95-.69L10.951 2.927z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">{avgRating}</span>
              <span className="text-xs text-gray-500">({reviews.length})</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {travel.title}
            </h3>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">{travel.destination}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              ${Number(travel.price).toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">per person</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{start} - {end}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{travel.capacity} seats</span>
          </div>
        </div>

        {/* Hover Details */}
        <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-500 ease-in-out">
          <div className="pt-3 mt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">
              {travel.description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                {travel.active ? 'Available' : 'Sold Out'}
              </span>
              <span className="text-xs text-gray-500">
                {reviews.length} reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
