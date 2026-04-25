'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api, apiErrorMessage, uploadFile } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/Avatar';

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', newPassword: '', imageUrl: '' });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? '',
        newPassword: '',
        imageUrl: user.imageUrl ?? '',
      });
    }
  }, [user, loading, router]);

  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      const result = await uploadFile(selectedFile);
      setForm({ ...form, imageUrl: result.url });
      setFile(null); // Reset file after successful upload
      toast.success('Profile image uploaded successfully');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: any = { 
        firstName: form.firstName, 
        lastName: form.lastName, 
        phone: form.phone || undefined,
      };
      
      // Include imageUrl if it exists in form
      if (form.imageUrl) {
        payload.imageUrl = form.imageUrl;
      }
      
      if (form.newPassword) payload.newPassword = form.newPassword;
      
      console.log('Submitting payload:', payload);
      
      await api.patch('/users/me', payload);
      await refresh();
      setForm((s) => ({ ...s, newPassword: '' }));
      toast.success('Profile updated');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Loading profile...</span>
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
              My Profile
            </h1>
            <p className="text-blue-100 text-lg">
              Manage your personal information and account settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="relative mx-auto w-48 h-48 mb-4">
                <Avatar user={{ ...user, imageUrl: form.imageUrl }} size="2xl" />
                <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664-.89l.812-1.22A2 2 0 0118.07 4h.93a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  type="file"
                  id="profile-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      handleFileUpload(selectedFile);
                    }
                  }}
                  disabled={uploading}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user.role === 'ADMIN' ? 'Administrator' : 'Traveler'}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
              <form onSubmit={submit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        className="input pl-10 h-12 text-base"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        className="input pl-10 h-12 text-base"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      className="input pl-10 h-12 text-base bg-gray-50 cursor-not-allowed"
                      value={user.email}
                      readOnly
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      className="input pl-10 h-12 text-base"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      className="input pl-10 h-12 text-base pr-24"
                      type="password"
                      minLength={8}
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="flex items-center space-x-1">
                        {form.newPassword.length >= 8 && (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className="text-xs text-gray-500">
                          {form.newPassword.length}/8
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
