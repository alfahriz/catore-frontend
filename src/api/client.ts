import axios from 'axios';
import { useAuthStore } from '../lib/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5062/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Access token cuma umur 15 menit (Jwt:AccessTokenExpiryMinutes, backend) — tanpa refresh flow,
// user ke-force-logout tiap 15 menit pemakaian aktif (ketemu user 2026-09-18, keluhan "sesi
// abis kelewat sering", ganggu banget kalau lagi nulis draft/mau submit). `refreshToken` sendiri
// udah lama disimpan di authStore tapi gak pernah dipakai — sekarang dipakai di sini.
//
// `refreshPromise` di-share antar request 401 yg nyaris bersamaan (mis. Homepage nembak 5 API call
// paralel, semua kena 401 barengan krn access token expired di tengah) — TANPA ini, tiap request
// bakal manggil /auth/refresh sendiri-sendiri, refresh token ROTASI di endpoint (token lama
// diganti tiap panggil), jadi cuma request PERTAMA yg sukses, sisanya dapet refresh token yg
// sudah tidak valid lagi (race). Modul-level singleton promise ini jadi lock: request 401 kedua
// dst nunggu promise yg sama, bukan mulai refresh baru.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const currentRefreshToken = useAuthStore.getState().refreshToken;
  if (!currentRefreshToken) return null;

  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: currentRefreshToken });
    const { accessToken, refreshToken } = res.data;
    useAuthStore.getState().setTokens(accessToken, refreshToken);
    return accessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // `_retry` flag nyegah infinite loop — kalau REQUEST YG SUDAH DI-RETRY (bukan yg pertama kali)
    // masih kena 401 lagi (refresh token-nya sendiri ternyata invalid/expired), jangan coba refresh
    // lagi, langsung logout. Guard `originalRequest` ada (bukan error network murni tanpa config).
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      // Refresh token juga invalid/expired (mis. 30 hari gak buka app sama sekali) — di sinilah
      // logout paksa BENERAN terjadi, bukan tiap 15 menit lagi.
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    // 401 tanpa originalRequest (jarang) atau retry kedua yg masih gagal — logout langsung,
    // pola lama sebelum refresh flow ada.
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
