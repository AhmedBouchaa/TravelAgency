'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TravelCard } from '@/components/TravelCard';
import { TravelCardSkeleton } from '@/components/TravelCardSkeleton';
import type { PaginatedTravels, Feedback } from '@/lib/types';

interface Filters {
  destination?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  startAfter?: string;
}

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const query = useQuery({
    queryKey: ['travels', filters, page],
    queryFn: async () => {
      const params: Record<string, any> = { page, pageSize: 12 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v != null) params[k] = v;
      });
      const { data } = await api.get<PaginatedTravels>('/travels', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });

  const reviewsQuery = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data } = await api.get<Feedback[]>('/feedback/all');
      return data;
    },
  });

  // Auto-scroll background images
  const travelImages = query.data?.items
    .filter(t => t.imageUrl)
    .map(t => t.imageUrl as string) || [];

  useEffect(() => {
    if (travelImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % travelImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [travelImages.length]);

  // Auto-scroll reviews
  const reviews = reviewsQuery.data || [];
  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const onChange = (k: keyof Filters, v: string) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: v === '' ? undefined : k.includes('Price') ? Number(v) : v }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden h-100">
        {/* Scrolling Background Images */}
        {travelImages.length > 0 && (
          <div className="absolute inset-0">
            {travelImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt="Travel background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Discover Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                Next Adventure
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-200">
              Explore curated destinations and create unforgettable memories around the world.
            </p>
          </div>

          {/* Search Card */}
          <div className="mt-8 mx-auto max-w-4xl">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Search destinations
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      className="input pl-10 h-10 text-sm"
                      placeholder="Where do you want to go?"
                      onChange={(e) => onChange('search', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <input
                    className="input h-10 text-sm"
                    placeholder="City or country"
                    onChange={(e) => onChange('destination', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-xs">$</span>
                    </div>
                    <input
                      className="input pl-8 h-10 text-sm"
                      type="number"
                      placeholder="0"
                      onChange={(e) => onChange('minPrice', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-xs">$</span>
                    </div>
                    <input
                      className="input pl-8 h-10 text-sm"
                      type="number"
                      placeholder="5000"
                      onChange={(e) => onChange('maxPrice', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    className="input h-10 text-sm"
                    type="date"
                    onChange={(e) => onChange('startAfter', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {query.isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TravelCardSkeleton key={i} />
              ))}
            </div>
          ) : query.isError ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load travels</h3>
              <p className="text-gray-600">Please try again later.</p>
            </div>
          ) : query.data && query.data.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No travels found</h3>
              <p className="text-gray-600">Try adjusting your filters to find what you're looking for.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Destinations</h2>
                <p className="text-gray-600">{query.data?.total} trips found</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {query.data?.items.map((t) => (
                  <TravelCard key={t.id} travel={t} />
                ))}
              </div>
              {query.data && query.data.total > query.data.pageSize && (
                <div className="mt-12">
                  <Pagination
                    page={page}
                    total={query.data.total}
                    pageSize={query.data.pageSize}
                    onChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-12 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Travelers Say</h2>
              <p className="text-gray-600">Real experiences from real adventurers</p>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
                >
                  {reviews.map((review) => (
                    <div key={review.id} className="w-full flex-shrink-0 px-4">
                      <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center mb-4">
                          {review.user?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={review.user.imageUrl}
                              alt={review.user.firstName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {review.user?.firstName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="ml-4">
                            <p className="font-semibold text-gray-900">
                              {review.user?.firstName} {review.user?.lastName}
                            </p>
                            <div className="flex items-center">
                              <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                              <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed italic">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === currentReviewIndex
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setCurrentReviewIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose Us</h2>
            <p className="text-gray-600">Experience travel like never before</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-sm text-gray-600">Competitive rates with no hidden fees</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">Round-the-clock assistance for travelers</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-sm text-gray-600">Your safety is our top priority</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Curated Trips</h3>
              <p className="text-sm text-gray-600">Hand-picked destinations for you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Inspiration Gallery */}
      {travelImages.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Travel Inspiration</h2>
              <p className="text-gray-600">Get inspired by stunning destinations</p>
            </div>
            
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {travelImages.slice(0, 6).map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Travel inspiration ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">Explore</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  
  const getPages = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, page - Math.floor(showPages / 2));
    let end = Math.min(last, start + showPages - 1);
    
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1">
      <button
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      
      {getPages().map((pageNum) => (
        <button
          key={pageNum}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
            pageNum === page
              ? 'text-blue-600 bg-blue-50 border border-blue-300'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}
      
      <button
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={page >= last}
        onClick={() => onChange(page + 1)}
      >
        Next
        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
