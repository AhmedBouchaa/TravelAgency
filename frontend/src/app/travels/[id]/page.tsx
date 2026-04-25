'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Travel, Reservation } from '@/lib/types';
import { TravelDetailSkeleton } from '@/components/TravelDetailSkeleton';

export default function TravelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [seats, setSeats] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { data: travel, isLoading } = useQuery({
    queryKey: ['travel', id],
    queryFn: async () => (await api.get<Travel>(`/travels/${id}`)).data,
  });

  const { data: myReservations } = useQuery({
    queryKey: ['my-reservations'],
    enabled: !!user,
    queryFn: async () => (await api.get<Reservation[]>('/reservations/me')).data,
  });

  const submitReview = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const reservation = myReservations?.find(
        r => r.travelId === id && 
        r.status === 'CONFIRMED' && 
        new Date(r.travel?.endDate || '') < new Date() && 
        !r.feedback
      );
      if (!reservation) throw new Error('No eligible reservation found');
      return api.post('/feedback', { reservationId: reservation.id, ...data });
    },
    onSuccess: () => {
      toast.success('Thanks! Your review is awaiting moderation.');
      setShowReviewModal(false);
      qc.invalidateQueries({ queryKey: ['travel', id] });
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const book = useMutation({
    mutationFn: async () => (await api.post('/reservations', { travelId: id, seats })).data,
    onSuccess: () => {
      toast.success('Reservation submitted (pending admin approval).');
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
      router.push('/reservations');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (isLoading || !travel) {
    return <TravelDetailSkeleton />;
  }

  const start = new Date(travel.startDate).toLocaleDateString();
  const end = new Date(travel.endDate).toLocaleDateString();
  const reviews = travel.feedbacks ?? [];
  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const canReview = myReservations?.some(
    r => r.travelId === id && 
    r.status === 'CONFIRMED' && 
    new Date(r.travel?.endDate || '') < new Date() && 
    !r.feedback
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      <div className="relative h-64 overflow-hidden">
        {travel.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={travel.imageUrl} 
            alt={travel.title} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <svg className="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-3 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {travel.destination}
              </span>
              {avg && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                  <span className="text-yellow-300">{'★'.repeat(Math.floor(Number(avg)))}</span>
                  <span className="ml-1">{avg}/5</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{travel.title}</h1>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{start} - {end}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{travel.capacity} seats available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Description and Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About this trip</h2>
              <div className="prose prose-base max-w-none text-gray-700 leading-relaxed">
                {travel.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Guest Reviews</h2>
                <div className="flex items-center space-x-2">
                  {avg && (
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-base">{'★'.repeat(Math.floor(Number(avg)))}</span>
                        <span className="text-gray-300 text-base">{'★'.repeat(5 - Math.floor(Number(avg)))}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{avg}</span>
                      <span className="text-gray-500 text-xs">({reviews.length} review{reviews.length > 1 ? 's' : ''})</span>
                    </div>
                  )}
                  {canReview && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l3.976-2.888a1 1 0 011.118 0l3.976 2.888c.783.57 1.838-.197 1.538-1.81l-1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-1.838.197-1.538 1.81z" />
                      </svg>
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
              
              {reviews.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No reviews yet</h3>
                  <p className="text-gray-600 text-xs">Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {r.user?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.user.imageUrl}
                              alt={r.user.firstName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {r.user?.firstName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {r.user?.firstName} {r.user?.lastName}
                            </p>
                            <div className="flex items-center">
                              <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}</span>
                              <span className="text-gray-300 text-xs">{'★'.repeat(5 - r.rating)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2 text-sm leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:sticky lg:top-24">
              <div className="text-center mb-4">
                <p className="text-xs text-gray-600 mb-1">Price per person</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${Number(travel.price).toFixed(0)}
                </p>
              </div>

              {!user ? (
                <button 
                  onClick={() => router.push('/login')} 
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign in to book
                </button>
              ) : user.role === 'ADMIN' ? (
                <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm text-gray-600">Admin accounts cannot book trips</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of seats
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        disabled={seats <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        className="flex-1 text-center input text-lg font-semibold"
                        min={1}
                        max={travel.capacity}
                        value={seats}
                        onChange={(e) => setSeats(Math.max(1, Math.min(travel.capacity, Number(e.target.value))))}
                      />
                      <button
                        type="button"
                        onClick={() => setSeats(Math.min(travel.capacity, seats + 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        disabled={seats >= travel.capacity}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{travel.capacity - seats} seats remaining</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal ({seats} {seats === 1 ? 'seat' : 'seats'})</span>
                      <span className="font-semibold">${(Number(travel.price) * seats).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${(Number(travel.price) * seats).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={book.isPending}
                    onClick={() => book.mutate()}
                  >
                    {book.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Booking...
                      </>
                    ) : (
                      'Book Now'
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      By booking, you agree to our terms and conditions
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          travelTitle={travel.title}
          onClose={() => setShowReviewModal(false)}
          onSubmit={(rating, comment) => submitReview.mutate({ rating, comment })}
          isSubmitting={submitReview.isPending}
        />
      )}
    </div>
  );
}

function ReviewModal({
  travelTitle,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  travelTitle: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Write a Review</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-1">{travelTitle}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How was your experience?
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-all duration-200 transform hover:scale-110"
                >
                  <svg 
                    className={`w-10 h-10 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l2.8-2.034a1 1 0 011.118 0l2.8 2.034c.783.57 1.838-.197 1.538-1.81l-1.07-3.292a1 1 0 00-.364-1.118L16.863 6.82c.783-.57.384-1.81-.588-1.81h-3.462a1 1 0 01-.95-.69L10.951 2.927z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your thoughts
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience... What did you love? What could be improved?"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || comment.length < 10}
            onClick={() => onSubmit(rating, comment)}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
