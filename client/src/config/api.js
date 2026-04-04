/**
 * Production: set VITE_API_URL at build time to your backend origin only, e.g.
 *   VITE_API_URL=https://zenith-4hjz.onrender.com
 * (no trailing slash; /api is added automatically)
 *
 * Local dev: leave VITE_API_URL unset to use "/api" with the Vite proxy (vite.config.js).
 */
function resolveApiBase() {
  const env = import.meta.env.VITE_API_URL?.trim();
  if (!env) return '/api';
  let base = env.replace(/\/$/, '');
  if (!base.endsWith('/api')) base = `${base}/api`;
  return base;
}

export const API_URL = resolveApiBase();

/** Backend origin without /api (for Socket.IO, etc.) */
export function getBackendOrigin() {
  if (API_URL === '/api') {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  if (API_URL.endsWith('/api')) return API_URL.slice(0, -4);
  return API_URL;
}

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.trim() || getBackendOrigin() || 'http://localhost:5000';
