'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardKpis } from '@/lib/types';

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: async () => (await api.get<DashboardKpis>('/admin/dashboard/kpis')).data,
  });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const download = async (path: string, filename: string) => {
    const res = await api.get(path, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const max = Math.max(1, ...data.daily.map((d) => d.bookings));

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi 
              label="Total users" 
              value={data.users} 
              hint={`${data.clients} clients`} 
              icon="users"
              color="blue"
            />
            <Kpi
              label="Active travels"
              value={data.activeTravels}
              hint={`${data.travels} total`}
              icon="travels"
              color="green"
            />
            <Kpi
              label="Reservations"
              value={data.reservations.total}
              hint={`${data.reservations.confirmed} confirmed · ${data.reservations.pending} pending`}
              icon="reservations"
              color="purple"
            />
            <Kpi 
              label="Revenue" 
              value={`$${data.revenue.toFixed(2)}`} 
              hint="confirmed only" 
              icon="revenue"
              color="yellow"
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bookings Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bookings · Last 30 Days</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Daily bookings</span>
                </div>
              </div>
              <div className="h-64 flex items-end gap-2">
                {data.daily.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 transition-all duration-200 cursor-pointer"
                    style={{ height: `${(d.bookings / max) * 100}%` }}
                    title={`${d.date}: ${d.bookings} bookings · $${d.revenue.toFixed(0)}`}
                  >
                    <div className="text-white text-xs font-medium text-center pt-2">
                      {d.bookings}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                From {data.daily[0]?.date} to {data.daily.at(-1)?.date}
              </p>
            </div>

            {/* Top Destinations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Top Destinations</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Most popular</span>
                </div>
              </div>
              {data.topDestinations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">Start promoting your destinations to see them here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topDestinations.map((t, index) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{t.title}</p>
                          <p className="text-sm text-gray-600">{t.destination}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {t.bookings} bookings
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download reports</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => download('/admin/dashboard/export/reservations.csv', 'reservations.csv')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-2m6 2v-2M9 7h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Reservations CSV
              </button>
              <button
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => download('/admin/dashboard/export/reservations.xlsx', 'reservations.xlsx')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-2m6 2v-2M9 7h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Reservations Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, icon, color }: { 
  label: string; 
  value: string | number; 
  hint?: string; 
  icon: string;
  color: string;
}) {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h2a6 6 0 016 6v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 00-2.5 2.5c0 1.38-.572 2.5-1.5 2.5s1.12 1 2.5 2.5z" />
          </svg>
        );
      case 'travels':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'reservations':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002 2v1M9 5a2 2 0 012-2v1a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2v1a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2v1a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2z" />
          </svg>
        );
      case 'revenue':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600 bg-blue-50 border-blue-200';
      case 'green':
        return 'from-green-500 to-green-600 bg-green-50 border-green-200';
      case 'purple':
        return 'from-purple-500 to-purple-600 bg-purple-50 border-purple-200';
      case 'yellow':
        return 'from-yellow-500 to-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'from-gray-500 to-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${getColorClasses()} hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${getColorClasses().split(' ')[0]}`}>
          <div className="text-white">
            {getIcon()}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {hint && <p className="text-sm text-gray-500 ml-2">{hint}</p>}
      </div>
    </div>
  );
}
