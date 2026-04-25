'use client';

import axios from 'axios';

export const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api',
});

const TOKEN_KEY = 'agency.token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      setToken(null);
    }
    return Promise.reject(err);
  },
);

export function apiErrorMessage(err: unknown): string {
  const e = err as any;
  const msg = e?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg || e?.message || 'Something went wrong';
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Return full URL with backend base URL (uploads are served at /uploads/, not /api/uploads/)
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return {
    url: `${backendUrl}${response.data.url}`
  };
}
