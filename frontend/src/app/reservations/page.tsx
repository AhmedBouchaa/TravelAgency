'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Reservation } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { ReservationCardSkeleton } from '@/components/ReservationCardSkeleton';

export default function MyReservationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [reviewing, setReviewing] = useState<Reservation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const list = useQuery({
    queryKey: ['my-reservations'],
    enabled: !!user,
    queryFn: async () => (await api.get<Reservation[]>('/reservations/me')).data,
  });

  // Filter reservations
  const filteredReservations = list.data?.filter((r) => {
    const matchesSearch =
      searchQuery === '' ||
      r.travel?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.travel?.destination?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const cancel = useMutation({
    mutationFn: async (id: string) => api.delete(`/reservations/${id}`),
    onSuccess: () => {
      toast.success('Reservation cancelled');
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Loading your trips...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              My Trips
            </h1>
            <p className="text-blue-100 text-lg">
              Manage your upcoming adventures and past journeys
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {list.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <ReservationCardSkeleton key={i} />
            ))}
          </div>
        ) : !list.data || list.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring amazing destinations and book your first adventure!
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Trips
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Your Reservations ({filteredReservations.length})
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Click on any trip to view details</span>
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {filteredReservations.map((r) => {
                const tripEnded = r.travel && new Date(r.travel.endDate) < new Date();
                const canCancel = r.status === 'PENDING' || r.status === 'CONFIRMED';
                const canReview = r.status === 'CONFIRMED' && tripEnded && !r.feedback;
                
                return (
                  <div key={r.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="flex">
                      {/* Travel Image */}
                      <div className="relative w-24 flex-shrink-0 overflow-hidden">
                        {r.travel?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.travel.imageUrl}
                            alt={r.travel.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <StatusBadge status={r.status} />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Trip Info */}
                          <div className="flex-1">
                            <div className="mb-2">
                              <h3 className="text-base font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                                <Link href={`/travels/${r.travel?.id}`}>
                                  {r.travel?.title}
                                </Link>
                              </h3>
                              <div className="flex items-center space-x-3 text-xs text-gray-600 mb-1">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{r.travel?.destination}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span>{r.seats} seat{r.seats > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 text-xs">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-gray-600">
                                    {new Date(r.travel?.startDate || '').toLocaleDateString()} - {new Date(r.travel?.endDate || '').toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-semibold text-sm text-gray-900">
                                    ${Number(r.totalPrice).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Booked {new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            {canReview && (
                              <button 
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                onClick={() => setReviewing(r)}
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l3.976-2.888a1 1 0 011.118 0l3.976 2.888c.783.57 1.838-.197 1.538-1.81l-1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-1.838.197-1.538 1.81z" />
                                </svg>
                                Review
                              </button>
                            )}
                            {canCancel && (
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={cancel.isPending}
                                onClick={() => cancel.mutate(r.id)}
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {cancel.isPending ? '...' : 'Cancel'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Review Modal */}
      {reviewing && (
        <ReviewModal
          reservation={reviewing}
          onClose={() => setReviewing(null)}
          onSaved={() => {
            setReviewing(null);
            qc.invalidateQueries({ queryKey: ['my-reservations'] });
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({
  reservation,
  onClose,
  onSaved,
}: {
  reservation: Reservation;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/feedback', { reservationId: reservation.id, rating, comment });
      toast.success('Thanks! Your review is awaiting moderation.');
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Review Your Trip
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-1">{reservation.travel?.title}</p>
        </div>
        
        {/* Modal Body */}
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
        
        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={busy || comment.length < 10}
            onClick={submit}
          >
            {busy ? (
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
